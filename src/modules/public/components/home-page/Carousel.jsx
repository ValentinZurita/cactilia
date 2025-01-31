/**
 * Bootstrap-based Carousel Component
 *
 * This component renders an image slider using Bootstrap's built-in carousel functionality.
 *
 * Features:
 * - Automatically cycles through images when `data-bs-ride="carousel"` is enabled.
 * - Supports navigation through previous/next buttons.
 * - Uses `carousel-item active` to ensure the first image is displayed initially.
 *
 * Props:
 * @param {Array} images - List of image URLs to be displayed in the carousel.
 */

export const Carousel = ({ images }) => {
  return (
    <div id="farmCarousel" className="carousel slide" data-bs-ride="carousel">

      {/* Carousel Inner - Contains all slides */}
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            {/* Carousel Image */}
            <img src={image} className="d-block w-100" alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </div>

      {/* Previous Button */}
      <button className="carousel-control-prev" type="button" data-bs-target="#farmCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
      </button>

      {/* Next Button */}
      <button className="carousel-control-next" type="button" data-bs-target="#farmCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
      </button>

    </div>
  );
};