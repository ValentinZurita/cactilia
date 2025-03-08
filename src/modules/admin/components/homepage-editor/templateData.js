import { heroImages } from "../../../../shared/constants/images";

/**
 * Datos de plantillas predefinidas para la página de inicio
 */
export const templatesData = [
  {
    id: 'default',
    name: 'Plantilla Clásica',
    description: 'Diseño clásico con hero, productos destacados, carrusel y categorías.',
    thumbnail: '/public/images/templates/template-classic.jpg'
  },
  {
    id: 'modern',
    name: 'Plantilla Moderna',
    description: 'Diseño moderno con enfoque visual en productos y categorías.',
    thumbnail: '/public/images/templates/template-modern.jpg'
  }
];

/**
 * Plantilla predeterminada para la página de inicio
 * Esta plantilla refleja exactamente el diseño original de la página
 */
export const DEFAULT_TEMPLATE = {
  templateId: 'default',
  sections: {
    hero: {
      title: 'Bienvenido a Cactilia',
      subtitle: 'Productos frescos y naturales para una vida mejor',
      showButton: true,
      buttonText: 'Conoce Más',
      buttonLink: '#',
      backgroundImage: '',
      showLogo: true,
      showSubtitle: true,
      height: '100vh',
      autoRotate: true,
      interval: 5000
    },
    featuredProducts: {
      title: 'Productos Destacados',
      subtitle: 'Explora nuestra selección especial.',
      icon: 'bi-star-fill',
      showBg: false
    },
    farmCarousel: {
      title: 'Nuestro Huerto',
      subtitle: 'Descubre la belleza y frescura de nuestra granja.',
      icon: 'bi-tree-fill',
      showBg: true
    },
    productCategories: {
      title: 'Descubre Nuestros Productos',
      subtitle: 'Productos orgánicos de alta calidad para una vida mejor.',
      icon: 'bi-box-seam',
      showBg: false
    }
  },
  settings: {
    colors: {
      primary: '#34C749',
      secondary: '#212529'
    }
  }
};

/**
 * Plantilla moderna alternativa
 * Ofrece un diseño diferente pero usando los mismos componentes
 */
export const MODERN_TEMPLATE = {
  templateId: 'modern',
  sections: {
    hero: {
      title: 'Cactilia',
      subtitle: 'Productos orgánicos para un estilo de vida saludable',
      showButton: true,
      buttonText: 'Explorar',
      buttonLink: '#',
      backgroundImage: '',
      showLogo: true,
      showSubtitle: true,
      height: '75vh',
      autoRotate: true,
      interval: 4000
    },
    productCategories: {
      title: 'Categorías',
      subtitle: 'Explora nuestra variedad de productos',
      icon: 'bi-grid',
      showBg: false
    },
    featuredProducts: {
      title: 'Lo más vendido',
      subtitle: 'Nuestros productos estrella',
      icon: 'bi-award',
      showBg: true
    },
    farmCarousel: {
      title: 'De la granja a tu mesa',
      subtitle: 'Conoce nuestro proceso de cultivo',
      icon: 'bi-flower1',
      showBg: false
    }
  },
  settings: {
    colors: {
      primary: '#28a745',
      secondary: '#343a40'
    }
  }
};

/**
 * Función para obtener una plantilla por su ID
 * @param {string} templateId - ID de la plantilla
 * @returns {Object} - Datos de la plantilla o la predeterminada si no se encuentra
 */
export const getTemplateById = (templateId) => {
  switch (templateId) {
    case 'modern':
      return MODERN_TEMPLATE;
    case 'default':
    default:
      return DEFAULT_TEMPLATE;
  }
};