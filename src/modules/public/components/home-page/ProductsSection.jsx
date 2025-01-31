import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '../../styles/homepage.css';
import { ProductsHeader, ProductCarousel } from './index.js'

/**
 * ProductsSection Component
 *
 * Displays a section highlighting the available products.
 * Includes a title, an icon, a subtitle, and a product carousel.
 *
 * Features:
 * - Reusable section with customizable icon, title, and subtitle.
 * - Integrates a Swiper-based product carousel.
 * - Custom navigation buttons for carousel control.
 *
 * Props:
 * @param {string} icon - Bootstrap icon class name (default: "bi-box-seam").
 */
export const ProductsSection = ({ icon = "bi-box-seam" }) => {
  const products = [
    { id: 1, name: 'Vegetables', image: '../../src/assets/images/placeholder.jpg' },
    { id: 2, name: 'Edible Flowers', image: '../../src/assets/images/placeholder.jpg' },
    { id: 3, name: 'Product 3', image: '../../src/assets/images/placeholder.jpg' },
    { id: 4, name: 'Product 4', image: '../../src/assets/images/placeholder.jpg' },
    { id: 5, name: 'Product 5', image: '../../src/assets/images/placeholder.jpg' },
    { id: 6, name: 'Product 6', image: '../../src/assets/images/placeholder.jpg' },
  ];

  return (
    <section className="home-section position-relative">

      {/* Section header: Icon, title, and subtitle */}
      <ProductsHeader
        icon={icon}
        title="Discover Our Products"
        subtitle="High-quality, organic products for a better life."
      />

      {/* Product carousel container */}
      <div className="container-lg position-relative">
        <div className="mx-auto position-relative" style={{ maxWidth: '1120px' }}>

          {/* Swiper-based product carousel */}
          <ProductCarousel products={products} />

          {/* Custom navigation buttons for Swiper */}
          <button className="swiper-button-prev-custom position-absolute">
            <i className="bi bi-chevron-left"></i>
          </button>

          <button className="swiper-button-next-custom position-absolute">
            <i className="bi bi-chevron-right"></i>
          </button>

        </div>
      </div>
    </section>
  );
};