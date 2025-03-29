import React, { useState, useEffect } from 'react';

/**
 * Componente que muestra un formulario para ingresar una nueva dirección
 * durante el proceso de checkout.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onAddressChange - Función que se ejecuta cuando cambian los datos
 * @param {boolean} props.saveAddress - Indica si se debe guardar la dirección para uso futuro
 * @param {Function} props.onSaveAddressChange - Función para actualizar la opción de guardar dirección
 * @param {Object} props.addressData - Datos actuales de la dirección (para edición)
 * @returns {JSX.Element}
 */
export const NewAddressForm = ({
                                 onAddressChange,
                                 saveAddress = false,
                                 onSaveAddressChange,
                                 addressData = {
                                   name: '',
                                   street: '',
                                   numExt: '',
                                   numInt: '',
                                   colonia: '',
                                   city: '',
                                   state: '',
                                   zip: '',
                                   references: '',
                                 }
                               }) => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState(addressData);
  const [errors, setErrors] = useState({});

  // Actualizar el estado cuando cambian las props
  useEffect(() => {
    setFormData(addressData);
  }, [addressData]);

  // Notificar al padre sobre cambios en los datos del formulario
  useEffect(() => {
    if (onAddressChange) {
      onAddressChange(formData);
    }
  }, [formData, onAddressChange]);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validación básica de campos requeridos
  const validateField = (name, value) => {
    if (!value.trim() && ['name', 'street', 'city', 'state', 'zip'].includes(name)) {
      return 'Este campo es requerido';
    }

    if (name === 'zip' && !/^\d{5}$/.test(value)) {
      return 'El código postal debe tener 5 dígitos';
    }

    return null;
  };

  // Validar al perder el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  return (
    <div className="new-address-form">
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
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Ej. Casa, Oficina, etc."
            required
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          <small className="text-muted">Un nombre para identificar esta dirección</small>
        </div>

        {/* Calle y número */}
        <div className="col-md-8">
          <label htmlFor="address-street" className="form-label">
            Calle
          </label>
          <input
            type="text"
            id="address-street"
            name="street"
            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
            value={formData.street}
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
            value={formData.numExt}
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
            value={formData.numInt}
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
            value={formData.colonia}
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
            value={formData.city}
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
            value={formData.state}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          >
            <option value="">Selecciona un estado</option>
            <option value="Aguascalientes">Aguascalientes</option>
            <option value="Baja California">Baja California</option>
            <option value="Baja California Sur">Baja California Sur</option>
            <option value="Campeche">Campeche</option>
            <option value="Chiapas">Chiapas</option>
            <option value="Chihuahua">Chihuahua</option>
            <option value="Ciudad de México">Ciudad de México</option>
            <option value="Coahuila">Coahuila</option>
            <option value="Colima">Colima</option>
            <option value="Durango">Durango</option>
            <option value="Estado de México">Estado de México</option>
            <option value="Guanajuato">Guanajuato</option>
            <option value="Guerrero">Guerrero</option>
            <option value="Hidalgo">Hidalgo</option>
            <option value="Jalisco">Jalisco</option>
            <option value="Michoacán">Michoacán</option>
            <option value="Morelos">Morelos</option>
            <option value="Nayarit">Nayarit</option>
            <option value="Nuevo León">Nuevo León</option>
            <option value="Oaxaca">Oaxaca</option>
            <option value="Puebla">Puebla</option>
            <option value="Querétaro">Querétaro</option>
            <option value="Quintana Roo">Quintana Roo</option>
            <option value="San Luis Potosí">San Luis Potosí</option>
            <option value="Sinaloa">Sinaloa</option>
            <option value="Sonora">Sonora</option>
            <option value="Tabasco">Tabasco</option>
            <option value="Tamaulipas">Tamaulipas</option>
            <option value="Tlaxcala">Tlaxcala</option>
            <option value="Veracruz">Veracruz</option>
            <option value="Yucatán">Yucatán</option>
            <option value="Zacatecas">Zacatecas</option>
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
            value={formData.zip}
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
            value={formData.references}
            onChange={handleChange}
            placeholder="Referencias para facilitar la entrega"
            rows="2"
          ></textarea>
          <small className="text-muted">
            Ej. "Casa azul con portón negro", "Frente al parque"
          </small>
        </div>
      </div>

      {/* Opción para guardar la dirección */}
      <div className="form-check mt-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="saveAddressForFuture"
          checked={saveAddress}
          onChange={(e) => onSaveAddressChange(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="saveAddressForFuture">
          Guardar esta dirección para compras futuras
        </label>
      </div>
    </div>
  );
};