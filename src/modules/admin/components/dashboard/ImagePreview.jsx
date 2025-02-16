

/**
 * ImagePreview.jsx - Image preview component for the admin dashboard
 * It displays a list of images with the main image highlighted.
 *
 * @param {Object} props
 * @param {string[]} props.images - The list of image URLs.
 * @param {string} props.mainImage - The main image URL.
 * @param {Function} props.onRemove - Function to call when an image is removed.
 * @param {Function} props.onSetMain - Function to call when an image is set as main.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <ImagePreview images={images} mainImage={mainImage} onRemove={removeImage} onSetMain={setMainImage} />
 */



export const ImagePreview = ({ images, mainImage, onRemove, onSetMain }) => {
  return (

    <div className="d-flex flex-wrap gap-3 my-2">

      {/* Map over the images */}
      {images.filter(Boolean).map(({ file, previewUrl }, index) => (

        // Image container
        <div key={index} className="position-relative">

          {/* Image */}
          <img
            src={previewUrl}
            alt={file?.name || `Image-${index}`}
            style={{ width: 120, height: 120, objectFit: 'cover', cursor: 'pointer' }}
            className={`img-thumbnail ${previewUrl === mainImage ? 'border border-primary border-3' : ''}`}
            onClick={() => onSetMain(previewUrl)}
            title="Clic para establecer como principal"
          />

          {/* Main image badge */}
          {previewUrl === mainImage && (
            <div className="position-absolute top-0 start-0 text-white px-1 text-xl">
              ⭐
            </div>
          )}

          {/* Remove button */}
          <button
            type="button"
            className="btn btn-sm btn-danger position-absolute top-0 end-0"
            onClick={() => onRemove(previewUrl)}
          >
            <i className="bi bi-x-lg text-white"></i>
          </button>

        </div>
      ))}
    </div>
  );
};