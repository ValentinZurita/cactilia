import { useState, useEffect } from 'react';
import {
  HeroSection,
  ProductCarousel,
  HomeSection,
  HomeCarousel,
} from '../components/home-page/index.js';
import '../../../styles/global.css';
import { heroImages } from '../../../shared/constants/images.js';
import { getCollectionImages } from '../../admin/services/collectionsService.js';
import { ContentService } from '../../admin/services/contentService.js';
import { getProducts } from '../../admin/services/productService.js';
import { getCategories } from '../../admin/services/categoryService.js';

/**
 * HomePage
 *
 * Página principal que muestra diferentes secciones (Hero, Productos Destacados,
 * Carrusel de Granjas, Categorías, etc.) con datos cargados desde Firestore
 * (o datos de muestra como fallback).
 *
 * Características:
 * - Carga de productos destacados desde la base de datos.
 * - Carga de categorías destacadas desde la base de datos.
 * - Carga de contenido personalizado para la página 'home'.
 * - Soporte para colecciones de imágenes en hero y carrusel de granja.
 * - Fallback a datos de muestra cuando no hay datos en Firestore.
 * - Orden dinámico de las secciones, según configuración almacenada o por defecto.
 */
export const HomePage = () => {
  // ---------------------- STATE ----------------------
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collectionImages, setCollectionImages] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);

  // ---------------------- FALLBACK DATA ----------------------
  // Imágenes de muestra para secciones de carrusel (OurFarmSection).
  const sampleImages = [
    { id: 1, src: '/public/images/placeholder.jpg', alt: 'Farm 1' },
    { id: 2, src: '/public/images/placeholder.jpg', alt: 'Farm 2' },
    { id: 3, src: '/public/images/placeholder.jpg', alt: 'Farm 3' },
  ];

  // Productos de muestra por si no hay productos reales.
  const sampleProducts = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: `Producto ${i + 1}`,
      image: '/public/images/placeholder.jpg',
      price: 25 + i,
      category: 'Muestra',
    }));

  // Categorías de muestra por si no hay categorías reales.
  const sampleCategories = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: i + 1,
      name: `Categoría ${i + 1}`,
      image: '/public/images/placeholder.jpg',
    }));

  // ---------------------- EFFECTS ----------------------
  /**
   * Efecto principal que:
   * 1. Carga productos destacados.
   * 2. Carga categorías destacadas.
   * 3. Obtiene el contenido personalizado de Firestore para la página 'home'.
   * 4. Si el hero o el farmCarousel usan una colección, carga sus imágenes.
   */
  useEffect(() => {
    const loadPageData = async () => {
      try {
        setLoading(true);

        // 1. Cargar productos destacados
        await loadFeaturedProducts();

        // 2. Cargar categorías destacadas
        await loadFeaturedCategories();

        // 3. Cargar contenido de la página
        if (typeof ContentService?.getPageContent !== 'function') {
          console.warn(
            'ContentService no está disponible o no tiene el método getPageContent'
          );
          setPageData(null);
          return;
        }

        const result = await ContentService.getPageContent('home', 'published');

        if (result?.ok && result?.data) {
          setPageData(result.data);

          // 4. Cargar imágenes de colecciones si están configuradas
          const heroSection = result.data.sections?.hero;
          const farmCarouselSection = result.data.sections?.farmCarousel;

          // Cargar colección del hero si está configurada
          if (heroSection?.useCollection && heroSection?.collectionId) {
            loadCollectionImages(heroSection.collectionId);
          }

          // Cargar colección del farmCarousel si está configurada
          if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId) {
            loadCollectionImages(farmCarouselSection.collectionId);
          }
        } else {
          console.log(
            'No se encontraron datos publicados, usando valores predeterminados'
          );
          setPageData(null);
        }
      } catch (error) {
        console.error('Error cargando página:', error);
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, []);

  // ---------------------- HELPERS ----------------------
  /**
   * Carga productos desde el servicio getProducts() y filtra los que sean 'featured'.
   * Si no hay suficientes destacados, se combinan con productos regulares o se
   * duplican para asegurar al menos 6 en el carrusel.
   */
  const loadFeaturedProducts = async () => {
    try {
      const { ok, data, error } = await getProducts();
      if (!ok) {
        console.error('Error cargando productos:', error);
        return;
      }

      // 1. Obtener productos con featured === true
      let featured = data.filter(
        (product) => product.active && product.featured === true
      );

      // 2. Si hay pocos destacados, completarlos con regulares activos
      if (featured.length < 4) {
        const regularProducts = data
          .filter((product) => product.active && !product.featured)
          .slice(0, Math.max(6 - featured.length, 0));
        featured = [...featured, ...regularProducts];

        // 3. Si aún así son pocos, duplicarlos para asegurar un mínimo de 6
        if (featured.length > 0 && featured.length < 6) {
          const originalLength = featured.length;
          for (let i = 0; i < Math.min(6 - originalLength, originalLength); i++) {
            featured.push({
              ...featured[i],
              id: `${featured[i].id}_duplicate_${i}`,
            });
          }
        }
      }

      // Formatear productos para el componente ProductCarousel
      const formattedProducts = featured.map((product) => ({
        id: product.id,
        name: product.name || 'Producto sin nombre',
        image: product.mainImage || '/public/images/placeholder.jpg',
        mainImage: product.mainImage, // se incluye mainImage para fallback en ProductCard
        price: product.price || 0,
        category: product.category || 'Sin categoría',
        stock: product.stock || 0,
        description: product.description || '',
        images: product.images || [],
        featured: product.featured || false,
      }));

      setFeaturedProducts(formattedProducts);
    } catch (error) {
      console.error('Error procesando productos:', error);
    }
  };

  /**
   * Carga categorías desde el servicio getCategories() y filtra las que sean 'featured'.
   * Si no hay suficientes destacadas, se combinan con categorías regulares o se
   * duplican para asegurar al menos 6 en el carrusel.
   */
  const loadFeaturedCategories = async () => {
    try {
      const { ok, data, error } = await getCategories();
      if (!ok) {
        console.error('Error cargando categorías:', error);
        return;
      }

      // 1. Obtener categorías con featured === true
      let featured = data.filter(
        (category) => category.active && category.featured === true
      );

      // 2. Si hay pocas destacadas, completarlas con regulares activas
      if (featured.length < 4) {
        const regularCategories = data
          .filter((category) => category.active && !category.featured)
          .slice(0, Math.max(6 - featured.length, 0));
        featured = [...featured, ...regularCategories];

        // 3. Si aún así son pocas, duplicarlas para asegurar un mínimo de 6
        if (featured.length > 0 && featured.length < 6) {
          const originalLength = featured.length;
          for (let i = 0; i < Math.min(6 - originalLength, originalLength); i++) {
            featured.push({
              ...featured[i],
              id: `${featured[i].id}_duplicate_${i}`,
            });
          }
        }
      }

      // Formatear categorías para el componente ProductCarousel (mismo formato)
      const formattedCategories = featured.map((category) => ({
        id: category.id,
        name: category.name || 'Categoría sin nombre',
        image: category.mainImage || '/public/images/placeholder.jpg',
        mainImage: category.mainImage,
        description: category.description || '',
        images: category.images || [],
        featured: category.featured || false,
      }));

      setFeaturedCategories(formattedCategories);
    } catch (error) {
      console.error('Error procesando categorías:', error);
    }
  };

  /**
   * Carga las imágenes de una colección (por ID) usando getCollectionImages().
   * Se almacena en un objeto para evitar recargar la misma colección varias veces.
   */
  const loadCollectionImages = async (collectionId) => {
    if (!collectionId) return;
    if (collectionImages[collectionId]) return; // evitar carga repetida

    try {
      const result = await getCollectionImages(collectionId);
      if (result.ok && Array.isArray(result.data)) {
        // Formatear imágenes para el componente HomeCarousel
        const formattedImages = result.data.map((item, index) => ({
          id: item.id || `image-${index}`,
          src: item.url,
          alt: item.alt || `Imagen ${index + 1}`
        }));

        setCollectionImages((prev) => ({
          ...prev,
          [collectionId]: formattedImages
        }));
      }
    } catch (error) {
      console.error('Error cargando imágenes de colección:', error);
    }
  };

  /**
   * Retorna imágenes para la sección Hero. Usa imágenes de la colección si está
   * configurado, de lo contrario, usa la imagen de fondo específica o el array
   * heroImages por defecto.
   */
  const getHeroImages = () => {
    const heroConfig = pageData?.sections?.hero || {};
    if (heroConfig.useCollection && heroConfig.collectionId) {
      const collectionId = heroConfig.collectionId;
      if (collectionImages[collectionId]) {
        return collectionImages[collectionId].map(img => img.src);
      }
    }
    if (heroConfig.backgroundImage) {
      return [heroConfig.backgroundImage];
    }
    return heroImages;
  };

  /**
   * Retorna imágenes para el carrusel de granja. Usa imágenes de la colección si está
   * configurado, de lo contrario, usa las imágenes de muestra.
   */
  const getFarmCarouselImages = () => {
    const farmConfig = pageData?.sections?.farmCarousel || {};
    if (farmConfig.useCollection && farmConfig.collectionId) {
      const collectionId = farmConfig.collectionId;
      if (collectionImages[collectionId]) {
        return collectionImages[collectionId];
      }
    }
    return sampleImages;
  };

  /**
   * Renderiza la página por defecto (sin datos personalizados).
   * Incluye sección Hero, productos destacados, carrusel de granja y categorías,
   * todo con datos de muestra o datos locales cargados.
   */
  const renderDefaultPage = () => (
    <div className="home-section">
      {/* HeroSection */}
      <HeroSection
        images={heroImages}
        title="Bienvenido a Cactilia"
        subtitle="Productos frescos y naturales para una vida mejor"
        showButton={true}
        height="100vh"
        autoRotate={true}
        interval={5000}
      />

      {/* Productos Destacados */}
      <HomeSection
        title="Productos Destacados"
        subtitle="Explora nuestra selección especial."
        icon="bi-star-fill"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel
          products={featuredProducts.length > 0 ? featuredProducts : sampleProducts}
        />
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
        <HomeCarousel images={sampleImages} />
      </HomeSection>

      {/* Categorías de Productos */}
      <HomeSection
        title="Descubre Nuestros Productos"
        subtitle="Productos orgánicos de alta calidad para una vida mejor."
        icon="bi-box-seam"
        showBg={false}
        spacing="py-6"
        height="min-vh-75"
      >
        <ProductCarousel
          products={featuredCategories.length > 0 ? featuredCategories : sampleCategories}
        />
      </HomeSection>
    </div>
  );

  // ---------------------- RENDER ----------------------
  // Si estamos cargando datos, no hay contenido personalizado, o la estructura
  // no es válida, usar la página por defecto
  if (!pageData || loading || !pageData.sections) {
    return renderDefaultPage();
  }

  // Extraemos sections y blockOrder (si existe)
  const { sections, blockOrder } = pageData;

  // Si no hay secciones definidas, también se usa la página por defecto
  if (!sections) {
    console.warn('La estructura de datos no es correcta, usando la versión predeterminada');
    return renderDefaultPage();
  }

  // Determinar el orden de renderización (si existe blockOrder, usarlo; si no,
  // usar la clave de cada sección)
  const renderOrder = Array.isArray(blockOrder) && blockOrder.length > 0
    ? blockOrder
    : Object.keys(sections);

  // Renderizar las secciones en el orden especificado
  return (
    <div className="home-section">
      {renderOrder.map((sectionId) => {
        if (!sections[sectionId]) return null;

        const sectionData = sections[sectionId];

        switch (sectionId) {
          case 'hero':
            return (
              <HeroSection
                key={sectionId}
                images={getHeroImages()}
                title={sectionData.title || 'Bienvenido a Cactilia'}
                subtitle={
                  sectionData.subtitle ||
                  'Productos frescos y naturales para una vida mejor'
                }
                showButton={sectionData.showButton !== false}
                buttonText={sectionData.buttonText || 'Conoce Más'}
                buttonLink={sectionData.buttonLink || '#'}
                showLogo={sectionData.showLogo !== false}
                showSubtitle={sectionData.showSubtitle !== false}
                height={sectionData.height || '100vh'}
                autoRotate={sectionData.autoRotate !== false}
                interval={sectionData.interval || 5000}
                useCollection={sectionData.useCollection === true}
                collectionId={sectionData.collectionId}
              />
            );

          case 'featuredProducts':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || 'Productos Destacados'}
                subtitle={
                  sectionData.subtitle || 'Explora nuestra selección especial.'
                }
                icon={sectionData.icon || 'bi-star-fill'}
                showBg={sectionData.showBg === true}
                spacing="py-6"
                height="min-vh-75"
              >
                <ProductCarousel
                  products={
                    featuredProducts.length > 0 ? featuredProducts : sampleProducts
                  }
                />
              </HomeSection>
            );

          case 'farmCarousel':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || 'Nuestro Huerto'}
                subtitle={
                  sectionData.subtitle ||
                  'Descubre la belleza y frescura de nuestra granja.'
                }
                icon={sectionData.icon || 'bi-tree-fill'}
                showBg={sectionData.showBg !== false}
                spacing="py-6"
                height="min-vh-75"
              >
                <HomeCarousel images={getFarmCarouselImages()} />
              </HomeSection>
            );

          case 'productCategories':
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || 'Descubre Nuestros Productos'}
                subtitle={
                  sectionData.subtitle ||
                  'Productos orgánicos de alta calidad para una vida mejor.'
                }
                icon={sectionData.icon || 'bi-box-seam'}
                showBg={sectionData.showBg === true}
                spacing="py-6"
                height="min-vh-75"
              >
                <ProductCarousel
                  products={
                    featuredCategories.length > 0 ? featuredCategories : sampleCategories
                  }
                />
              </HomeSection>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};