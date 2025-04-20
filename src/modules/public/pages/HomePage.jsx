import { useEffect, useState } from 'react'
import { HeroSection, HomeCarousel, HomeSection, ProductCarousel } from '../components/home-page/index.js'
import { SkeletonHero, SkeletonCarousel } from '../components/skeletons/index.js'
import '../../../styles/global.css'
import './../../public/styles/homepage.css'
import './../../public/styles/skeletons.css'
import { heroImages } from '../../../shared/constants/images.js'
import { getCollectionImages } from '../../admin/services/collectionsService.js'
import { ContentService } from '../../admin/services/contentService.js'
import { getFeaturedProductsForHome } from '../../admin/services/productService.js'
import { getFeaturedCategoriesForHome } from '../../admin/services/categoryService.js'

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
 * - Soporte para navegación al hacer clic en productos y categorías.
 * - Carga de contenido personalizado para la página 'home'.
 * - Soporte para colecciones de imágenes en hero y carrusel de granja.
 * - Fallback a datos de muestra cuando no hay datos en Firestore.
 * - Orden dinámico de las secciones, según configuración almacenada o por defecto.
 */
export const HomePage = () => {
  // ---------------------- STATE ----------------------
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collectionImages, setCollectionImages] = useState({})
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [featuredCategories, setFeaturedCategories] = useState([])

  // ---------------------- FALLBACK DATA ----------------------
  // Imágenes de muestra para secciones de carrusel (OurFarmSection).
  const sampleImages = [
    { id: 1, src: '/public/images/placeholder.jpg', alt: 'Farm 1' },
    { id: 2, src: '/public/images/placeholder.jpg', alt: 'Farm 2' },
    { id: 3, src: '/public/images/placeholder.jpg', alt: 'Farm 3' },
  ]

  // Productos de muestra por si no hay productos reales.
  const sampleProducts = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `sample-product-${i + 1}`,
      name: `Producto ${i + 1}`,
      image: '/public/images/placeholder.jpg',
      price: 25 + i,
      category: 'Muestra',
    }))

  // Categorías de muestra por si no hay categorías reales.
  const sampleCategories = Array(6)
    .fill(null)
    .map((_, i) => ({
      id: `sample-category-${i + 1}`,
      name: `Categoría ${i + 1}`,
      image: '/public/images/placeholder.jpg',
    }))

  // ---------------------- EFFECTS ----------------------
  /**
   * Función para cargar los datos de la página
   */
  useEffect(() => {
    const loadPageData = async () => {
      try {
        // setLoading(true) ya no es necesario aquí si el estado inicial es true

        // 1. Cargar datos principales en paralelo
        const contentServicePromise = ContentService.getPageContent('home', 'published')
          .catch((err) => {
            console.error('Error cargando contenido de la página:', err)
            return { ok: false, error: err, data: null }
          })

        const results = await Promise.allSettled([ // Usar allSettled para manejar errores individuales
          getFeaturedProductsForHome().catch(err => ({ ok: false, error: err, data: [] })),
          getFeaturedCategoriesForHome().catch(err => ({ ok: false, error: err, data: [] })),
          contentServicePromise,
        ])

        // Procesar resultados individuales
        const productsResult = results[0];
        const categoriesResult = results[1];
        const contentResult = results[2];

        if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
          setFeaturedProducts(productsResult.value.data);
        } else {
          console.error('Error cargando productos destacados:', productsResult.reason || productsResult.value?.error);
        }

        if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
          setFeaturedCategories(categoriesResult.value.data);
        } else {
          console.error('Error cargando categorías destacadas:', categoriesResult.reason || categoriesResult.value?.error);
        }

        let pageContentData = null;
        if (contentResult.status === 'fulfilled' && contentResult.value?.ok && contentResult.value?.data) {
          pageContentData = contentResult.value.data;
          setPageData(pageContentData);

          // 3. Cargar imágenes de colecciones (si es necesario)
          const heroSection = pageContentData.sections?.hero;
          const farmCarouselSection = pageContentData.sections?.farmCarousel;
          const collectionPromises = [];

          if (heroSection?.useCollection && heroSection?.collectionId && !collectionImages[heroSection.collectionId]) {
            collectionPromises.push(loadCollectionImages(heroSection.collectionId));
          }
          if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId && !collectionImages[farmCarouselSection.collectionId]) {
            collectionPromises.push(loadCollectionImages(farmCarouselSection.collectionId));
          }

          if (collectionPromises.length > 0) {
            await Promise.allSettled(collectionPromises);
          }
        } else {
          if (contentResult.status === 'rejected' || contentResult.value?.error) {
            console.warn('No se pudo cargar el contenido de la página:', contentResult.reason || contentResult.value?.error);
          } else {
            console.warn('No se encontró contenido publicado para la página home.');
          }
          setPageData(null);
        }

      } catch (error) {
        console.error('Error inesperado durante la carga de datos de la página:', error);
        setPageData(null);
        setFeaturedProducts([]); // Asegurar reseteo en error general
        setFeaturedCategories([]);
      } finally {
        // Importante: Poner setLoading(false) en el finally
        // para asegurar que se oculte el skeleton incluso si hay errores.
        setLoading(false);
      }
    }

    loadPageData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ---------------------- HELPERS ----------------------
  /**
   * Carga las imágenes de una colección (por ID) usando getCollectionImages().
   * Almacena los **datos completos** de cada imagen en `collectionImages` state
   * para poder acceder a `resizedUrls` posteriormente.
   */
  const loadCollectionImages = async (collectionId) => {
    if (!collectionId) return
    if (collectionImages[collectionId]) return // evitar carga repetida

    try {
      const result = await getCollectionImages(collectionId)
      if (result.ok && Array.isArray(result.data)) {
        // Guardar los datos completos de las imágenes, no solo formateados
        setCollectionImages((prev) => ({
          ...prev,
          [collectionId]: result.data, // Guardar el array de datos completos
        }))
        return { ok: true, data: result.data } // Devolver éxito y datos completos
      } else {
        // Si result.ok es falso o data no es array
        console.warn(`No se pudieron cargar imágenes válidas para la colección ${collectionId}.`)
        setCollectionImages((prev) => ({ ...prev, [collectionId]: [] })) // Marcar como cargada (vacía)
        return { ok: false, error: 'No valid images found' }
      }
    } catch (error) {
      console.error(`Error cargando imágenes de la colección ${collectionId}:`, error)
      setCollectionImages((prev) => ({ ...prev, [collectionId]: [] })) // Marcar como cargada (vacía) con error
      return { ok: false, error }
    }
  }

  /**
   * Renderiza la página por defecto cuando no hay datos personalizados
   * o para usuarios no autenticados que no pueden acceder a los datos
   */
  const renderDefaultPage = () => (
    <>
      {/* Hero section como fallback cuando no hay datos de la API */}
      <HeroSection
        title="Bienvenido a Cactilia"
        subtitle="Descubre nuestros productos naturales"
        ctaText="Ver productos"
        ctaLink="/shop"
        images={heroImages}
      />

      {/* Products section como fallback */}
      <HomeSection
        title="Productos destacados"
        subtitle="Descubre nuestra selección de productos destacados"
        bgColor="var(--bg-light)"
      >
        <ProductCarousel
          products={featuredProducts.length > 0 ? featuredProducts : sampleProducts}
          link="/shop"
          linkText="Ver todos los productos"
        />
      </HomeSection>

      {/* Categories section como fallback */}
      <HomeSection
        title="Explora nuestras categorías"
        subtitle="Encuentra lo que buscas en nuestras categorías principales"
      >
        <ProductCarousel
          products={featuredCategories.length > 0 ? featuredCategories : sampleCategories}
          link="/shop"
          linkText="Ver todas las categorías"
          isCategories={true}
        />
      </HomeSection>
    </>
  )

  // --- FUNCIÓN AUXILIAR PARA SELECCIONAR URL POR TAMAÑO ---
  const getImageUrlBySize = (imgData, desiredSize = 'medium') => {
    if (!imgData) return null;

    const resized = imgData.resizedUrls; // Mapa { '1200x1200': '...', '600x600': '...', ... }
    // Intentar obtener la URL original de .url o .src
    const originalUrl = imgData.url || imgData.src; 

    // Asegurar que las claves coincidan con las generadas (_WxH.ext -> WxH)
    const largeKey = '1200x1200';
    const mediumKey = '600x600';
    const smallKey = '200x200';

    switch (desiredSize) {
      case 'original':
        return originalUrl;
      case 'large': 
        return (resized && resized[largeKey]) || originalUrl;
      case 'medium': 
        return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
      case 'small': 
        return (resized && resized[smallKey]) || (resized && resized[mediumKey]) || originalUrl;
      default: // Default a mediano si el tamaño no es válido o no se especifica
        console.warn(`Tamaño de imagen no reconocido o no especificado: '${desiredSize}'. Usando tamaño mediano por defecto.`);
        return (resized && resized[mediumKey]) || (resized && resized[largeKey]) || originalUrl;
    }
  };
  // --- FIN FUNCIÓN AUXILIAR ---

  // ---------------------- RENDER ----------------------
  // Si estamos cargando los datos iniciales (contenido de la página)
  if (loading) {
    return (
      <>
        <SkeletonHero />
        {/* Mostrar dos carruseles skeleton como ejemplo */}
        <SkeletonCarousel count={4} />
        <SkeletonCarousel count={4} />
      </>
    )
  }

  // Si después de cargar, no hay datos de página o estructura inválida, usar la versión por defecto
  // Esto actúa como fallback si la carga del contenido principal falla.
  if (!pageData || !pageData.sections) {
    console.warn('No hay datos de página o estructura inválida, usando la versión predeterminada.')
    return renderDefaultPage() // Mantenemos esto como fallback final
  }

  // Extraemos sections y blockOrder (si existe)
  const { sections, blockOrder } = pageData

  // Si no hay secciones definidas, también se usa la página por defecto
  if (!sections) {
    console.warn('La estructura de datos no es correcta, usando la versión predeterminada')
    return renderDefaultPage()
  }

  // Determinar el orden de renderización
  const renderOrder = Array.isArray(blockOrder) && blockOrder.length > 0
    ? blockOrder
    : Object.keys(sections)

  // Renderizar las secciones en el orden especificado
  return (
    <div className="home-section">
      {renderOrder.map((sectionId) => {
        if (!sections[sectionId]) return null

        const sectionData = sections[sectionId]

        switch (sectionId) {
          case 'hero': {
            const heroConfig = sectionData || {}
            const collectionId = heroConfig.collectionId
            const useCollection = heroConfig.useCollection
            // Leer el tamaño deseado, default a 'large' para Hero (o 'original' si lo prefieres)
            const desiredSize = heroConfig.imageSize || 'large'; 

            // Obtener los datos completos de la imagen de la colección
            const fullImageData = (useCollection && collectionId && collectionImages[collectionId])
                ? collectionImages[collectionId]
                : []

            // Comprobar si la colección aún se está cargando
            const collectionIsLoading = useCollection && collectionId && !collectionImages.hasOwnProperty(collectionId);
            // console.log(`Hero - Collection ${collectionId} loading: ${collectionIsLoading}, Data available: ${fullImageData.length > 0}`)
           
            let heroUrlsToShow = []
            if (useCollection && fullImageData.length > 0) {
                // Usar la función auxiliar para obtener la URL del tamaño deseado para cada imagen
                heroUrlsToShow = fullImageData
                    .map(imgData => getImageUrlBySize(imgData, desiredSize)) // Pasa el objeto completo
                    .filter(Boolean); // Quita nulos si getImageUrlBySize falla
            } else if (heroConfig.backgroundImage) {
                heroUrlsToShow = [heroConfig.backgroundImage]
            } else {
                heroUrlsToShow = heroImages
            }
            // Fallback final si todo falla
            if (heroUrlsToShow.length === 0 && !collectionIsLoading) heroUrlsToShow = heroImages; 

            if (collectionIsLoading) {
              return <div key={sectionId} style={{
                height: heroConfig.height || '100vh',
                background: '#e0e0e0',
              }} />
            }

            return (
              <HeroSection
                key={sectionId}
                images={heroUrlsToShow}
                title={heroConfig.title || 'Bienvenido a Cactilia'}
                subtitle={
                  heroConfig.subtitle ||
                  'Productos frescos y naturales para una vida mejor'
                }
                showButton={heroConfig.showButton !== false}
                buttonText={heroConfig.buttonText || 'Conoce Más'}
                buttonLink={heroConfig.buttonLink || '#'}
                showLogo={heroConfig.showLogo !== false}
                showSubtitle={heroConfig.showSubtitle !== false}
                height={heroConfig.height || '100vh'}
                autoRotate={heroConfig.autoRotate !== false}
                interval={heroConfig.interval || 5000}
              />
            )
          }

          case 'featuredProducts': {
            // Mostrar skeleton si no hay productos reales aún
            if (featuredProducts.length === 0) {
              // **RECOMENDACIÓN:** Reemplaza esto con tu componente CarouselSkeleton.
              return <div key={sectionId} style={{
                minHeight: '400px',
                background: '#f5f5f5', // Gris más claro
              }} />
            }
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
                    featuredProducts.length > 0 ? featuredProducts : sampleProducts // Usa samples solo si featured está vacío
                  }
                  isCategory={false}
                />
              </HomeSection>
            )
          }

          case 'farmCarousel': {
            const farmConfig = sectionData || {}
            const collectionId = farmConfig.collectionId
            const useCollection = farmConfig.useCollection
            // Leer tamaño deseado para carrusel, default a 'medium'
            const desiredSize = farmConfig.imageSize || 'medium'

            // Obtener datos completos de la colección
            const fullImageData = (useCollection && collectionId && collectionImages[collectionId])
                ? collectionImages[collectionId]
                : []

            // Comprobar si la colección aún se está cargando
            const collectionIsLoading = useCollection && collectionId && !collectionImages.hasOwnProperty(collectionId);
            // console.log(`Farm - Collection ${collectionId} loading: ${collectionIsLoading}, Data available: ${fullImageData.length > 0}`)

            let farmImagesToShow = []
            if (useCollection && fullImageData.length > 0) {
                farmImagesToShow = fullImageData.map(imgData => ({
                    // Mantener id y alt si existen, o generar fallbacks
                    id: imgData.id || imgData.name, // Usar name como fallback para id
                    alt: imgData.alt || imgData.name || `Imagen de la colección`, // Usar name como fallback para alt
                    // Usar la función auxiliar para obtener la URL del tamaño deseado
                    src: getImageUrlBySize(imgData, desiredSize) // Pasar el objeto completo
                })).filter(img => img.src); // Filtrar si no se encontró URL válida
            }
            // Usar imágenes de muestra como fallback si no hay colección o falla la carga
            if (farmImagesToShow.length === 0 && !collectionIsLoading) farmImagesToShow = sampleImages;

            if (collectionIsLoading) {
              // Renderizar skeleton.
              return <div key={sectionId} style={{
                minHeight: '400px',
                background: '#f5f5f5',
              }} />
            }

            // Renderizar la sección con las imágenes correctas (thumbnails medianos)
            return (
              <HomeSection
                key={sectionId}
                title={farmConfig.title || 'Nuestro Huerto'}
                subtitle={
                  farmConfig.subtitle ||
                  'Descubre la belleza y frescura de nuestra granja.'
                }
                icon={farmConfig.icon || 'bi-tree-fill'}
                showBg={farmConfig.showBg !== false}
                spacing="py-6"
                height="min-vh-75"
              >
                <HomeCarousel images={farmImagesToShow} />
              </HomeSection>
            )
          }

          case 'productCategories': {
            // Mostrar skeleton si no hay categorías reales aún
            if (featuredCategories.length === 0) {
              // **RECOMENDACIÓN:** Reemplaza esto con tu componente CarouselSkeleton.
              return <div key={sectionId} style={{
                minHeight: '400px',
                background: '#f5f5f5', // Gris más claro
              }} />
            }
            return (
              <HomeSection
                key={sectionId}
                title={sectionData.title || 'Descubre Nuestros Productos'}
                subtitle={
                  sectionData.subtitle ||
                  'Explora por categorías.'
                }
                icon={sectionData.icon || 'bi-box-seam'}
                showBg={sectionData.showBg === true}
                spacing="py-6"
                height="min-vh-75"
              >
                <ProductCarousel
                  products={
                    featuredCategories.length > 0 ? featuredCategories : sampleCategories // Usa samples solo si featured está vacío
                  }
                  isCategory={true}
                />
              </HomeSection>
            )
          }

          default:
            console.warn(`Sección desconocida encontrada: ${sectionId}`)
            return null
        }
      })}
    </div>
  )
}