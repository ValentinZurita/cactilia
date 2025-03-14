import React, { useState, useEffect } from 'react';
import { ModalPortal } from '../shared/ModalPortal';

/**
 * Formulario para agregar o editar direcciones
 * Se muestra dentro de un modal
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Función para cerrar el modal
 * @param {Function} props.onSave - Función para guardar la dirección
 * @param {Object} props.address - Dirección a editar (si existe)
 * @param {boolean} props.loading - Si se está procesando la solicitud
 * @returns {React.ReactNode}
 */
export const AddressForm = ({ isOpen, onClose, onSave, address = null, loading = false }) => {
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

    // Para checkboxes usamos el valor de checked, para otros campos el value
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
    if (!formData.state.trim()) newErrors.state = 'El estado/provincia es requerido';
    if (!formData.zip.trim()) newErrors.zip = 'El código postal es requerido';

    // Validar formato del código postal (básico)
    if (formData.zip && !/^[0-9]{4,6}$/.test(formData.zip.trim())) {
      newErrors.zip = 'Formato de código postal inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Validar formulario
    if (!validateForm()) return;

    // Enviar datos si es válido
    onSave({
      ...formData,
      id: address?.id, // Incluir ID si estamos editando
    });
  };

  // Contenido personalizado para el footer del modal
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
        className="btn btn-green-3 text-white"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Guardando...
          </>
        ) : (
          address ? 'Actualizar' : 'Guardar'
        )}
      </button>
    </>
  );

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;

  return (
    <ModalPortal
      isOpen={isOpen}
      onClose={onClose}
      title={address ? 'Editar dirección' : 'Agregar dirección'}
      showFooter={true}
      footer={modalFooter}
      size="md"
    >
      <form>
        {/* Nombre de la dirección */}
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nombre de la dirección</label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="name"
            name="name"
            placeholder="Ej. Casa, Oficina, etc."
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          <div className="form-text">Un nombre para identificar esta dirección.</div>
        </div>

        {/* Calle y número */}
        <div className="mb-3">
          <label htmlFor="street" className="form-label">Dirección</label>
          <input
            type="text"
            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
            id="street"
            name="street"
            placeholder="Calle, número, colonia"
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.street && <div className="invalid-feedback">{errors.street}</div>}
        </div>

        {/* Ciudad */}
        <div className="mb-3">
          <label htmlFor="city" className="form-label">Ciudad</label>
          <input
            type="text"
            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
            id="city"
            name="city"
            placeholder="Ciudad"
            value={formData.city}
            onChange={handleChange}
            disabled={loading}
          />
          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
        </div>

        {/* Fila con Estado y Código Postal */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="state" className="form-label">Estado</label>
            <input
              type="text"
              className={`form-control ${errors.state ? 'is-invalid' : ''}`}
              id="state"
              name="state"
              placeholder="Estado/Provincia"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
          </div>
          <div className="col-md-6">
            <label htmlFor="zip" className="form-label">Código Postal</label>
            <input
              type="text"
              className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
              id="zip"
              name="zip"
              placeholder="Código Postal"
              value={formData.zip}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
          </div>
        </div>

        {/* Checkbox para dirección predeterminada */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="isDefault"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="isDefault">
            Establecer como dirección predeterminada
          </label>
        </div>
      </form>
    </ModalPortal>
  );
};