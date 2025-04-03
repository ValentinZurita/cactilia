import React, { useState } from 'react';

/**
 * Componente para mostrar información de la jerarquía de reglas de envío
 */
const ShippingConfigSection = () => {
  const [showInfo, setShowInfo] = useState(true);
  
  return (
    <div className="mb-4">
      {showInfo && (
        <div className="alert alert-light border mb-4 position-relative small">
          <button 
            type="button" 
            className="position-absolute top-0 end-0 btn-close mt-2 me-2" 
            onClick={() => setShowInfo(false)}
            aria-label="Cerrar"
          ></button>
          
          <h6 className="fw-medium mb-2">
            <i className="bi bi-info-circle me-2"></i>
            Información sobre jerarquía de reglas
          </h6>
          
          <p className="mb-2">
            Las reglas de envío se evalúan en el siguiente orden de prioridad:
          </p>
          
          <ol className="mb-0">
            <li>Códigos postales específicos</li>
            <li>Estados</li>
            <li>Cobertura nacional</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ShippingConfigSection; 