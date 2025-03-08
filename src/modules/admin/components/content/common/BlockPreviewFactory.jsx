import { getBlockConfig, getBlockPreview } from '../../../utilis/blockRegistry.js'

import { ImageCarouselPreview } from '../blocks/ImageCarousel/Preview.jsx';
import { ProductCategoriesPreview } from '../blocks/ProductCategories/Preview.jsx';
import { TextBlockPreview } from '../blocks/TextBlock/Preview.jsx';
import { CallToActionPreview } from '../blocks/CallToAction/Preview.jsx';
import { FeaturedProductsPreview } from '../blocks/FeaturedProducts/Preview.jsx'
import { HeroSliderPreview } from '../blocks/index.jsx'

/**
 * Factory para renderizar la vista previa específica para un tipo de bloque
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a previsualizar
 * @param {boolean} [props.isPreview=true] - Si es modo vista previa (tamaño reducido)
 * @returns {JSX.Element}
 */
export const BlockPreviewFactory = ({ block, isPreview = true }) => {

  // Si no hay bloque, mostrar placeholder
  if (!block) {
    return (
      <div className="preview-placeholder p-4 text-center bg-light rounded-3">
        <div className="text-muted">
          <i className="bi bi-eye-slash display-4 d-block mb-3"></i>
          <p>No hay bloques para previsualizar</p>
        </div>
      </div>
    );
  }

  // Mapa directo de tipos de bloques a componentes (para evitar problemas de registro)
  const previewMap = {
    'hero-slider': HeroSliderPreview,
    'featured-products': FeaturedProductsPreview,
    'image-carousel': ImageCarouselPreview,
    'product-categories': ProductCategoriesPreview,
    'text-block': TextBlockPreview,
    'call-to-action': CallToActionPreview
  };

  // Intentar obtener del mapa directo primero
  let PreviewComponent = previewMap[block.type];

  // Si no está en el mapa, intentar obtenerlo del registro
  if (!PreviewComponent) {
    PreviewComponent = getBlockPreview(block.type);
  }

  // Si no hay vista previa para este tipo, mostrar mensaje de error
  if (!PreviewComponent) {
    const blockConfig = getBlockConfig(block.type);
    const blockTitle = blockConfig?.title || block.type;

    return (
      <div className="preview-error p-3 text-center bg-light border rounded-3">
        <div className="text-muted">
          <i className="bi bi-exclamation-triangle-fill fs-4 d-block mb-2"></i>
          <h6>Vista previa no disponible</h6>
          <p className="small mb-0">No se encontró una vista previa para "{blockTitle}"</p>
        </div>
      </div>
    );
  }

  // Renderizar la vista previa específica
  return (
    <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
      <PreviewComponent block={block} isPreview={isPreview} />
    </div>
  );
};