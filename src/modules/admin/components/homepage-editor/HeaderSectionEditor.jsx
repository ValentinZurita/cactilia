// src/modules/admin/components/contact-editor/HeaderSectionEditor.jsx
import { useState } from 'react';
import { MediaSelector } from '../media/index.js';

/**
 * Editor para la sección de encabezado de la página de contacto
 *
 * @param {Object} data - Datos actuales de la sección
 * @param {Function} onUpdate - Función para actualizar los datos
 * @returns {JSX.Element}
 */
export const HeaderSectionEditor = ({ data = {}, onUpdate }) => {
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  // Abrir selector de medios
  const openMediaSelector = () => {
    setShowMediaSelector(true);
  };

  // Manejar selección de imagen
  const handleMediaSelected = (media) => {
    if (!media) return;

    // Si es un array, usar la primera imagen
    const imageUrl = Array.isArray(media) ? media[0]?.url : media?.url;

    if (imageUrl) {
      onUpdate({ backgroundImage: imageUrl });
    }

    setShowMediaSelector(false);
  };

  return (
    <div className="header-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Contenido del Encabezado</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="contactTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="contactTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Contáctanos"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="contactSubtitle" className="form-label">Subtítulo</label>
          <textarea
            className="form-control"
            id="contactSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo antes posible."
            rows="3"
          />
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Fondo del Encabezado</h6>

        {/* Mostrar fondo */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showBackground"
            checked={data.showBackground !== false}
            onChange={() => handleToggleChange('showBackground')}
          />
          <label className="form-check-label" htmlFor="showBackground">
            Mostrar fondo
          </label>
        </div>

        {/* Imagen de fondo */}
        {data.showBackground !== false && (
          <div className="mb-3">
            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 mb-2">
              <button
                type="button"
                className="btn btn-outline-primary w-100 w-sm-auto"
                onClick={openMediaSelector}
              >
                <i className="bi bi-image me-2"></i>
                {data.backgroundImage ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </button>

              {data.backgroundImage && (
                <button
                  type="button"
                  className="btn btn-outline-danger w-100 w-sm-auto"
                  onClick={() => handleChange('backgroundImage', '')}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Eliminar imagen
                </button>
              )}
            </div>

            {data.backgroundImage ? (
              <div className="bg-light p-2 rounded">
                <img
                  src={data.backgroundImage}
                  alt="Background"
                  className="img-fluid rounded"
                  style={{ maxHeight: '150px' }}
                />
              </div>
            ) : (
              <div className="text-muted border rounded p-3 text-center bg-light">
                <i className="bi bi-card-image fs-1 d-block mb-2"></i>
                <div className="text-muted">Se usará un fondo claro predeterminado</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selector de medios */}
      <MediaSelector
        isOpen={showMediaSelector}
        onClose={() => setShowMediaSelector(false)}
        onSelect={handleMediaSelected}
        title="Seleccionar Imagen de Fondo"
      />
    </div>
  );
};