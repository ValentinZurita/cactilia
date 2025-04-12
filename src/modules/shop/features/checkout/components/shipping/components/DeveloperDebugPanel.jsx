import React from 'react';
import PropTypes from 'prop-types';

/**
 * Panel de depuración para desarrolladores
 * Muestra información técnica sobre las opciones de envío disponibles
 */
const DeveloperDebugPanel = ({ shippingOptions }) => {
  if (!shippingOptions || shippingOptions.length === 0) {
    return (
      <div className="debug-panel">
        <div className="debug-header">
          <h4>Shipping Debug Info</h4>
        </div>
        <div className="debug-content">
          <p>No shipping options available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="debug-panel">
      <div className="debug-header">
        <h4>Shipping Debug Info</h4>
      </div>
      <div className="debug-content">
        <p><strong>Total options:</strong> {shippingOptions.length}</p>
        
        <div className="debug-section">
          <h5>Option Details</h5>
          {shippingOptions.map((option, index) => (
            <div key={option.id || index} className="debug-item">
              <h6>{option.name || 'Unnamed Option'}</h6>
              <pre className="debug-json">
                {JSON.stringify(option, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

DeveloperDebugPanel.propTypes = {
  shippingOptions: PropTypes.array
};

export default DeveloperDebugPanel; 