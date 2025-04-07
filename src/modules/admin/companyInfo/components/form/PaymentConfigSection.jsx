import React from 'react';
import PropTypes from 'prop-types';
import { FormSection } from './FormSection';

/**
 * Sección para configuración de pagos
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos de configuración de pagos
 * @param {Function} props.onUpdate - Función para actualizar la configuración de pagos
 * @returns {JSX.Element} Sección de configuración de pagos
 */
export const PaymentConfigSection = ({ data, onUpdate }) => {
  /**
   * Actualizar un método de pago específico
   * @param {string} method - Nombre del método
   * @param {boolean} enabled - Estado de activación
   */
  const handleMethodToggle = (method, enabled) => {
    const updatedPayments = {
      ...data,
      methods: {
        ...data.methods,
        [method]: {
          ...data.methods[method],
          enabled
        }
      }
    };
    
    onUpdate(updatedPayments);
  };
  
  /**
   * Actualizar configuración de un método de pago
   * @param {string} method - Nombre del método
   * @param {string} field - Campo a actualizar
   * @param {any} value - Nuevo valor
   */
  const handleConfigChange = (method, field, value) => {
    const updatedPayments = {
      ...data,
      methods: {
        ...data.methods,
        [method]: {
          ...data.methods[method],
          config: {
            ...data.methods[method]?.config,
            [field]: value
          }
        }
      }
    };
    
    onUpdate(updatedPayments);
  };
  
  /**
   * Actualizar una configuración general de pagos
   * @param {string} field - Campo a actualizar
   * @param {any} value - Nuevo valor
   */
  const handleGeneralConfigChange = (field, value) => {
    const updatedPayments = {
      ...data,
      [field]: value
    };
    
    onUpdate(updatedPayments);
  };
  
  // Verificar y proporcionar valores por defecto si no existen
  const methods = data.methods || {};
  
  // Configuración de métodos de pago disponibles
  const paymentMethods = [
    { 
      id: 'card', 
      name: 'Tarjeta de Crédito/Débito', 
      icon: 'bi-credit-card',
      fields: [
        { id: 'apiKey', label: 'API Key', type: 'text', placeholder: 'pk_live_...' },
        { id: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' }
      ]
    },
    { 
      id: 'oxxo', 
      name: 'OXXO', 
      icon: 'bi-shop',
      fields: [
        { id: 'expirationDays', label: 'Días para expirar', type: 'number', placeholder: '3' }
      ]
    },
    { 
      id: 'transfer', 
      name: 'Transferencia Bancaria', 
      icon: 'bi-bank',
      fields: [
        { id: 'accountNumber', label: 'Número de cuenta', type: 'text', placeholder: '0123456789' },
        { id: 'bank', label: 'Banco', type: 'text', placeholder: 'BBVA' },
        { id: 'clabe', label: 'CLABE', type: 'text', placeholder: '012345678901234567' }
      ]
    },
    { 
      id: 'cash', 
      name: 'Efectivo', 
      icon: 'bi-cash',
      fields: []
    }
  ];
  
  return (
    <FormSection 
      title="Configuración de Pagos" 
      icon="bi-cash-coin"
      description="Configura los métodos de pago disponibles en tu tienda"
    >
      <div className="mb-4">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="testMode"
            checked={data.testMode || false}
            onChange={(e) => handleGeneralConfigChange('testMode', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="testMode">
            Modo de pruebas
          </label>
        </div>
        <small className="form-text text-muted">
          En modo de pruebas, los pagos no serán procesados realmente.
        </small>
      </div>
      
      <div className="border-top pt-3 mb-3">
        <h6 className="fw-bold">Métodos de pago</h6>
      </div>
      
      {paymentMethods.map((method) => {
        const methodData = methods[method.id] || { enabled: false, config: {} };
        
        return (
          <div key={method.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <i className={`bi ${method.icon} me-2`}></i>
                {method.name}
              </div>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`method-${method.id}`}
                  checked={methodData.enabled || false}
                  onChange={(e) => handleMethodToggle(method.id, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`method-${method.id}`}>
                  {methodData.enabled ? 'Activado' : 'Desactivado'}
                </label>
              </div>
            </div>
            
            {methodData.enabled && method.fields.length > 0 && (
              <div className="card-body">
                <div className="row g-3">
                  {method.fields.map(field => (
                    <div className="col-md-6" key={`${method.id}-${field.id}`}>
                      <label htmlFor={`${method.id}-${field.id}`} className="form-label">{field.label}</label>
                      <input
                        type={field.type}
                        className="form-control"
                        id={`${method.id}-${field.id}`}
                        placeholder={field.placeholder}
                        value={methodData.config?.[field.id] || ''}
                        onChange={(e) => handleConfigChange(method.id, field.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="form-text text-muted mt-2">
        <i className="bi bi-shield-lock me-1"></i>
        Las claves secretas están protegidas y no se muestran completas por seguridad.
      </div>
    </FormSection>
  );
};

PaymentConfigSection.propTypes = {
  data: PropTypes.shape({
    testMode: PropTypes.bool,
    methods: PropTypes.objectOf(
      PropTypes.shape({
        enabled: PropTypes.bool,
        config: PropTypes.object
      })
    )
  }),
  onUpdate: PropTypes.func.isRequired
};

PaymentConfigSection.defaultProps = {
  data: {
    testMode: false,
    methods: {}
  }
}; 