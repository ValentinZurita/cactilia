import React from 'react';

/**
 * HomeCarousel Component
 *
 * Componente responsivo para carrusel de imágenes usando solo clases de Bootstrap.
 * Garantiza que todas las imágenes mantengan proporciones consistentes.
 *
 * @param {Array} images - Array de objetos de imagen con `id`, `src`, y `alt`.
 */
export const HomeCarousel = React.memo(({ images }) => {
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
        className="carousel slide carousel-fade mx-auto"
        data-bs-ride="carousel"
      >
        {/* Carousel Indicadores */}
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
              <div className="d-flex justify-content-center align-items-center" style={{ height: '100%' }}>
                <div style={{
                  width: '100%',
                  maxWidth: '900px',
                  height: '400px',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '0.5rem'
                }}>
                  <img
                    src={image.src}
                    className="position-absolute"
                    alt={image.alt || `Imagen ${index + 1}`}
                    style={{
                      top: '0',
                      left: '0',
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
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
});

HomeCarousel.displayName = 'HomeCarousel';