import { useState } from 'react';

/**
 * Editor component for customizing contact form fields and subject options
 *
 * @param {Object} props
 * @param {Object} props.data - Current form configuration
 * @param {Function} props.onUpdate - Callback when configuration is updated
 * @returns {JSX.Element}
 */
export const FormFieldsEditor = ({ data = {}, onUpdate }) => {
  // Local state for new subject options
  const [newSubjectOption, setNewSubjectOption] = useState('');

  // Default subject options if none provided
  const subjectOptions = data.subjectOptions || [
    "Consulta general",
    "Soporte técnico",
    "Ventas",
    "Otro"
  ];

  /**
   * Handles changes to form field visibility toggles
   * @param {string} field - Field name to toggle
   */
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] });
  };

  /**
   * Handles text input changes
   * @param {string} field - Field name to update
   * @param {string} value - New field value
   */
  const handleChange = (field, value) => {
    onUpdate({ [field]: value });
  };

  /**
   * Adds a new subject option to the dropdown
   */
  const handleAddSubjectOption = () => {
    if (!newSubjectOption.trim()) return;

    const updatedOptions = [...subjectOptions, newSubjectOption.trim()];
    onUpdate({ subjectOptions: updatedOptions });
    setNewSubjectOption('');
  };

  /**
   * Removes a subject option from the dropdown
   * @param {number} index - Index of the option to remove
   */
  const handleRemoveSubjectOption = (index) => {
    const updatedOptions = subjectOptions.filter((_, i) => i !== index);
    onUpdate({ subjectOptions: updatedOptions });
  };

  /**
   * Handles pressing Enter key in the new subject option input
   * @param {Event} e - Keyboard event
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubjectOption();
    }
  };

  return (
    <div className="form-fields-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Campos del Formulario</h6>

        {/* Field toggles */}
        <div className="row mb-3">
          <div className="col-md-6">
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
                Campo de nombre
              </label>
            </div>

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
                Campo de email
              </label>
            </div>
          </div>

          <div className="col-md-6">
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
                Campo de teléfono
              </label>
            </div>

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
                Campo de mensaje
              </label>
            </div>
          </div>
        </div>

        {/* Subject field section */}
        <div className="card bg-light border-0 p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0 fw-bold">Campo de Asunto</h6>

            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="showSubjectField"
                checked={data.showSubjectField !== false}
                onChange={() => handleToggleChange('showSubjectField')}
              />
              <label className="form-check-label" htmlFor="showSubjectField">
                Mostrar
              </label>
            </div>
          </div>

          {data.showSubjectField !== false && (
            <div className="subject-options mt-3">
              <label className="form-label">Opciones del menú desplegable:</label>

              {/* List of current subject options */}
              {subjectOptions.length > 0 ? (
                <ul className="list-group mb-3">
                  {subjectOptions.map((option, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      {option}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveSubjectOption(index)}
                        aria-label={`Eliminar opción ${option}`}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted fst-italic mb-3">
                  No hay opciones configuradas. Añade al menos una opción.
                </p>
              )}

              {/* Add new subject option */}
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nueva opción..."
                  value={newSubjectOption}
                  onChange={(e) => setNewSubjectOption(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleAddSubjectOption}
                  disabled={!newSubjectOption.trim()}
                >
                  <i className="bi bi-plus-lg me-1"></i>
                  Añadir
                </button>
              </div>
              <small className="form-text text-muted">
                Presiona Enter o haz clic en Añadir para agregar una nueva opción.
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Button customization section */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Personalización del Botón</h6>

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

      {/* Privacy text section */}
      <div className="mb-4">
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Texto Legal</h6>

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
    </div>
  );
};