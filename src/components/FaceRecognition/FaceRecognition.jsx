/* eslint-disable react/prop-types */
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, boxes, message }) => {
    return (
        <div className='center ma'>
          <div className='absolute mt2'>
            {imageUrl && <img id='inputimage' src={imageUrl} alt='Uploaded photo' width='500px' height='auto' />}
            {boxes.map((box, i) => (
              <div
                key={i}
                className='bounding-box'
                style={{
                  top: box.topRow,
                  right: box.rightCol,
                  bottom: box.bottomRow,
                  left: box.leftCol,
                }}
              ></div>
            ))}
            {message && <p className='f4'>{message}</p>}
          </div>
        </div>
      );
}

export default FaceRecognition;
