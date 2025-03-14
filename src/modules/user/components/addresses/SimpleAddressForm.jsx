import React, { useState, useEffect } from 'react';
import { SimpleModal } from '../shared/SimpleModal';

// Lista de estados mexicanos
const ESTADOS_MEXICANOS = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas',
  'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit',
  'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí',
  'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
];

/**
 * Formulario mejorado para agregar o editar direcciones en México
 * Incluye campos específicos para direcciones mexicanas
 *
 * El parámetro 'size' en SimpleModal controla el tamaño:
 * - 'sm': pequeño (40% del ancho)
 * - 'md': mediano (60% del ancho) - valor por defecto
 * - 'lg': grande (80% del ancho)
 */
export const SimpleAddressForm = ({ isOpen, onClose, onSave, address = null, loading = false }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    numExt: '',
    numInt: '',
    colonia: '',
    city: '',
    state: '',
    zip: '',
    references: '',
    isDefault: false
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  // Actualizar formulario cuando se recibe una dirección para editar
  useEffect(() => {
    if (isOpen) {
      if (address) {
        // Extraer número exterior e interior de la calle si vienen juntos
        let street = address.street || '';
        let numExt = '';
        let numInt = '';

        // Intentar extraer números si están en formato "Calle #Ext, #Int"
        const streetMatch = street.match(/(.*?)(?:\s+#?(\d+)(?:\s*,\s*#?(\d+))?)?$/);

        if (streetMatch) {
          street = streetMatch[1]?.trim() || '';
          numExt = streetMatch[2] || '';
          numInt = streetMatch[3] || '';
        }

        setFormData({
          name: address.name || '',
          street: street,
          numExt: address.numExt || numExt || '',
          numInt: address.numInt || numInt || '',
          colonia: address.colonia || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          references: address.references || '',
          isDefault: address.isDefault || false
        });
      } else {
        // Resetear formulario para agregar nueva dirección
        setFormData({
          name: '',
          street: '',
          numExt: '',
          numInt: '',
          colonia: '',
          city: '',
          state: '',
          zip: '',
          references: '',
          isDefault: false
        });
      }

      // Limpiar errores al abrir el formulario
      setErrors({});
    }
  }, [address, isOpen]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error del campo cuando el usuario lo modifica
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validar formulario antes de enviarlo
  const validateForm = () => {
    const newErrors = {};

    // Validar campos requeridos
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.street.trim()) newErrors.street = 'La calle es requerida';
    if (!formData.numExt.trim()) newErrors.numExt = 'El número exterior es requerido';
    if (!formData.colonia.trim()) newErrors.colonia = 'La colonia es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!formData.state.trim()) newErrors.state = 'El estado es requerido';
    if (!formData.zip.trim()) newErrors.zip = 'El código postal es requerido';

    // Validar formato de código postal (5 dígitos para México)
    if (formData.zip && !/^\d{5}$/.test(formData.zip.trim())) {
      newErrors.zip = 'El código postal debe tener 5 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm()) return;

    // Preparar datos para guardar
    // Combinar calle con números para compatibilidad con el formato existente
    const addressToSave = {
      ...formData,
      // Mantener el formato original si es necesario para compatibilidad
      street: formData.street + (formData.numExt ? ` #${formData.numExt}` : '') +
        (formData.numInt ? `, Int. ${formData.numInt}` : ''),
      id: address?.id
    };

    onSave(addressToSave);
  };

  // Pie del modal con botones
  const modalFooter = (
    <>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={onClose}
        disabled={loading}
      >
        Cancelar
      </button>
      <button
        type="button"
        className="btn btn-success"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Guardando...
          </>
        ) : (
          address ? 'Actualizar' : 'Guardar'
        )}
      </button>
    </>
  );

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={address ? 'Editar dirección' : 'Agregar dirección'}
      footer={modalFooter}
      size="md" // Añadimos el parámetro de tamaño
    >
      <div>
        {/* Nombre de la dirección */}
        <div className="mb-3">
          <label htmlFor="address-name" className="form-label">Nombre de la dirección</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="address-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ej. Casa, Oficina, Casa de mis padres"
            autoComplete="off"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Calle */}
        <div className="mb-3">
          <label htmlFor="address-street" className="form-label">Calle</label>
          <input
            type="text"
            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
            id="address-street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
            placeholder="Nombre de la calle"
            autoComplete="street-address"
          />
          {errors.street && <div className="invalid-feedback">{errors.street}</div>}
        </div>

        {/* Fila con Número Exterior e Interior */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="address-numExt" className="form-label">Número Exterior</label>
            <input
              type="text"
              className={`form-control ${errors.numExt ? 'is-invalid' : ''}`}
              id="address-numExt"
              name="numExt"
              value={formData.numExt}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. 123"
            />
            {errors.numExt && <div className="invalid-feedback">{errors.numExt}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="address-numInt" className="form-label">Número Interior (opcional)</label>
            <input
              type="text"
              className={`form-control ${errors.numInt ? 'is-invalid' : ''}`}
              id="address-numInt"
              name="numInt"
              value={formData.numInt}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. 4B"
            />
            {errors.numInt && <div className="invalid-feedback">{errors.numInt}</div>}
          </div>
        </div>

        {/* Colonia */}
        <div className="mb-3">
          <label htmlFor="address-colonia" className="form-label">Colonia</label>
          <input
            type="text"
            className={`form-control ${errors.colonia ? 'is-invalid' : ''}`}
            id="address-colonia"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            disabled={loading}
            placeholder="Nombre de la colonia"
          />
          {errors.colonia && <div className="invalid-feedback">{errors.colonia}</div>}
        </div>

        {/* Ciudad */}
        <div className="mb-3">
          <label htmlFor="address-city" className="form-label">Ciudad</label>
          <input
            type="text"
            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
            id="address-city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ciudad"
            autoComplete="address-level2"
          />
          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
        </div>

        {/* Fila con Estado y Código Postal */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="address-state" className="form-label">Estado</label>
            <select
              className={`form-select ${errors.state ? 'is-invalid' : ''}`}
              id="address-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
              autoComplete="address-level1"
            >
              <option value="">Selecciona un estado</option>
              {ESTADOS_MEXICANOS.map((estado) => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="address-zip" className="form-label">Código Postal</label>
            <input
              type="text"
              className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
              id="address-zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              disabled={loading}
              placeholder="Código Postal (5 dígitos)"
              autoComplete="postal-code"
              maxLength="5"
            />
            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
          </div>
        </div>

        {/* Referencias para llegar (opcional) */}
        <div className="mb-3">
          <label htmlFor="address-references" className="form-label">Referencias (opcional)</label>
          <textarea
            className="form-control"
            id="address-references"
            name="references"
            rows="2"
            value={formData.references}
            onChange={handleChange}
            disabled={loading}
            placeholder="Entre calles, señas particulares u otras referencias para encontrar la dirección"
          ></textarea>
        </div>

        {/* Checkbox para dirección predeterminada */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="address-default"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="address-default">
            Establecer como dirección predeterminada
          </label>
        </div>
      </div>
    </SimpleModal>
  );
};