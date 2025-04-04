import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente de toggle para cambiar el estado (activo/inactivo) de un elemento
 * 
 * @param {boolean} isActive - Estado actual
 * @param {Function} onToggle - Función a ejecutar al cambiar el estado
 * @param {string} size - Tamaño del toggle (sm, md, lg)
 * @param {boolean} showLabel - Si se debe mostrar el texto de estado
 * @param {boolean} disabled - Si el toggle está deshabilitado
 * @param {boolean} error - Si hay un error en el toggle
 * @returns {JSX.Element}
 */
export const StatusToggle = ({ 
  isActive, 
  onToggle, 
  size = 'md',
  showLabel = true,
  disabled = false,
  error = false
}) => {
  // Clases dinámicas basadas en el tamaño
  const toggleSizeClass = {
    sm: 'toggle-sm',
    md: '',
    lg: 'toggle-lg'
  }[size] || '';
  
  return (
    <div className="status-toggle">
      <div 
        className={`toggle-switch ${isActive ? 'active' : ''} ${toggleSizeClass} 
          ${disabled ? 'disabled' : ''} ${error ? 'error' : ''}`}
        onClick={() => !disabled && onToggle(!isActive)}
        role="switch"
        aria-checked={isActive}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onToggle(!isActive);
          }
        }}
      >
        <div className="toggle-slider">
          {disabled && (
            <div className="toggle-loader"></div>
          )}
        </div>
      </div>
      
      {showLabel && (
        <span className={`toggle-label ms-2 ${error ? 'text-danger' : isActive ? 'text-success' : 'text-secondary'}`}>
          {error ? 'Error' : isActive ? 'Activo' : 'Inactivo'}
        </span>
      )}
      
      <style jsx="true">{`
        .status-toggle {
          display: flex;
          align-items: center;
        }
        
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
          background-color: #ccc;
          border-radius: 20px;
          transition: all 0.3s;
          cursor: pointer;
        }
        
        .toggle-switch.active {
          background-color: #198754;
        }
        
        .toggle-switch.error {
          background-color: #dc3545;
        }
        
        .toggle-switch.disabled {
          opacity: 0.7;
          cursor: default;
        }
        
        .toggle-switch .toggle-slider {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          transition: all 0.3s;
        }
        
        .toggle-switch.active .toggle-slider {
          transform: translateX(20px);
        }
        
        .toggle-switch:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(25, 135, 84, 0.25);
        }
        
        .toggle-switch.error:focus {
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
        }
        
        /* Spinner para estado de carga */
        .toggle-loader {
          width: 10px;
          height: 10px;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: #000;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          margin-top: -5px;
          margin-left: -5px;
          animation: toggle-spin 1s linear infinite;
        }
        
        @keyframes toggle-spin {
          to { transform: rotate(360deg); }
        }
        
        /* Tamaños */
        .toggle-switch.toggle-sm {
          width: 30px;
          height: 16px;
        }
        
        .toggle-switch.toggle-sm .toggle-slider {
          width: 12px;
          height: 12px;
        }
        
        .toggle-switch.toggle-sm.active .toggle-slider {
          transform: translateX(14px);
        }
        
        .toggle-switch.toggle-lg {
          width: 50px;
          height: 24px;
        }
        
        .toggle-switch.toggle-lg .toggle-slider {
          width: 20px;
          height: 20px;
        }
        
        .toggle-switch.toggle-lg.active .toggle-slider {
          transform: translateX(26px);
        }
      `}</style>
    </div>
  );
};

StatusToggle.propTypes = {
  isActive: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool
}; 