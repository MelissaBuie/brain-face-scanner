import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// Files MediaPipe needs at runtime. The WASM version matches the installed package.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

// The model is made for selfie-style photos, so it misses small faces in group
// photos. To find those too, we also scan the photo in smaller overlapping
// squares ("tiles"), then merge the results. Each number is how many tiles fit
// across the short side of the photo.
const TILE_GRIDS = [2, 3, 4];

// Tiles often contain only part of a scene, which makes the model guess more.
// Only trust a face found in a tile if the model is very sure about it.
const TILE_MIN_SCORE = 0.8;

let detectorPromise = null;

// Create the detector once and reuse it for every image.
export function getFaceDetector() {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(WASM_URL).then((vision) =>
      FaceDetector.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: 'IMAGE',
        minDetectionConfidence: 0.5,
      })
    );
    // Let a failed load (for example, no network) be retried next time.
    detectorPromise.catch(() => {
      detectorPromise = null;
    });
  }
  return detectorPromise;
}

// Run the detector on one part of the photo and return boxes in full-photo pixels.
function detectInRegion(detector, image, canvas, x, y, size) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, x, y, size, size, 0, 0, size, size);
  return detector.detect(canvas).detections.map((d) => ({
    x: d.boundingBox.originX + x,
    y: d.boundingBox.originY + y,
    width: d.boundingBox.width,
    height: d.boundingBox.height,
    score: d.categories[0]?.score ?? 0,
  }));
}

// How much two boxes overlap, compared with the smaller one (0 = not at all, 1 = fully).
function overlap(a, b) {
  const w = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.min(a.width * a.height, b.width * b.height);
}

// The same face is often found in several tiles. Keep the most confident box
// for each face and drop the others.
export function mergeBoxes(boxes) {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept = [];
  for (const box of sorted) {
    if (!kept.some((k) => overlap(k, box) > 0.4)) kept.push(box);
  }
  return kept;
}

// Find every face in the photo, in full-size photo pixels.
export function findAllFaces(detector, image) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const boxes = detector.detect(image).detections.map((d) => ({
    x: d.boundingBox.originX,
    y: d.boundingBox.originY,
    width: d.boundingBox.width,
    height: d.boundingBox.height,
    score: d.categories[0]?.score ?? 0,
  }));

  const canvas = document.createElement('canvas');
  for (const grid of TILE_GRIDS) {
    const size = Math.floor(Math.min(width, height) / grid);
    if (size < 64) break; // too small for the model to see anything
    const step = Math.floor(size / 2); // tiles overlap by half
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const tx = Math.min(x, width - size);
        const ty = Math.min(y, height - size);
        boxes.push(
          ...detectInRegion(detector, image, canvas, tx, ty, size).filter(
            (box) => box.score >= TILE_MIN_SCORE
          )
        );
        if (tx === width - size) break;
      }
      if (Math.min(y, height - size) === height - size) break;
    }
  }
  return mergeBoxes(boxes);
}

// Turn photo pixel boxes into positions on the image as it is shown on screen.
export function toScreenBoxes(faces, image) {
  const scaleX = image.width / image.naturalWidth;
  const scaleY = image.height / image.naturalHeight;
  return faces.map((face) => {
    const left = face.x * scaleX;
    const top = face.y * scaleY;
    return {
      leftCol: left,
      topRow: top,
      rightCol: image.width - (left + face.width * scaleX),
      bottomRow: image.height - (top + face.height * scaleY),
    };
  });
}

export async function detectFaces(image) {
  const detector = await getFaceDetector();
  return toScreenBoxes(findAllFaces(detector, image), image);
}
