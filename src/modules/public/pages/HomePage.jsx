import { HeroSection, ProductCarousel, HomeSection, HomeCarousel } from '../components/home-page/index.js'
import '../../../styles/global.css'
import { heroImages } from '../../../shared/constants/images.js';

const images = [
  { id: 1, src: "/public/images/placeholder.jpg", alt: "Farm 1" },
  { id: 2, src: "/public/images/placeholder.jpg", alt: "Farm 2" },
  { id: 3, src: "/public/images/placeholder.jpg", alt: "Farm 3" }
];

const products = [
  { id: 1, name: 'Vegetables', image: '/public/images/placeholder.jpg' },
  { id: 2, name: 'Edible Flowers', image: '/public/images/placeholder.jpg' },
  { id: 3, name: 'Product 3', image: '/public/images/placeholder.jpg' },
  { id: 4, name: 'Product 4', image: '/public/images/placeholder.jpg' },
  { id: 5, name: 'Product 5', image: '/public/images/placeholder.jpg' },
  { id: 6, name: 'Product 6', image: '/public/images/placeholder.jpg' },
];


export const HomePage = () => {
  return (
    <div className="home-section">

      {/* HeroSection */}
      <HeroSection
        images={heroImages} // 🔥 Múltiples imágenes
        title="Bienvenido a Cactilia"
        subtitle="Productos frescos y naturales para una vida mejor"
        showButton={true}
        height="100vh"
        autoRotate={true} // 🔥 Activamos el carrusel
        interval={5000} // 🔥 Cambia cada 5 segundos
      />

      {/* Categorias */}
      <HomeSection
        title="Productos Destacados"
        subtitle="Explora nuestra selección especial."
        icon="bi-star-fill"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={products} />
      </HomeSection>

      {/* OurFarmSection */}
      <HomeSection
        title="Nuestro Huerto"
        subtitle="Descubre la belleza y frescura de nuestra granja."
        icon="bi-tree-fill"
        showBg={true}
        spacing="py-6"
        height="min-vh-75"
      >
        <HomeCarousel images={images} />
      </HomeSection>

      {/* Productos Destacados */}
      <HomeSection
        title="Descubre Nuestros Productos"
        subtitle="Productos orgánicos de alta calidad para una vida mejor."
        icon="bi-box-seam"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel products={products}/>
      </HomeSection>

    </div>
  );
};