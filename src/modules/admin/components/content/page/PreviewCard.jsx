import { ContentPreview } from '../ContentPreview.jsx'

/**
 * PreviewCard: Muestra la tarjeta con "Vista Previa" (ContentPreview).
 * Si deseas, podrías condicionar aquí un "Loading spinner"
 * o un "Error message", etc.
 */
export const PreviewCard = ({ blocks, loading, error }) => {
  return (
    <div className="card mb-4 border-0 shadow-sm">
      <div className="card-header bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Vista Previa</h5>
        <span className="badge bg-secondary">
          <i className="bi bi-eye me-1"></i>
          Previsualización
        </span>
      </div>
      <div className="card-body p-0 bg-light">
        <ContentPreview
          blocks={blocks}
          loading={loading}
          error={error}
          isPreview={true}
        />
      </div>
    </div>
  );
};