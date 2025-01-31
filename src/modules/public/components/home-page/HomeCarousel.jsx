/**
 * HomeCarousel Component
 *
 * This component renders a responsive image carousel using Bootstrap.
 * It displays a series of farm images with indicators and navigation controls.
 *
 * Features:
 * - Auto-sliding with Bootstrap's `data-bs-ride="carousel"`.
 * - Clickable indicators to navigate between images.
 * - Navigation buttons for previous/next slides.
 * - Supports responsive images with rounded corners.
 *
 * Props:
 * @param {Array} images - Array of image objects with `id`, `src`, and `alt`.
 */

export const HomeCarousel = ({ images }) => {
  return (
    // Carousel wrapper with Bootstrap classes
    <div id="farmCarousel" className="carousel slide mx-auto" data-bs-ride="carousel">

      {/* Carousel Indicators - Clickable dots for navigation */}
      <div className="carousel-indicators">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#farmCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? "active" : ""}
            aria-current={index === 0 ? "true" : undefined}
            aria-label={`Slide ${index + 1}`}
          ></button>
        ))}
      </div>

      {/* Carousel Inner - Holds the actual slides */}
      <div className="carousel-inner">
        {images.map((image, index) => (
          <div key={image.id} className={`carousel-item ${index === 0 ? "active" : ""}`}>
            {/* Carousel Image */}
            <img
              src={image.src}
              className="d-block mx-auto rounded-3 img-fluid farm-carousel-img"
              alt={image.alt}
            />
          </div>
        ))}
      </div>

      {/* Previous Navigation Button */}
      <button className="carousel-control-prev" type="button" data-bs-target="#farmCarousel" data-bs-slide="prev">
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>

      {/* Next Navigation Button */}
      <button className="carousel-control-next" type="button" data-bs-target="#farmCarousel" data-bs-slide="next">
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>

    </div>
  );
};