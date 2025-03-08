// Importar editores, vistas previas y esquemas de bloques
import { HeroSliderEditor } from './HeroSlider/Editor';
import { HeroSliderPreview } from './HeroSlider/Preview';
import { heroSliderSchema } from './HeroSlider/schema';
import { registerBlockType } from '../../../utilis/blockRegistry.js'

// Importaciones para otros tipos de bloques
// import { TextBlockEditor } from './TextBlock/Editor';
// import { TextBlockPreview } from './TextBlock/Preview';
// import { textBlockSchema } from './TextBlock/schema';

// ... y así sucesivamente para cada tipo de bloque

/**
 * Registra todos los tipos de bloques disponibles
 * Esta función debe llamarse al inicializar la aplicación
 */
export const registerAllBlockTypes = () => {
  // Registrar bloque Hero Slider
  registerBlockType('hero-slider', {
    title: 'Slider Hero',
    icon: 'bi-images',
    editor: HeroSliderEditor,
    preview: HeroSliderPreview,
    schema: heroSliderSchema
  });

  // Registrar bloque de Texto
  // registerBlockType('text-block', {
  //   title: 'Bloque de Texto',
  //   icon: 'bi-file-text',
  //   editor: TextBlockEditor,
  //   preview: TextBlockPreview,
  //   schema: textBlockSchema
  // });

  // ... y así sucesivamente para cada tipo de bloque

  // Ejemplo de registrar un bloque simple sin componentes personalizados
  registerBlockType('featured-products', {
    title: 'Productos Destacados',
    icon: 'bi-star-fill',
    // Usar componentes genéricos (se implementarían más tarde)
    editor: null,
    preview: null,
    schema: {
      title: { type: 'text', label: 'Título de sección' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      icon: { type: 'text', label: 'Icono (clases Bootstrap)' },
      showBg: { type: 'toggle', label: 'Mostrar fondo' },
      maxProducts: { type: 'number', label: 'Número de productos' },
      filterByFeatured: { type: 'toggle', label: 'Mostrar solo destacados' }
    }
  });

  // Registrar otros tipos básicos para completar el sistema
  registerBlockType('image-carousel', {
    title: 'Carrusel de Imágenes',
    icon: 'bi-card-image'
  });

  registerBlockType('product-categories', {
    title: 'Categorías de Productos',
    icon: 'bi-grid'
  });

  registerBlockType('text-block', {
    title: 'Bloque de Texto',
    icon: 'bi-file-text'
  });

  registerBlockType('call-to-action', {
    title: 'Llamada a la Acción',
    icon: 'bi-megaphone'
  });

  // Registro de tipos experimentales o en desarrollo
  registerBlockType('testimonials', {
    title: 'Testimonios',
    icon: 'bi-chat-quote',
    experimental: true
  });

  console.log('🧩 Todos los tipos de bloques han sido registrados');
};

// Exportar también los componentes individuales para casos especiales
export { HeroSliderEditor, HeroSliderPreview, heroSliderSchema };
// export { TextBlockEditor, TextBlockPreview, textBlockSchema };
// ... y así sucesivamente