// src/modules/admin/components/contact-editor/FormSectionEditor.jsx
import { useState } from 'react';

/**
 * Editor para la sección de formulario de contacto
 *
 * @param {Object} data - Datos actuales de la sección
 * @param {Function} onUpdate - Función para actualizar los datos
 * @returns {JSX.Element}
 */
export const FormSectionEditor = ({ data = {}, onUpdate }) => {

  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  return (
    <div className="form-section-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Configuración General</h6>

        {/* Mostrar formulario */}
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showForm"
            checked={data.showForm !== false}
            onChange={() => handleToggleChange('showForm')}
          />
          <label className="form-check-label" htmlFor="showForm">
            Mostrar formulario de contacto
          </label>
        </div>

        {/* Título del formulario */}
        {data.showForm !== false && (
          <div className="mb-3">
            <label htmlFor="formTitle" className="form-label">Título del formulario</label>
            <input
              type="text"
              className="form-control"
              id="formTitle"
              value={data.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Ej: Envíanos un mensaje"
            />
          </div>
        )}
      </div>

      {data.showForm !== false && (
        <>
          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Campos del Formulario</h6>

            {/* Mostrar campo de nombre */}
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showNameField"
                checked={data.showNameField !== false}
                onChange={() => handleToggleChange('showNameField')}
              />
              <label className="form-check-label" htmlFor="showNameField">
                Mostrar campo de nombre
              </label>
            </div>

            {/* Mostrar campo de email */}
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showEmailField"
                checked={data.showEmailField !== false}
                onChange={() => handleToggleChange('showEmailField')}
              />
              <label className="form-check-label" htmlFor="showEmailField">
                Mostrar campo de email
              </label>
            </div>

            {/* Mostrar campo de teléfono */}
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showPhoneField"
                checked={data.showPhoneField !== false}
                onChange={() => handleToggleChange('showPhoneField')}
              />
              <label className="form-check-label" htmlFor="showPhoneField">
                Mostrar campo de teléfono
              </label>
            </div>

            {/* Mostrar campo de asunto */}
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showSubjectField"
                checked={data.showSubjectField !== false}
                onChange={() => handleToggleChange('showSubjectField')}
              />
              <label className="form-check-label" htmlFor="showSubjectField">
                Mostrar campo de asunto
              </label>
            </div>

            {/* Mostrar campo de mensaje */}
            <div className="form-check form-switch mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showMessageField"
                checked={data.showMessageField !== false}
                onChange={() => handleToggleChange('showMessageField')}
              />
              <label className="form-check-label" htmlFor="showMessageField">
                Mostrar campo de mensaje
              </label>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Personalización del Botón</h6>

            {/* Texto del botón */}
            <div className="mb-3">
              <label htmlFor="buttonText" className="form-label">Texto del botón</label>
              <input
                type="text"
                className="form-control"
                id="buttonText"
                value={data.buttonText || ''}
                onChange={(e) => handleChange('buttonText', e.target.value)}
                placeholder="Ej: Enviar mensaje"
              />
            </div>

            {/* Color del botón */}
            <div className="mb-3">
              <label htmlFor="buttonColor" className="form-label">Color del botón</label>
              <div className="input-group">
                <input
                  type="color"
                  className="form-control form-control-color"
                  id="buttonColor"
                  value={data.buttonColor || '#34C749'}
                  onChange={(e) => handleChange('buttonColor', e.target.value)}
                  title="Elige un color para el botón"
                />
                <input
                  type="text"
                  className="form-control"
                  value={data.buttonColor || '#34C749'}
                  onChange={(e) => handleChange('buttonColor', e.target.value)}
                  placeholder="#34C749"
                />
              </div>
              <div className="form-text">Puedes ingresar un código de color hexadecimal (ej: #34C749)</div>
            </div>
          </div>

          <div className="mb-4">
            <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Texto Legal</h6>

            {/* Texto de privacidad */}
            <div className="mb-3">
              <label htmlFor="privacyText" className="form-label">Texto de privacidad</label>
              <textarea
                className="form-control"
                id="privacyText"
                value={data.privacyText || ''}
                onChange={(e) => handleChange('privacyText', e.target.value)}
                placeholder="Ej: Al enviar este formulario, aceptas nuestra política de privacidad."
                rows="2"
              />
              <div className="form-text">Deja vacío para no mostrar texto de privacidad.</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};