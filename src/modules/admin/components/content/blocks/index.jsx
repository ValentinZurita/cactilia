// Importar editores, vistas previas y esquemas de bloques
import { HeroSliderEditor } from './HeroSlider/Editor';
import { HeroSliderPreview } from './HeroSlider/Preview';
import { heroSliderSchema } from './HeroSlider/schema';
import { registerBlockType } from '../../../utilis/blockRegistry.js'

// Componentes genéricos temporales para evitar errores
const GenericBlockEditor = ({ block, onChange }) => (
  <div className="p-3">
    <div className="alert alert-info">
      <i className="bi bi-info-circle me-2"></i>
      Editor en desarrollo para el tipo: <strong>{block.type}</strong>
    </div>
    <div className="mb-3">
      <label className="form-label">Título</label>
      <input
        type="text"
        className="form-control"
        value={block.title || ''}
        onChange={(e) => onChange({ title: e.target.value })}
      />
    </div>
    {block.type === 'text-block' && (
      <div className="mb-3">
        <label className="form-label">Contenido</label>
        <textarea
          className="form-control"
          value={block.content || ''}
          onChange={(e) => onChange({ content: e.target.value })}
        />
      </div>
    )}
  </div>
);

const GenericBlockPreview = ({ block }) => (
  <div className="p-4 text-center bg-light rounded">
    <h4>{block.title || 'Título del bloque'}</h4>
    <p className="text-muted">Vista previa en desarrollo para: {block.type}</p>
    {block.type === 'text-block' && block.content && (
      <div dangerouslySetInnerHTML={{ __html: block.content }} />
    )}
  </div>
);

/**
 * Registra todos los tipos de bloques disponibles
 * Esta función debe llamarse al inicializar la aplicación
 */
export const registerAllBlockTypes = () => {
  console.log('⚠️ Registrando todos los tipos de bloques...');

  // Registrar bloque Hero Slider
  registerBlockType('hero-slider', {
    title: 'Slider Hero',
    icon: 'bi-images',
    editor: HeroSliderEditor,
    preview: HeroSliderPreview,
    schema: heroSliderSchema
  });
  console.log('✅ Bloque hero-slider registrado correctamente');

  // Registrar bloque de Texto
  registerBlockType('text-block', {
    title: 'Bloque de Texto',
    icon: 'bi-file-text',
    editor: GenericBlockEditor,
    preview: GenericBlockPreview,
    schema: {
      title: { type: 'text', label: 'Título de sección' },
      content: { type: 'textarea', label: 'Contenido' },
      alignment: { type: 'select', label: 'Alineación', options: ['left', 'center', 'right'] },
      showBg: { type: 'toggle', label: 'Mostrar fondo' }
    }
  });

  // Productos destacados
  registerBlockType('featured-products', {
    title: 'Productos Destacados',
    icon: 'bi-star-fill',
    editor: GenericBlockEditor,
    preview: GenericBlockPreview,
    schema: {
      title: { type: 'text', label: 'Título de sección' },
      subtitle: { type: 'text', label: 'Subtítulo' },
      icon: { type: 'text', label: 'Icono (clases Bootstrap)' },
      showBg: { type: 'toggle', label: 'Mostrar fondo' },
      maxProducts: { type: 'number', label: 'Número de productos' },
      filterByFeatured: { type: 'toggle', label: 'Mostrar solo destacados' }
    }
  });

  // Carrusel de imágenes
  registerBlockType('image-carousel', {
    title: 'Carrusel de Imágenes',
    icon: 'bi-card-image',
    editor: GenericBlockEditor,
    preview: GenericBlockPreview
  });

  // Categorías de productos
  registerBlockType('product-categories', {
    title: 'Categorías de Productos',
    icon: 'bi-grid',
    editor: GenericBlockEditor,
    preview: GenericBlockPreview
  });

  // Llamada a la acción
  registerBlockType('call-to-action', {
    title: 'Llamada a la Acción',
    icon: 'bi-megaphone',
    editor: GenericBlockEditor,
    preview: GenericBlockPreview
  });

  // Registro de tipos experimentales o en desarrollo
  registerBlockType('testimonials', {
    title: 'Testimonios',
    icon: 'bi-chat-quote',
    experimental: true,
    editor: GenericBlockEditor,
    preview: GenericBlockPreview
  });

  console.log('🧩 Todos los tipos de bloques han sido registrados');
};

// Exportar también los componentes individuales para casos especiales
export { HeroSliderEditor, HeroSliderPreview, heroSliderSchema };