import { heroImages } from '../../../../shared/constants/images.js'

// Contenido de muestra para elementos visuales
export const sampleImages = [
  { id: 1, src: '/public/images/placeholder.jpg', alt: 'Farm 1' },
  { id: 2, src: '/public/images/placeholder.jpg', alt: 'Farm 2' },
  { id: 3, src: '/public/images/placeholder.jpg', alt: 'Farm 3' },
]

export const sampleProducts = Array(6).fill(null).map((_, i) => ({
  id: i + 1,
  name: `Producto ${i + 1}`,
  image: '/public/images/placeholder.jpg',
}))

// Categorías de muestra
export const sampleCategories = Array(6).fill(null).map((_, i) => ({
  id: i + 1,
  name: `Categoría ${i + 1}`,
  image: '/public/images/placeholder.jpg',
}))

// Configuración de bloques por tipo
export const blockConfig = {


  // Configuración del bloque de carrusel de imágenes
  'hero-slider': {
    component: 'HeroSection',
    defaultProps: {
      title: 'Bienvenido a Cactilia',
      subtitle: 'Productos frescos y naturales para una vida mejor',
      showButton: true,
      buttonText: 'Conoce Más',
      buttonLink: '#',
      showLogo: true,
      showSubtitle: true,
      height: '100vh',
      autoRotate: true,
      interval: 5000,
      images: heroImages,
    },
    extraProps: {
      // Función para obtener imágenes del hero
      getImages: (block) => {
        if (block.useCollection) {
          if (Array.isArray(block.collectionImages) && block.collectionImages.length)
            return block.collectionImages
          if (Array.isArray(block.images) && block.images.length)
            return block.images
        }
        return block.mainImage ? [block.mainImage] : heroImages
      },
    },
  },


  // Configuración del bloque de productos destacados
  'featured-products': {
    component: 'HomeSection',
    defaultProps: {
      title: 'Productos Destacados',
      subtitle: 'Explora nuestra selección especial.',
      icon: 'bi-star-fill',
      showBg: false,
      spacing: 'py-6',
      height: 'min-vh-75',
    },
    children: 'ProductCarousel',
    childrenProps: {
      products: sampleProducts,
    },
  },

  // Configuración del bloque de carrusel de imágenes
  'image-carousel': {
    component: 'HomeSection',
    defaultProps: {
      title: 'Nuestro Huerto',
      subtitle: 'Descubre la belleza y frescura de nuestra granja.',
      icon: 'bi-tree-fill',
      showBg: true,
      spacing: 'py-6',
      height: 'min-vh-75',
    },
    children: 'HomeCarousel',
    childrenProps: {
      images: sampleImages,
    },
  },

  // Configuración del bloque de categorías de productos
  'product-categories': {
    component: 'HomeSection',
    defaultProps: {
      title: 'Descubre Nuestros Productos',
      subtitle: 'Explora nuestras categorías destacadas.',
      icon: 'bi-box-seam',
      showBg: false,
      spacing: 'py-6',
      height: 'min-vh-75',
    },
    children: 'ProductCarousel',
    childrenProps: {
      products: sampleCategories, // Usamos categorías en lugar de productos
    },
  },


  // Configuración del bloque de texto
  'text-block': {
    component: 'CustomTextBlock',
    defaultProps: {
      title: '',
      content: '',
      alignment: 'center',
      showBg: false,
    },
  },


  // Configuración del bloque de llamado a la acción
  'call-to-action': {
    component: 'CustomCTABlock',
    defaultProps: {
      title: 'Llamado a la Acción',
      subtitle: 'Subtítulo descriptivo',
      buttonText: 'Botón de Acción',
      buttonLink: '#',
      alignment: 'center',
      backgroundImage: '',
    },
  },
}


// Orden predeterminado de los bloques en la página
export const defaultBlockOrder = [
  'hero-slider',
  'featured-products',
  'image-carousel',
  'product-categories',
  'text-block',
  'call-to-action',
]