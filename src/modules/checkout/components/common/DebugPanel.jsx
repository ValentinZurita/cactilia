import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './styles/debug.css';

/**
 * Componente para mostrar datos de depuración en formato desplegable
 */
const DebugPanel = ({ 
  data, 
  title = 'Debug Info', 
  defaultExpanded = false,
  isPrimary = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Determinar si los datos son un objeto vacío o un array vacío
  const isEmpty = 
    (data === null) || 
    (data === undefined) || 
    (Object.keys(data).length === 0 && data.constructor === Object) || 
    (Array.isArray(data) && data.length === 0);

  return (
    <div className={`debug-panel ${isPrimary ? 'debug-panel-primary' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <div className="debug-header" onClick={toggleExpanded}>
        <h5>{title}</h5>
        <div className="debug-controls">
          {isEmpty && <span className="debug-empty-badge">Empty</span>}
          <span className="debug-toggle">
            <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className="debug-content">
          {isEmpty ? (
            <div className="debug-empty">
              <p>No data available</p>
            </div>
          ) : (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
};

DebugPanel.propTypes = {
  data: PropTypes.any,
  title: PropTypes.string,
  defaultExpanded: PropTypes.bool,
  isPrimary: PropTypes.bool
};

export default DebugPanel; 