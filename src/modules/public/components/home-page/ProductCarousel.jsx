import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
 * Muestra un carrusel de productos o categorías utilizando Swiper.js.
 * - Soporta loop infinito, autoplay y botones de navegación personalizados.
 * - Ajusta el número de slides visibles según el tamaño de la pantalla.
 *
 * @param {Array} products - Lista de productos o categorías a mostrar.
 * @param {boolean} [isCategory=false] - Indica si los elementos son categorías.
 * @param {function} [onProductClick] - Función a ejecutar cuando se hace clic en una tarjeta, recibe el objeto producto/categoría.
 */
const ProductCarouselComponent = React.memo(({ products, isCategory = false, onProductClick }) => {
  const navigate = useNavigate();

  // --- Optimización con useMemo para displayProducts ---
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return []; // Devolver array vacío si no hay productos
    }

    let calculatedProducts = [...products];
    const largestSlidesPerView = 4; // Basado en tus breakpoints (1024px y 1400px)
    const requiredSlidesForLoop = largestSlidesPerView * 2; // Apuntamos a 8 como mínimo

    if (products.length > 0 && products.length < requiredSlidesForLoop) {
      const originalProducts = [...products];
      while (calculatedProducts.length < requiredSlidesForLoop) {
        // Añadimos copias con IDs únicos para evitar problemas de key en React/Swiper
        const duplicates = originalProducts.map((product, idx) => ({
          ...product,
          // Crear un ID único para cada duplicado en cada iteración
          id: `${product.id}_duplicate_${calculatedProducts.length + idx}`
        }));
        calculatedProducts = [...calculatedProducts, ...duplicates];
      }
    }
    return calculatedProducts;
  }, [products]); // <-- Dependencia: solo recalcula si 'products' cambia
  // --- Fin de useMemo ---

  /**
   * Verifica si no hay productos y retorna un mensaje amigable.
   */
  if (displayProducts.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-muted">No hay {isCategory ? 'categorías' : 'productos'} disponibles</p>
      </div>
    );
  }

  /**
   * Configuración de breakpoints para Swiper.
   * Ajusta cuántos slides se muestran en función del tamaño de pantalla.
   */
  const swiperBreakpoints = {
    320: { slidesPerView: 1.5, spaceBetween: 10 },   // Móviles pequeños
    480: { slidesPerView: 2.5, spaceBetween: 12 },   // Móviles medianos
    768: { slidesPerView: 2.5, spaceBetween: 15 },   // Tablets
    990: { slidesPerView: 3, spaceBetween: 20 },     // Pantallas medianas
    1024: { slidesPerView: 4, spaceBetween: 20 },    // Pantallas grandes
    1400: { slidesPerView: 4, spaceBetween: 30 },    // Pantallas extra grandes
  };

  /**
   * Función de manejo de clic para SwiperSlide
   */
  const handleSlideClick = (itemData, itemIsCategory) => {
    if (itemIsCategory) {
      const originalId = itemData.id.split('_duplicate_')[0]; 
      const categoryName = itemData.name; 
      if (!categoryName) {
          console.error("[ProductCarousel handleSlideClick] Cannot navigate: Category Name is missing.", itemData);
          return;
      }
      navigate('/shop', { state: { preselectCategoryName: categoryName } });
    } else if (onProductClick) {
       onProductClick(itemData); 
    }
  };

  /**
   * Retorno del componente principal:
   * - Envuelve el carrusel de productos en su contenedor principal.
   * - Incluye configuración de autoplay, navegación y loop infinito.
   * - Muestra una SwiperSlide por cada producto de `displayProducts`.
   * - Ahora pasa isCategory a los ProductCard
   */
  return (
    <div className="product-carousel-container">
      {/* Swiper Carousel */}
      <Swiper
        // Módulos de Swiper a utilizar
        modules={[Navigation, Autoplay]}
        className="home-swiper"
        loop
        grabCursor
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        spaceBetween={15}
        breakpoints={swiperBreakpoints}
      >
        {/* Render de slides basado en la lista de productos procesada */}
        {displayProducts.map((product) => (
          <SwiperSlide 
            key={product.id} 
            className="home-product-slide" 
            onClick={() => handleSlideClick(product, isCategory)} 
            style={{ cursor: isCategory ? 'pointer' : (onProductClick ? 'pointer' : 'default')}}
            role={isCategory || onProductClick ? 'button' : undefined}
            tabIndex={isCategory || onProductClick ? 0 : undefined}
            onKeyPress={isCategory || onProductClick ? (e) => e.key === 'Enter' && handleSlideClick(product, isCategory) : undefined}
          >
            <ProductCard
              id={product.id.split('_duplicate_')[0]}
              name={product.name}
              image={product.image || product.mainImage}
              isCategory={isCategory}
              productData={product}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Botones de navegación personalizados */}
      <button className="swiper-button-prev-custom">
        <i className="bi bi-chevron-left"></i>
      </button>
      <button className="swiper-button-next-custom">
        <i className="bi bi-chevron-right"></i>
      </button>
    </div>
  );
});

ProductCarouselComponent.displayName = 'ProductCarousel';

// Exportar por defecto
export default ProductCarouselComponent;