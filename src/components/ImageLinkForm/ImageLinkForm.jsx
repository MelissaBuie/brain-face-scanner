import './ImageLinkForm.css';

// eslint-disable-next-line react/prop-types
const ImageLinkForm = ({ onFileChange, onSubmit, isDetecting }) => {
    return (
        <div>
            <div className="center">
                <div className="form center pa4 br3 shadow-5">
                    <input
                        className="f5 pa2 w-70 center"
                        type="file"
                        accept="image/*"
                        aria-label="Choose a photo"
                        onChange={onFileChange}
                    />
                    <button
                        className="f4 w-30 grow link ph3 pv2 custom-btn"
                        onClick={onSubmit}
                        disabled={isDetecting}
                    >
                        {isDetecting ? 'Detecting…' : 'Detect'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageLinkForm;
