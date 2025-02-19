import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '../../../../styles/pages/shop.css';

/**
 * ProductImageCarousel Component
 *
 * Displays a compact carousel with product images.
 *
 * @param {Array} images - List of image URLs
 * @param onSelectImage
 */
export const ProductImageCarousel = ({ images, onSelectImage}) => {
  if (!images || images.length === 0) {
    return <p className="text-center text-muted">No hay imágenes adicionales</p>;
  }

  return (
    <div className="product-image-carousel-container">
      <Swiper
        modules={[Navigation]}
        className="product-image-swiper"
        loop={true}
        spaceBetween={10}
        slidesPerView={3}
        grabCursor={true}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        style={{ height: '100px' }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <div className="carousel-image-wrapper" onClick={() => onSelectImage(img)}>
              <img
                src={img}
                alt={`Imagen ${index + 1}`}
                className="img-fluid rounded-1"
                style={{ objectFit: 'cover', height: '100%', width: '100%', cursor: 'pointer'}}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </div>
  );
};