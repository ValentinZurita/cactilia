import { getBlockConfig, getBlockPreview } from '../../../utilis/blockRegistry.js'


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

  // Obtener el componente de vista previa para el tipo de bloque
  const PreviewComponent = getBlockPreview(block.type);

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