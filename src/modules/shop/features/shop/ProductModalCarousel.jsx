import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import '../../../shop/styles/productModalCarousel.css';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

/**
 * ProductImageCarousel Component - Versión optimizada
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
          <ImageComponent
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
        modules={[Pagination]}
        className="prod-carousel__swiper"
        spaceBetween={10}
        slidesPerView={3}
        pagination={{
          clickable: true,
          el: '.swiper-pagination'
        }}
        grabCursor={true}
        loop={images.length >= 4}
        breakpoints={{
          320: {
            slidesPerView: 3,
            spaceBetween: 8
          },
          480: {
            slidesPerView: 3,
            spaceBetween: 10
          }
        }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div
              className="prod-carousel__image-wrapper"
              onClick={() => onSelectImage(img)}
            >
              <ImageComponent
                src={img}
                alt={`Imagen ${index + 1}`}
                className="prod-carousel__image"
              />
            </div>
          </SwiperSlide>
        ))}
        <div className="swiper-pagination"></div>
      </Swiper>
    </div>
  );
};