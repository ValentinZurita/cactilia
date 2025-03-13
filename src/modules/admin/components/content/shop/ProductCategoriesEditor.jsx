/**
 * Editor para la sección de Categorías de Productos
 * Versión actualizada con toggles unificados
 */
export const ProductCategoriesEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="product-categories-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="categoriesTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="categoriesTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Descubre Nuestros Productos"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="categoriesSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="categoriesSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Productos orgánicos de alta calidad para una vida mejor"
          />
        </div>

        {/* Icono */}
        <div className="mb-3">
          <label htmlFor="categoriesIcon" className="form-label">Icono</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className={`bi ${data.icon || 'bi-box-seam'}`}></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="categoriesIcon"
              value={data.icon || 'bi-box-seam'}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: bi-box-seam"
            />
          </div>
          <div className="form-text">
            Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3">Apariencia</h6>

        {/* Fondo - Ahora con toggle en lugar de checkbox */}
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="categoriesShowBg"
            checked={data.showBg === true}
            onChange={() => handleToggleChange('showBg')}
          />
          <label className="form-check-label" htmlFor="categoriesShowBg">
            Mostrar fondo claro
          </label>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Los productos mostrados se obtienen automáticamente del catálogo.
      </div>
    </div>
  );
};