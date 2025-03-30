import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/addressSelector.css';

/**
 * AddressOption - Opción individual de dirección
 * Componente reutilizable para opciones de dirección guardada o nueva
 *
 * @param {Object} props
 * @param {boolean} props.isSelected - Si la opción está seleccionada
 * @param {Function} props.onSelect - Función al seleccionar esta opción
 * @param {string} props.icon - Clase del icono (opcional)
 * @param {string} props.name - Nombre de la dirección
 * @param {string} props.description - Descripción/detalles de la dirección
 * @param {string} props.references - Referencias adicionales (opcional)
 * @param {boolean} props.isDefault - Si es la dirección predeterminada (opcional)
 * @param {string} props.id - ID para el input de radio
 * @param {ReactNode} props.children - Contenido adicional (ej: formulario de nueva dirección)
 */
export const AddressOption = ({
                                isSelected,
                                onSelect,
                                icon,
                                name,
                                description,
                                references,
                                isDefault,
                                id,
                                children
                              }) => {
  return (
    <div className={`address-option ${isSelected ? 'active-address-option' : ''}`}>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name="addressSelection"
          id={id}
          checked={isSelected}
          onChange={onSelect}
          aria-label={`Seleccionar dirección: ${name}`}
        />
        <label
          className="form-check-label d-flex align-items-start"
          htmlFor={id}
          style={{ cursor: 'pointer' }}
          onClick={onSelect}
        >
          {icon && <i className={`${icon} me-2 fs-4`} aria-hidden="true"></i>}
          <div>
            <div className="address-name">{name}</div>
            <div className="address-details text-muted small">
              {description}
            </div>
            {references && (
              <div className="address-references text-muted small fst-italic">
                <i className="bi bi-signpost me-1"></i>
                {references}
              </div>
            )}
            {isDefault && (
              <span className="badge bg-secondary bg-opacity-25 text-secondary mt-1">
                <i className="bi bi-check-circle-fill me-1"></i>
                Predeterminada
              </span>
            )}
          </div>
        </label>
      </div>

      {children}
    </div>
  );
};

AddressOption.propTypes = {
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  icon: PropTypes.string,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  references: PropTypes.string,
  isDefault: PropTypes.bool,
  id: PropTypes.string.isRequired,
  children: PropTypes.node
};