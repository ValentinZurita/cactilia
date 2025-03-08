import { v4 as uuidv4 } from 'uuid';

/**
 * Genera un ID único para un bloque
 * @param {string} type - Tipo de bloque
 * @returns {string} - ID generado
 */
export const generateBlockId = (type) => {
  // Asegurarse de que se use el mismo formato que espera el componente
  const safeType = type.replace(/-/g, '_');
  return `block_${safeType}_${uuidv4().substring(0, 8)}`;
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
        showLogo: true,
        showSubtitle: true,
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
        showLogo: true,
        showSubtitle: true,
        createdAt: timestamp,
        mainImage: '/public/images/placeholder.jpg'
      },
      {
        id: generateBlockId('text-block'),
        type: 'text-block',
        title: 'Nuestra Historia',
        content: '<p>Somos una empresa comprometida con la producción y distribución de productos orgánicos de alta calidad. Nuestra misión es ofrecer a nuestros clientes alimentos frescos, saludables y sostenibles que contribuyan a su bienestar y al cuidado del medio ambiente.</p><p>Desde nuestros inicios, hemos trabajado con pasión y dedicación para cultivar cada producto con los más altos estándares de calidad, respetando los ciclos naturales y utilizando técnicas de agricultura sostenible.</p>',
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
        showLogo: true,
        showSubtitle: true,
        createdAt: timestamp,
        mainImage: '/public/images/placeholder.jpg'
      },
      {
        id: generateBlockId('text-block'),
        type: 'text-block',
        title: 'Información de Contacto',
        content: '<div class="row text-center"><div class="col-md-4 mb-4"><i class="bi bi-geo-alt fs-1 text-primary mb-3"></i><h5>Dirección</h5><p>Calle Principal #123<br>Ciudad, País</p></div><div class="col-md-4 mb-4"><i class="bi bi-telephone fs-1 text-primary mb-3"></i><h5>Teléfono</h5><p>(123) 456-7890</p></div><div class="col-md-4 mb-4"><i class="bi bi-envelope fs-1 text-primary mb-3"></i><h5>Email</h5><p>info@cactilia.com</p></div></div>',
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
      content: '<p>Contenido de ejemplo para esta página. Puedes personalizar este contenido según tus necesidades.</p>',
      alignment: 'center',
      showBg: false,
      createdAt: timestamp
    }
  ];
};