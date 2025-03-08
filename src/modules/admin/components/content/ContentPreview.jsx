import { BlockPreviewFactory } from './common/BlockPreviewFactory.jsx'


/**
 * Vista previa del contenido completo
 * Renderiza todos los bloques en modo preview
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.blocks - Lista de bloques a previsualizar
 * @param {boolean} props.loading - Si está cargando
 * @param {string} props.error - Mensaje de error (si existe)
 * @param {boolean} [props.isPreview=true] - Si es modo preview (escala reducida)
 * @returns {JSX.Element}
 */
export const ContentPreview = ({ blocks = [], loading = false, error = null, isPreview = true }) => {
  // Mostrar mensaje si está cargando
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando vista previa...</p>
      </div>
    );
  }

  // Mostrar mensaje si hay error
  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        Error: {error}
      </div>
    );
  }

  // Mostrar mensaje si no hay bloques
  if (blocks.length === 0) {
    return (
      <div className="text-center py-5 bg-light rounded">
        <i className="bi bi-layout-text-window fs-1 text-muted mb-3 d-block"></i>
        <h5 className="text-muted">No hay bloques para mostrar</h5>
        <p className="text-muted">Añade bloques de contenido para ver la vista previa</p>
      </div>
    );
  }

  // Renderizar bloques en orden
  return (
    <div className="content-preview">
      {blocks.map((block) => (
        <div key={block.id} className="mb-4">
          <BlockPreviewFactory block={block} isPreview={isPreview} />
        </div>
      ))}
    </div>
  );
};