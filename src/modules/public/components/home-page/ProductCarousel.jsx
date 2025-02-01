import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ProductCard } from './ProductCard.jsx';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/homepage.css';

/**
 * ProductCarousel Component
 *
 * A responsive product carousel that displays product cards using Swiper.js.
 * It supports infinite looping, autoplay, and custom navigation buttons-and-fields.
 *
 * Features:
 * - Displays a scrollable row of product cards.
 * - Supports responsive breakpoints for different screen sizes.
 * - Enables infinite looping and smooth transitions.
 * - Allows both automatic scrolling and manual navigation.
 *
 * Props:
 * @param {Array} products - List of products to be displayed.
 */
export const ProductCarousel = ({ products }) => {
  return (
    <div className="product-carousel-container">

      {/* Swiper Carousel Component */}
      <Swiper
        modules={[Navigation, Autoplay]} // Enables navigation and autoplay features
        className="home-swiper"
        loop={true} // Enables infinite scrolling
        grabCursor={true} // Provides a "grabbing" cursor effect on hover
        autoplay={{ delay: 5000, disableOnInteraction: false }} // Automatically moves slides
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        spaceBetween={15} // Default space between slides
        breakpoints={{
          320: { slidesPerView: 1.5, spaceBetween: 10 }, // Tiny screens
          480: { slidesPerView: 2, spaceBetween: 15 },
          768: { slidesPerView: 2.5, spaceBetween: 15 }, // Tablets
          990: { slidesPerView: 3, spaceBetween: 20 }, // Medium screens
          1024: { slidesPerView: 4, spaceBetween: 20 }, // Large screens
          1400: { slidesPerView: 4, spaceBetween: 30 }, // Extra large screens
        }}
      >
        {/* Iterates through products array and creates a slide for each product */}
        {products.map((product) => (
          <SwiperSlide key={product.id} className="home-product-slide">
            <ProductCard name={product.name} image={product.image} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      <button className="swiper-button-prev-custom">
        <i className="bi bi-chevron-left"></i>
      </button>

      <button className="swiper-button-next-custom">
        <i className="bi bi-chevron-right"></i>
      </button>

    </div>
  );
};