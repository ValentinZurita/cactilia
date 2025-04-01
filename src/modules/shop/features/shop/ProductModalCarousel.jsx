import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../../shop/styles/productModalCarousel.css';

/**
 * ProductImageCarousel Component - Versión mejorada
 *
 * Muestra un carrusel compacto con imágenes del producto
 * Optimizado para manejar 1 o más imágenes correctamente
 *
 * @param {Array} images - Lista de URLs de imágenes
 * @param {Function} onSelectImage - Función para seleccionar una imagen
 */
export const ProductImageCarousel = ({ images, onSelectImage }) => {
  // Validación de imágenes
  if (!images || images.length === 0) {
    return null;
  }

  // Si solo hay una imagen, mostrar un diseño simplificado
  if (images.length === 1) {
    return (
      <div className="prod-carousel__single-image">
        <div
          className="prod-carousel__image-wrapper"
          onClick={() => onSelectImage(images[0])}
        >
          <img
            src={images[0]}
            alt="Imagen del producto"
            className="prod-carousel__image"
          />
        </div>
      </div>
    );
  }

  // Para múltiples imágenes, mostrar el carrusel completo
  return (
    <div className="prod-carousel__container">
      <Swiper
        modules={[Navigation, Pagination]}
        className="prod-carousel__swiper"
        spaceBetween={15}
        slidesPerView={images.length < 3 ? images.length : 3}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
          el: '.swiper-pagination'
        }}
        grabCursor={true}
        loop={images.length >= 4}
        breakpoints={{
          320: {
            slidesPerView: 2,
            spaceBetween: 10
          },
          480: {
            slidesPerView: images.length < 3 ? images.length : 3,
            spaceBetween: 15
          }
        }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div
              className="prod-carousel__image-wrapper"
              onClick={() => onSelectImage(img)}
            >
              <img
                src={img}
                alt={`Imagen ${index + 1}`}
                className="prod-carousel__image"
              />
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-button-next"></div>
        <div className="swiper-button-prev"></div>
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
};