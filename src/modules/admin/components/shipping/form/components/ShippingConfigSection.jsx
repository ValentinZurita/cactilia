import React, { useState } from 'react';

/**
 * Componente que muestra información sobre la configuración de envíos
 */
const ShippingConfigSection = () => {
  const [showInfo, setShowInfo] = useState(true);
  
  return (
    <>
      {showInfo && (
        <div className="bg-light rounded-3 p-3 mb-4 border-start border-4 border-dark">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="mb-0 fw-semibold d-flex align-items-center">
              <i className="bi bi-info-circle me-2"></i>
              Prioridad de reglas
            </h6>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowInfo(false)}
              aria-label="Cerrar"
            />
          </div>
          
          <p className="small mb-2">
            Las reglas de envío se aplican con la siguiente prioridad:
          </p>
          
          <ol className="small mb-0 ps-3">
            <li className="mb-1">
              <span className="fw-medium">Códigos postales específicos</span> - 
              Reglas para códigos postales individuales (ej: 86000)
            </li>
            <li className="mb-1">
              <span className="fw-medium">Estados</span> - 
              Reglas que aplican a todos los códigos postales de un estado
            </li>
            <li>
              <span className="fw-medium">Cobertura nacional</span> - 
              Reglas que aplican a todo el país
            </li>
          </ol>
        </div>
      )}
    </>
  );
};

export default ShippingConfigSection; 