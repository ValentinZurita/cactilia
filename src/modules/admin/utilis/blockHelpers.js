import { v4 as uuidv4 } from 'uuid'; // Asegúrate de añadir esta dependencia


/**
 * Genera un ID único para un bloque
 * @param {string} type - Tipo de bloque
 * @returns {string} - ID generado
 */
export const generateBlockId = (type) => {
  // Asegurarse de que se use el mismo formato que espera el componente
  const safeType = type.replace(/-/g, '_');
  return `block_${safeType}_${Date.now()}`;
};


/**
 * Crea bloques predeterminados según el tipo de página
 * @param {string} pageType - Tipo de página ('home', 'about', etc.)
 * @returns {Array} - Bloques predeterminados
 */
export const createDefaultBlocks = (pageType) => {
  const timestamp = new Date().toISOString();

  // Bloques predeterminados para la página de inicio
  if (pageType === 'home') {
    return [
      {
        id: generateBlockId('hero-slider'),
        type: 'hero-slider',
        title: 'Bienvenido a Cactilia',
        subtitle: 'Productos frescos y naturales para una vida mejor',
        showButton: true,
        buttonText: 'Conoce Más',
        buttonLink: '#',
        height: '100vh',
        autoRotate: true,
        interval: 5000,
        createdAt: timestamp,
        mainImage: '/public/images/placeholder.jpg'
      },
      {
        id: generateBlockId('featured-products'),
        type: 'featured-products',
        title: 'Productos Destacados',
        subtitle: 'Explora nuestra selección especial.',
        icon: 'bi-star-fill',
        showBg: false,
        maxProducts: 6,
        filterByFeatured: true,
        createdAt: timestamp
      },
      {
        id: generateBlockId('image-carousel'),
        type: 'image-carousel',
        title: 'Nuestro Huerto',
        subtitle: 'Descubre la belleza y frescura de nuestra granja.',
        icon: 'bi-tree-fill',
        showBg: true,
        createdAt: timestamp
      },
      {
        id: generateBlockId('product-categories'),
        type: 'product-categories',
        title: 'Descubre Nuestros Productos',
        subtitle: 'Productos orgánicos de alta calidad para una vida mejor.',
        icon: 'bi-box-seam',
        showBg: false,
        createdAt: timestamp
      }
    ];
  }


  // Bloques predeterminados para la página "Acerca de"
  if (pageType === 'about') {
    return [
      {
        id: generateBlockId('hero-slider'),
        type: 'hero-slider',
        title: 'Acerca de Nosotros',
        subtitle: 'Conozca nuestra historia y valores',
        showButton: false,
        height: '50vh',
        createdAt: timestamp
      },
      {
        id: generateBlockId('text-block'),
        type: 'text-block',
        title: 'Nuestra Historia',
        content: '<p>Aquí va la historia de la empresa...</p>',
        alignment: 'left',
        showBg: false,
        createdAt: timestamp
      },
      {
        id: generateBlockId('call-to-action'),
        type: 'call-to-action',
        title: '¿Quieres saber más?',
        subtitle: 'Contáctanos para conocer más sobre nuestros productos',
        buttonText: 'Contactar',
        buttonLink: '/contact',
        alignment: 'center',
        createdAt: timestamp
      }
    ];
  }


  // Bloques predeterminados para la página de contacto
  if (pageType === 'contact') {
    return [
      {
        id: generateBlockId('hero-slider'),
        type: 'hero-slider',
        title: 'Contáctanos',
        subtitle: 'Estamos aquí para ayudarte',
        showButton: false,
        height: '40vh',
        createdAt: timestamp
      },
      {
        id: generateBlockId('text-block'),
        type: 'text-block',
        title: 'Información de Contacto',
        content: '<p>Dirección: Calle Principal #123<br>Teléfono: (123) 456-7890<br>Email: info@ejemplo.com</p>',
        alignment: 'center',
        showBg: true,
        createdAt: timestamp
      }
    ];
  }

  // Para cualquier otra página, devolver un bloque de texto básico
  return [
    {
      id: generateBlockId('text-block'),
      type: 'text-block',
      title: 'Título de la página',
      content: '<p>Contenido de ejemplo para esta página.</p>',
      alignment: 'center',
      showBg: false,
      createdAt: timestamp
    }
  ];
};


/**
 * Obtiene un valor único para un bloque (para la clave key en React)
 * @param {Object} block - Objeto del bloque
 * @returns {string} - Valor único para la clave
 */
export const getBlockKey = (block) => {
  return block.id || `temp_${Math.random().toString(36).substr(2, 9)}`;
};


/**
 * Obtiene el icono para un tipo de bloque (como fallback)
 * @param {string} blockType - Tipo de bloque
 * @returns {string} - Clase de icono Bootstrap
 */
export const getDefaultBlockIcon = (blockType) => {
  const iconMap = {
    'hero-slider': 'bi-images',
    'featured-products': 'bi-star',
    'image-carousel': 'bi-card-image',
    'product-categories': 'bi-grid',
    'text-block': 'bi-file-text',
    'call-to-action': 'bi-megaphone'
  };


  return iconMap[blockType] || 'bi-puzzle';
};