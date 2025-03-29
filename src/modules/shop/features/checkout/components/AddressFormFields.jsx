import React from 'react';
import PropTypes from 'prop-types';
import { MEXICO_STATES } from '../constants/locationData';

/**
 * Componente reutilizable para los campos de un formulario de dirección
 * Puede ser usado tanto en el formulario de nueva dirección temporal
 * como en formularios de dirección permanente
 *
 * @param {Object} props
 * @param {Object} props.formData - Datos del formulario
 * @param {Object} props.errors - Errores de validación
 * @param {Function} props.handleChange - Manejador de cambios
 * @param {Function} props.handleBlur - Manejador de blur para validación
 */
export const AddressFormFields = ({
                                    formData,
                                    errors,
                                    handleChange,
                                    handleBlur
                                  }) => {
  return (
    <div className="row g-3">
      {/* Nombre de la dirección */}
      <div className="col-12">
        <label htmlFor="address-name" className="form-label">
          Nombre de la dirección
        </label>
        <input
          type="text"
          id="address-name"
          name="name"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          value={formData.name || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ej. Casa, Oficina, etc."
          required
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        <small className="text-muted">Un nombre para identificar esta dirección</small>
      </div>

      {/* Calle */}
      <div className="col-md-8">
        <label htmlFor="address-street" className="form-label">
          Calle
        </label>
        <input
          type="text"
          id="address-street"
          name="street"
          className={`form-control ${errors.street ? 'is-invalid' : ''}`}
          value={formData.street || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Nombre de la calle"
          required
        />
        {errors.street && <div className="invalid-feedback">{errors.street}</div>}
      </div>

      {/* Número exterior */}
      <div className="col-md-2">
        <label htmlFor="address-numExt" className="form-label">
          No. Ext
        </label>
        <input
          type="text"
          id="address-numExt"
          name="numExt"
          className={`form-control ${errors.numExt ? 'is-invalid' : ''}`}
          value={formData.numExt || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ext."
        />
        {errors.numExt && <div className="invalid-feedback">{errors.numExt}</div>}
      </div>

      {/* Número interior */}
      <div className="col-md-2">
        <label htmlFor="address-numInt" className="form-label">
          No. Int
        </label>
        <input
          type="text"
          id="address-numInt"
          name="numInt"
          className={`form-control ${errors.numInt ? 'is-invalid' : ''}`}
          value={formData.numInt || ''}
          onChange={handleChange}
          placeholder="Int."
        />
      </div>

      {/* Colonia */}
      <div className="col-md-6">
        <label htmlFor="address-colonia" className="form-label">
          Colonia
        </label>
        <input
          type="text"
          id="address-colonia"
          name="colonia"
          className={`form-control ${errors.colonia ? 'is-invalid' : ''}`}
          value={formData.colonia || ''}
          onChange={handleChange}
          placeholder="Colonia o fraccionamiento"
        />
      </div>

      {/* Ciudad */}
      <div className="col-md-6">
        <label htmlFor="address-city" className="form-label">
          Ciudad
        </label>
        <input
          type="text"
          id="address-city"
          name="city"
          className={`form-control ${errors.city ? 'is-invalid' : ''}`}
          value={formData.city || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ciudad"
          required
        />
        {errors.city && <div className="invalid-feedback">{errors.city}</div>}
      </div>

      {/* Estado */}
      <div className="col-md-6">
        <label htmlFor="address-state" className="form-label">
          Estado
        </label>
        <select
          id="address-state"
          name="state"
          className={`form-select ${errors.state ? 'is-invalid' : ''}`}
          value={formData.state || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        >
          <option value="">Selecciona un estado</option>
          {MEXICO_STATES.map(state => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>
        {errors.state && <div className="invalid-feedback">{errors.state}</div>}
      </div>

      {/* Código Postal */}
      <div className="col-md-6">
        <label htmlFor="address-zip" className="form-label">
          Código Postal
        </label>
        <input
          type="text"
          id="address-zip"
          name="zip"
          className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
          value={formData.zip || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="C.P."
          maxLength="5"
          pattern="[0-9]{5}"
          required
        />
        {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
      </div>

      {/* Referencias */}
      <div className="col-12">
        <label htmlFor="address-references" className="form-label">
          Referencias (opcional)
        </label>
        <textarea
          id="address-references"
          name="references"
          className="form-control"
          value={formData.references || ''}
          onChange={handleChange}
          placeholder="Referencias para facilitar la entrega"
          rows="2"
        ></textarea>
        <small className="text-muted">
          Ej. "Casa azul con portón negro", "Frente al parque"
        </small>
      </div>
    </div>
  );
};

AddressFormFields.propTypes = {
  formData: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleBlur: PropTypes.func.isRequired
};