/**
 * Editor para la sección de Carrusel de Granja
 */
export const FarmCarouselEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="farm-carousel-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="farmTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="farmTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Nuestro Huerto"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="farmSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="farmSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Descubre la belleza y frescura de nuestra granja"
          />
        </div>

        {/* Icono */}
        <div className="mb-3">
          <label htmlFor="farmIcon" className="form-label">Icono</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className={`bi ${data.icon || 'bi-tree-fill'}`}></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="farmIcon"
              value={data.icon || 'bi-tree-fill'}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: bi-tree-fill"
            />
          </div>
          <div className="form-text">
            Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank">Bootstrap Icons</a>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3">Apariencia</h6>

        {/* Fondo */}
        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="farmShowBg"
            checked={data.showBg !== false}
            onChange={() => handleToggleChange('showBg')}
          />
          <label className="form-check-label" htmlFor="farmShowBg">
            Mostrar fondo claro
          </label>
        </div>
      </div>

      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Para gestionar las imágenes del carrusel, usa la sección de Media en el panel de administración.
      </div>
    </div>
  );
};