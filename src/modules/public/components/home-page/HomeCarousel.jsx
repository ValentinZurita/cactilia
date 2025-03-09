/**
 * HomeCarousel Component
 *
 * Componente responsivo para carrusel de imágenes usando solo clases de Bootstrap.
 * No utiliza estilos CSS adicionales ni estilos inline.
 *
 * @param {Array} images - Array de objetos de imagen con `id`, `src`, y `alt`.
 */
export const HomeCarousel = ({ images }) => {
  // Si no hay imágenes, mostrar mensaje
  if (!images || images.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-muted">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="container px-0">
      <div
        id="farmCarousel"
        className="carousel slide mx-auto"
        data-bs-ride="carousel"
      >
        {/* Carousel Indicators */}
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

        {/* Carousel Items */}
        <div className="carousel-inner">
          {images.map((image, index) => (
            <div key={image.id || index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
              <div className="text-center">
                <img
                  src={image.src}
                  className="d-block mx-auto img-fluid rounded-3"
                  alt={image.alt || `Imagen ${index + 1}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Previous Navigation Button */}
        <button className="carousel-control-prev" type="button" data-bs-target="#farmCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Anterior</span>
        </button>

        {/* Next Navigation Button */}
        <button className="carousel-control-next" type="button" data-bs-target="#farmCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Siguiente</span>
        </button>
      </div>
    </div>
  );
};