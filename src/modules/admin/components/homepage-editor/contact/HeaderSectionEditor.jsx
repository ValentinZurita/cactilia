import React from 'react';

/**
 * Editor para la sección de encabezado de la página de contacto
 * (título y subtítulo).
 *
 * @param {Object} props
 * @param {Object} [props.data={}]  - Datos actuales del encabezado.
 * @param {Function} props.onUpdate - Callback para actualizar.
 */
export function HeaderSectionEditor({ data = {}, onUpdate }) {
  function handleChange(field, value) {
    onUpdate({ [field]: value });
  }

  return (
    <div className="header-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Encabezado</h6>
        <div className="mb-3">
          <label className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Título principal"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Subtítulo</label>
          <textarea
            className="form-control"
            rows="2"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Texto de subtítulo"
          />
        </div>
      </div>
    </div>
  );
}
