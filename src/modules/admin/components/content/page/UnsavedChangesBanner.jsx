/**
 * UnsavedChangesBanner: Si hay cambios sin guardar, muestra un banner de aviso.
 * De lo contrario, no renderiza nada.
 */
export const UnsavedChangesBanner = ({ hasUnsavedChanges }) => {
  if (!hasUnsavedChanges) return null;

  return (
    <div className="alert alert-warning mb-3">
      <i className="bi bi-exclamation-triangle me-2"></i>
      Hay cambios sin guardar
    </div>
  );
};