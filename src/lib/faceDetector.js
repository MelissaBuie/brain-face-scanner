import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// Files MediaPipe needs at runtime. The WASM version matches the installed package.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

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

// Turn MediaPipe's pixel boxes (measured on the full-size image) into
// positions on the image as it is shown on screen.
export function toScreenBoxes(detections, image) {
  const scaleX = image.width / image.naturalWidth;
  const scaleY = image.height / image.naturalHeight;
  return detections.map(({ boundingBox }) => {
    const left = boundingBox.originX * scaleX;
    const top = boundingBox.originY * scaleY;
    return {
      leftCol: left,
      topRow: top,
      rightCol: image.width - (left + boundingBox.width * scaleX),
      bottomRow: image.height - (top + boundingBox.height * scaleY),
    };
  });
}

export async function detectFaces(image) {
  const detector = await getFaceDetector();
  const { detections } = detector.detect(image);
  return toScreenBoxes(detections, image);
}
