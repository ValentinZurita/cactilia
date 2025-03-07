import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/homepage.css';

/**
 * HomeCarousel Component
 *
 * Componente mejorado que renderiza un carrusel responsivo de imágenes usando Bootstrap y Swiper.
 * Incluye manejo inteligente del modo loop para evitar advertencias.
 *
 * @param {Array} images - Array de objetos de imagen con `id`, `src` y `alt`.
 * @returns {JSX.Element}
 */
export const HomeCarousel = ({ images = [] }) => {
  // Verificar si hay suficientes imágenes para el modo loop
  const shouldEnableLoop = images.length >= 3;

  // Si no hay imágenes, mostrar mensaje
  if (!images.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted">No hay imágenes disponibles</p>
      </div>
    );
  }

  return (
    <div className="home-carousel-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        className="farm-carousel"
        pagination={{
          clickable: true,
          dynamicBullets: true
        }}
        loop={shouldEnableLoop}
        grabCursor={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          enabled: shouldEnableLoop
        }}
        navigation={{
          nextEl: '.carousel-button-next',
          prevEl: '.carousel-button-prev',
        }}
        slidesPerView={1}
        spaceBetween={20}
      >
        {images.map((image, index) => (
          <SwiperSlide
            key={image.id ? `slide-${image.id}` : `slide-${index}`}
            className="farm-carousel-slide"
          >
            <img
              src={image.src}
              className="d-block mx-auto rounded-3 img-fluid farm-carousel-img"
              alt={image.alt || `Imagen ${index + 1}`}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Mostrar los botones de navegación solo si hay suficientes imágenes para loop */}
      {shouldEnableLoop && (
        <>
          <div className="carousel-button-prev">
            <i className="bi bi-chevron-left"></i>
          </div>
          <div className="carousel-button-next">
            <i className="bi bi-chevron-right"></i>
          </div>
        </>
      )}
    </div>
  );
};