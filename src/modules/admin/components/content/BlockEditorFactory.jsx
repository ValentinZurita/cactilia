/**
 * Factory para renderizar el editor específico para un tipo de bloque
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque a editar
 * @param {Function} props.onUpdate - Función para actualizar el bloque
 * @param {Function} props.onMediaSelect - Función para abrir el selector de medios
 * @returns {JSX.Element}
 */
import { getBlockConfig, getBlockEditor } from '../../utilis/blockRegistry.js'


export const BlockEditorFactory = ({ block, onUpdate, onMediaSelect }) => {

  // Si no hay bloque, mostrar mensaje
  if (!block) {
    return (
      <div className="p-4 text-center bg-light rounded-3">
        <div className="text-muted">
          <i className="bi bi-arrow-left-circle display-4 d-block mb-3"></i>
          <h5>Selecciona un bloque para editar</h5>
          <p>Haz clic en un bloque de la lista o añade uno nuevo</p>
        </div>
      </div>
    );
  }

  // Obtener el editor para el tipo de bloque
  const EditorComponent = getBlockEditor(block.type);

  // Si no hay editor para este tipo, mostrar mensaje de error
  if (!EditorComponent) {
    const blockConfig = getBlockConfig(block.type);
    const blockTitle = blockConfig?.title || block.type;

    return (
      <div className="alert alert-warning">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
          <div>
            <h5 className="mb-1">Editor no disponible</h5>
            <p className="mb-0">
              No se encontró un editor para el tipo de bloque "{blockTitle}".
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar el editor específico pasando las props necesarias
  return (
    <EditorComponent
      block={block}
      onChange={onUpdate}
      onMediaSelect={onMediaSelect}
    />
  );
};