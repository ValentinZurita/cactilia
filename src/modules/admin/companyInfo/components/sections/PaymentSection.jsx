import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección para configuración de pagos de la empresa
 * Con diseño elegante y minimalista
 */
const PaymentSection = ({ data, onUpdate }) => {
  const initialData = {
    testMode: data.testMode || false,
    methods: data.methods || {
      card: { enabled: false, config: {} },
      oxxo: { enabled: false, config: {} },
      transfer: { enabled: false, config: {} },
      cash: { enabled: false, config: {} }
    }
  };
  
  const [paymentConfig, setPaymentConfig] = useState(initialData);
  
  /**
   * Actualizar el modo de pruebas
   * @param {boolean} testMode - Estado del modo de pruebas
   */
  const handleTestModeChange = (testMode) => {
    const updatedConfig = {
      ...paymentConfig,
      testMode
    };
    
    setPaymentConfig(updatedConfig);
    onUpdate(updatedConfig);
  };
  
  /**
   * Activar/desactivar un método de pago
   * @param {string} method - ID del método
   * @param {boolean} enabled - Estado de activación
   */
  const handleMethodToggle = (method, enabled) => {
    const updatedConfig = {
      ...paymentConfig,
      methods: {
        ...paymentConfig.methods,
        [method]: {
          ...paymentConfig.methods[method],
          enabled
        }
      }
    };
    
    setPaymentConfig(updatedConfig);
    onUpdate(updatedConfig);
  };
  
  /**
   * Actualizar configuración de un método de pago
   * @param {string} method - ID del método
   * @param {string} field - Campo a actualizar
   * @param {any} value - Nuevo valor
   */
  const handleConfigChange = (method, field, value) => {
    const updatedConfig = {
      ...paymentConfig,
      methods: {
        ...paymentConfig.methods,
        [method]: {
          ...paymentConfig.methods[method],
          config: {
            ...(paymentConfig.methods[method]?.config || {}),
            [field]: value
          }
        }
      }
    };
    
    setPaymentConfig(updatedConfig);
    onUpdate(updatedConfig);
  };
  
  // Configuración de métodos de pago disponibles
  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Tarjeta de Crédito/Débito', 
      icon: 'credit-card',
      description: 'Aceptar pagos con tarjetas mediante un procesador de pagos',
      color: '#6772E5',
      fields: [
        { id: 'provider', label: 'Proveedor', type: 'select', options: ['Stripe', 'PayPal', 'Conekta', 'MercadoPago'] },
        { id: 'apiKey', label: 'API Key', type: 'text', placeholder: 'pk_live_...' },
        { id: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' }
      ]
    },
    { 
      id: 'oxxo', 
      name: 'OXXO', 
      icon: 'shop',
      description: 'Permitir a los clientes pagar en tiendas OXXO',
      color: '#ED1C24',
      fields: [
        { id: 'expirationDays', label: 'Días para expirar', type: 'number', placeholder: '3' }
      ]
    },
    { 
      id: 'transfer', 
      name: 'Transferencia Bancaria', 
      icon: 'bank',
      description: 'Recibir pagos mediante transferencias bancarias',
      color: '#1E88E5',
      fields: [
        { id: 'accountNumber', label: 'Número de cuenta', type: 'text', placeholder: '0123456789' },
        { id: 'bank', label: 'Banco', type: 'text', placeholder: 'BBVA' },
        { id: 'clabe', label: 'CLABE', type: 'text', placeholder: '012345678901234567' }
      ]
    },
    { 
      id: 'cash', 
      name: 'Efectivo', 
      icon: 'cash',
      description: 'Pago en efectivo al momento de la entrega',
      color: '#43A047',
      fields: []
    }
  ];
  
  return (
    <div className="payment-section">
      <div className="row mb-4">
        <div className="col-12 mb-4">
          <h5 className="fw-medium mb-3">
            <i className="bi bi-credit-card me-2"></i>
            Configuración de Pagos
          </h5>
          <p className="text-muted">
            Configura los métodos de pago que aceptará tu tienda.
          </p>
        </div>
      </div>
      
      {/* Modo de pruebas */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="testMode"
              checked={paymentConfig.testMode}
              onChange={(e) => handleTestModeChange(e.target.checked)}
            />
            <label className="form-check-label fw-medium" htmlFor="testMode">
              Modo de pruebas
            </label>
          </div>
          <div className="mt-2 text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            En modo de pruebas, los pagos no serán procesados realmente. Útil para realizar pruebas en el sitio.
          </div>
        </div>
      </div>
      
      {/* Métodos de pago */}
      <h6 className="fw-medium mb-3">Métodos de pago disponibles</h6>
      
      <div className="row g-4">
        {paymentMethods.map((method) => {
          const methodConfig = paymentConfig.methods[method.id] || { enabled: false, config: {} };
          
          return (
            <div className="col-lg-6" key={method.id}>
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-header bg-white d-flex justify-content-between align-items-center p-3" 
                     style={{ borderLeft: `4px solid ${method.color}` }}>
                  <div className="d-flex align-items-center">
                    <div 
                      className="rounded-circle p-2 me-2 d-flex align-items-center justify-content-center" 
                      style={{ backgroundColor: `${method.color}20`, width: 40, height: 40 }}
                    >
                      <i className={`bi bi-${method.icon}`} style={{ color: method.color }}></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-medium">{method.name}</h6>
                      <small className="text-muted">{method.description}</small>
                    </div>
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`method-${method.id}`}
                      checked={methodConfig.enabled || false}
                      onChange={(e) => handleMethodToggle(method.id, e.target.checked)}
                    />
                  </div>
                </div>
                
                {methodConfig.enabled && method.fields.length > 0 && (
                  <div className="card-body">
                    <div className="row g-3">
                      {method.fields.map(field => (
                        <div className={field.type === 'textarea' ? 'col-12' : 'col-md-6'} key={`${method.id}-${field.id}`}>
                          <label htmlFor={`${method.id}-${field.id}`} className="form-label">
                            {field.label}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              className="form-select"
                              id={`${method.id}-${field.id}`}
                              value={methodConfig.config?.[field.id] || ''}
                              onChange={(e) => handleConfigChange(method.id, field.id, e.target.value)}
                            >
                              <option value="">Seleccionar...</option>
                              {field.options.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              className="form-control"
                              id={`${method.id}-${field.id}`}
                              placeholder={field.placeholder || ''}
                              value={methodConfig.config?.[field.id] || ''}
                              onChange={(e) => handleConfigChange(method.id, field.id, e.target.value)}
                              rows="3"
                            ></textarea>
                          ) : (
                            <input
                              type={field.type}
                              className="form-control"
                              id={`${method.id}-${field.id}`}
                              placeholder={field.placeholder || ''}
                              value={methodConfig.config?.[field.id] || ''}
                              onChange={(e) => handleConfigChange(
                                method.id, 
                                field.id, 
                                field.type === 'number' ? Number(e.target.value) : e.target.value
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 text-muted small">
        <i className="bi bi-shield-lock me-1"></i>
        La información de tus claves secretas está protegida y no se muestra completa por seguridad.
      </div>
    </div>
  );
};

PaymentSection.propTypes = {
  data: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default PaymentSection; 