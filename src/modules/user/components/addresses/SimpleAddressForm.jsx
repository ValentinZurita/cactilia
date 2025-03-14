import React, { useState, useEffect } from 'react';
import { SimpleModal } from '../shared/SimpleModal';

/**
 * Formulario simplificado para agregar o editar direcciones
 */
export const SimpleAddressForm = ({ isOpen, onClose, onSave, address = null, loading = false }) => {
  // Estado para los datos del formulario
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    isDefault: false
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState({});

  // Actualizar formulario cuando se recibe una dirección para editar
  useEffect(() => {
    if (isOpen) {
      if (address) {
        setFormData({
          name: address.name || '',
          street: address.street || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          isDefault: address.isDefault || false
        });
      } else {
        // Resetear formulario para agregar nueva dirección
        setFormData({
          name: '',
          street: '',
          city: '',
          state: '',
          zip: '',
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
    if (!formData.street.trim()) newErrors.street = 'La dirección es requerida';
    if (!formData.city.trim()) newErrors.city = 'La ciudad es requerida';
    if (!formData.state.trim()) newErrors.state = 'El estado es requerido';
    if (!formData.zip.trim()) newErrors.zip = 'El código postal es requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = () => {
    if (!validateForm()) return;

    onSave({
      ...formData,
      id: address?.id
    });
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
            placeholder="Ej. Casa, Oficina, etc."
            autoComplete="off"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Calle y número */}
        <div className="mb-3">
          <label htmlFor="address-street" className="form-label">Dirección</label>
          <input
            type="text"
            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
            id="address-street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
            placeholder="Calle, número, colonia"
            autoComplete="street-address"
          />
          {errors.street && <div className="invalid-feedback">{errors.street}</div>}
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
            <input
              type="text"
              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
              id="address-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
              placeholder="Estado/Provincia"
              autoComplete="address-level1"
            />
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
              placeholder="Código Postal"
              autoComplete="postal-code"
            />
            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
          </div>
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