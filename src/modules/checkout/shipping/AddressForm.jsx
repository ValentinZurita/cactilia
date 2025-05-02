import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de formulario de dirección para el checkout
 */
const AddressForm = ({ onSubmit, initialAddress }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    notes: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inicializar el formulario con la dirección inicial si existe
  useEffect(() => {
    if (initialAddress) {
      setFormData(initialAddress);
    }
  }, [initialAddress]);

  // Validar un campo
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        }
        break;
      case 'street':
        if (!value.trim()) {
          error = 'La dirección es obligatoria';
        }
        break;
      case 'city':
        if (!value.trim()) {
          error = 'La ciudad es obligatoria';
        }
        break;
      case 'state':
        if (!value) {
          error = 'El estado es obligatorio';
        }
        break;
      case 'zipCode':
        if (!value.trim()) {
          error = 'El código postal es obligatorio';
        } else if (!/^\d{5}$/.test(value)) {
          error = 'El código postal debe tener 5 dígitos';
        }
        break;
      case 'phone':
        if (!value.trim()) {
          error = 'El teléfono es obligatorio';
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          error = 'El teléfono debe tener 10 dígitos';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(field => {
      if (field === 'notes') return; // Campo opcional
      
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Marcar campo como tocado cuando pierde el foco
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(formData).reduce((obj, field) => {
      obj[field] = true;
      return obj;
    }, {});
    
    setTouched(allTouched);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Estados de México para el select
  const mexicoStates = [
    'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 
    'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 
    'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 
    'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 
    'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'
  ];

  return (
    <div className="address-form">
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Dirección de envío</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Nombre completo */}
              <div className="col-12">
                <label htmlFor="fullName" className="form-label">Nombre completo</label>
                <input
                  type="text"
                  className={`form-control ${errors.fullName ? 'is-invalid' : ''}`}
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nombre y apellidos"
                  required
                />
                {errors.fullName && (
                  <div className="invalid-feedback">{errors.fullName}</div>
                )}
              </div>

              {/* Dirección */}
              <div className="col-12">
                <label htmlFor="street" className="form-label">Dirección</label>
                <input
                  type="text"
                  className={`form-control ${errors.street ? 'is-invalid' : ''}`}
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Calle, número, colonia, etc."
                  required
                />
                {errors.street && (
                  <div className="invalid-feedback">{errors.street}</div>
                )}
              </div>

              {/* Ciudad */}
              <div className="col-md-6">
                <label htmlFor="city" className="form-label">Ciudad</label>
                <input
                  type="text"
                  className={`form-control ${errors.city ? 'is-invalid' : ''}`}
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Ciudad"
                  required
                />
                {errors.city && (
                  <div className="invalid-feedback">{errors.city}</div>
                )}
              </div>

              {/* Estado */}
              <div className="col-md-6">
                <label htmlFor="state" className="form-label">Estado</label>
                <select
                  className={`form-select ${errors.state ? 'is-invalid' : ''}`}
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                >
                  <option value="">Selecciona un estado</option>
                  {mexicoStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
                {errors.state && (
                  <div className="invalid-feedback">{errors.state}</div>
                )}
              </div>

              {/* Código postal */}
              <div className="col-md-6">
                <label htmlFor="zipCode" className="form-label">Código postal</label>
                <input
                  type="text"
                  className={`form-control ${errors.zipCode ? 'is-invalid' : ''}`}
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="5 dígitos"
                  maxLength="5"
                  required
                />
                {errors.zipCode && (
                  <div className="invalid-feedback">{errors.zipCode}</div>
                )}
              </div>

              {/* Teléfono */}
              <div className="col-md-6">
                <label htmlFor="phone" className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10 dígitos"
                  required
                />
                {errors.phone && (
                  <div className="invalid-feedback">{errors.phone}</div>
                )}
              </div>

              {/* Notas de entrega (opcional) */}
              <div className="col-12">
                <label htmlFor="notes" className="form-label">Notas de entrega (opcional)</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Instrucciones especiales para la entrega"
                  rows="2"
                ></textarea>
              </div>
            </div>

            <div className="mt-4">
              <button type="submit" className="btn btn-dark px-4 fw-medium">
                Continuar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

AddressForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialAddress: PropTypes.object
};

export default AddressForm; 