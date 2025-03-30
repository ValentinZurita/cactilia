import PropTypes from 'prop-types';
import { FormField } from './FormField';
import { MEXICO_STATES } from '../constants/locationData';

/**
 * Componente reutilizable para los campos de un formulario de dirección
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
      <div className="col-12">
        <FormField
          id="address-name"
          name="name"
          label="Nombre de la dirección"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ej. Casa, Oficina, etc."
          error={errors.name}
          helpText="Un nombre para identificar esta dirección"
          required
        />
      </div>

      <div className="col-md-8">
        <FormField
          id="address-street"
          name="street"
          label="Calle"
          value={formData.street}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Nombre de la calle"
          error={errors.street}
          required
        />
      </div>

      <div className="col-md-2">
        <FormField
          id="address-numExt"
          name="numExt"
          label="No. Ext"
          value={formData.numExt}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ext."
          error={errors.numExt}
        />
      </div>

      <div className="col-md-2">
        <FormField
          id="address-numInt"
          name="numInt"
          label="No. Int"
          value={formData.numInt}
          onChange={handleChange}
          placeholder="Int."
        />
      </div>

      <div className="col-md-6">
        <FormField
          id="address-colonia"
          name="colonia"
          label="Colonia"
          value={formData.colonia}
          onChange={handleChange}
          placeholder="Colonia o fraccionamiento"
        />
      </div>

      <div className="col-md-6">
        <FormField
          id="address-city"
          name="city"
          label="Ciudad"
          value={formData.city}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ciudad"
          error={errors.city}
          required
        />
      </div>

      <div className="col-md-6">
        <FormField
          id="address-state"
          name="state"
          label="Estado"
          type="select"
          value={formData.state}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.state}
          required
        >
          <option value="">Selecciona un estado</option>
          {MEXICO_STATES.map(state => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </FormField>
      </div>

      <div className="col-md-6">
        <FormField
          id="address-zip"
          name="zip"
          label="Código Postal"
          value={formData.zip}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="C.P."
          error={errors.zip}
          maxLength="5"
          pattern="[0-9]{5}"
          required
        />
      </div>

      <div className="col-12">
        <FormField
          id="address-references"
          name="references"
          label="Referencias (opcional)"
          type="textarea"
          value={formData.references}
          onChange={handleChange}
          placeholder="Referencias para facilitar la entrega"
          helpText='Ej. "Casa azul con portón negro", "Frente al parque"'
          rows="2"
        />
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
