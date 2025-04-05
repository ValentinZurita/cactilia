import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de formulario de pago para el checkout
 */
const PaymentForm = ({ onSubmit, onBack, initialPayment }) => {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Inicializar el formulario con el pago inicial si existe
  useEffect(() => {
    if (initialPayment) {
      setFormData(initialPayment);
    }
  }, [initialPayment]);

  // Validar un campo
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'cardholderName':
        if (!value.trim()) {
          error = 'El nombre es obligatorio';
        }
        break;
      case 'cardNumber':
        if (!value.trim()) {
          error = 'El número de tarjeta es obligatorio';
        } else if (!/^\d{16}$/.test(value.replace(/\s/g, ''))) {
          error = 'El número de tarjeta debe tener 16 dígitos';
        }
        break;
      case 'expiryMonth':
        if (!value) {
          error = 'El mes es obligatorio';
        }
        break;
      case 'expiryYear':
        if (!value) {
          error = 'El año es obligatorio';
        }
        break;
      case 'cvv':
        if (!value.trim()) {
          error = 'El CVV es obligatorio';
        } else if (!/^\d{3,4}$/.test(value)) {
          error = 'El CVV debe tener 3 o 4 dígitos';
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
    
    // Formatear número de tarjeta si es necesario
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      
      setFormData((prev) => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
    
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

  // Generar opciones para meses
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    return (
      <option key={month} value={month}>
        {month.toString().padStart(2, '0')}
      </option>
    );
  });

  // Generar opciones para años
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear + i;
    return (
      <option key={year} value={year}>
        {year}
      </option>
    );
  });

  return (
    <div className="payment-form">
      <div className="card shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0">Método de pago</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Nombre del titular */}
              <div className="col-12">
                <label htmlFor="cardholderName" className="form-label">Nombre del titular</label>
                <input
                  type="text"
                  className={`form-control ${errors.cardholderName ? 'is-invalid' : ''}`}
                  id="cardholderName"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nombre como aparece en la tarjeta"
                  required
                />
                {errors.cardholderName && (
                  <div className="invalid-feedback">{errors.cardholderName}</div>
                )}
              </div>

              {/* Número de tarjeta */}
              <div className="col-12">
                <label htmlFor="cardNumber" className="form-label">Número de tarjeta</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-credit-card"></i>
                  </span>
                  <input
                    type="text"
                    className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength="19"
                    required
                  />
                  {errors.cardNumber && (
                    <div className="invalid-feedback">{errors.cardNumber}</div>
                  )}
                </div>
              </div>

              {/* Fecha de expiración */}
              <div className="col-md-8">
                <label className="form-label">Fecha de expiración</label>
                <div className="row">
                  <div className="col-6">
                    <select
                      className={`form-select ${errors.expiryMonth ? 'is-invalid' : ''}`}
                      id="expiryMonth"
                      name="expiryMonth"
                      value={formData.expiryMonth}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Mes</option>
                      {monthOptions}
                    </select>
                    {errors.expiryMonth && (
                      <div className="invalid-feedback">{errors.expiryMonth}</div>
                    )}
                  </div>
                  <div className="col-6">
                    <select
                      className={`form-select ${errors.expiryYear ? 'is-invalid' : ''}`}
                      id="expiryYear"
                      name="expiryYear"
                      value={formData.expiryYear}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                    >
                      <option value="">Año</option>
                      {yearOptions}
                    </select>
                    {errors.expiryYear && (
                      <div className="invalid-feedback">{errors.expiryYear}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* CVV */}
              <div className="col-md-4">
                <label htmlFor="cvv" className="form-label">CVV</label>
                <div className="input-group">
                  <input
                    type="password"
                    className={`form-control ${errors.cvv ? 'is-invalid' : ''}`}
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="XXX"
                    maxLength="4"
                    required
                  />
                  <span className="input-group-text">
                    <i className="bi bi-question-circle" data-bs-toggle="tooltip" data-bs-placement="top" title="El código de seguridad de 3 o 4 dígitos en el reverso de tu tarjeta"></i>
                  </span>
                  {errors.cvv && (
                    <div className="invalid-feedback">{errors.cvv}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button 
                type="button" 
                className="btn btn-outline-dark"
                onClick={onBack}
              >
                Regresar
              </button>
              <button type="submit" className="btn btn-dark px-4 fw-medium">
                Continuar
              </button>
            </div>

            <div className="mt-4">
              <div className="alert alert-light p-2 d-flex align-items-center">
                <i className="bi bi-shield-lock me-2 fs-5"></i>
                <div className="small">
                  Tu información de pago está protegida con encriptación de grado bancario.
                </div>
              </div>
              <div className="d-flex justify-content-center mt-3">
                <img src="/visa.svg" alt="Visa" className="me-2" height="24" />
                <img src="/mastercard.svg" alt="MasterCard" className="me-2" height="24" />
                <img src="/amex.svg" alt="American Express" className="me-2" height="24" />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

PaymentForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  initialPayment: PropTypes.object
};

export default PaymentForm; 