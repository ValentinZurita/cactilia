import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para mostrar cuando no hay reglas de envío o no hay resultados de búsqueda
 * @param {string} type - Tipo de estado vacío: 'noRules' o 'noResults'
 * @param {function} onAddNew - Función para añadir nueva regla
 */
const EmptyState = ({ 
  type = 'noRules',
  onAddNew
}) => {
  // Configuración según tipo
  const config = {
    noRules: {
      icon: 'bi-geo-alt',
      title: 'No hay reglas de envío configuradas',
      description: 'Añade tu primera regla para configurar los envíos.',
      showButton: true
    },
    noResults: {
      icon: 'bi-search',
      title: 'No se encontraron reglas que coincidan',
      description: 'Intenta con otros términos de búsqueda',
      showButton: false
    }
  };
  
  const { icon, title, description, showButton } = config[type] || config.noRules;
  
  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="card-body p-5 text-center">
        <i className={`bi ${icon} fs-1 text-secondary opacity-50 d-block mb-3`}></i>
        <h5 className="text-secondary fw-normal">{title}</h5>
        <p className="text-muted mb-4">{description}</p>
        
        {showButton && onAddNew && (
          <button
            className="btn btn-dark"
            onClick={onAddNew}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Nueva Regla
          </button>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  /** Tipo de estado vacío */
  type: PropTypes.oneOf(['noRules', 'noResults']),
  /** Función para añadir nueva regla */
  onAddNew: PropTypes.func
};

export default EmptyState; 