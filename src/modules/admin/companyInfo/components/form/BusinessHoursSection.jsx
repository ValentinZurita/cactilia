import React from 'react';
import PropTypes from 'prop-types';
import { FormSection } from './FormSection';

/**
 * Sección para horarios de atención
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Datos de horarios
 * @param {Function} props.onUpdate - Función para actualizar horarios
 * @returns {JSX.Element} Sección de horarios
 */
export const BusinessHoursSection = ({ data, onUpdate }) => {
  /**
   * Actualizar un horario específico
   * @param {number} index - Índice del día a actualizar
   * @param {Object} changes - Cambios a aplicar
   */
  const handleHourChange = (index, changes) => {
    const updatedHours = [...data];
    updatedHours[index] = {
      ...updatedHours[index],
      ...changes
    };
    
    onUpdate(updatedHours);
  };
  
  /**
   * Manejar cambio en el estado abierto/cerrado
   * @param {number} index - Índice del día
   * @param {boolean} isOpen - Si está abierto o no
   */
  const handleOpenToggle = (index, isOpen) => {
    handleHourChange(index, { open: isOpen });
  };
  
  return (
    <FormSection 
      title="Horarios de Atención" 
      icon="bi-clock"
      description="Establece los horarios de atención para tu negocio"
    >
      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th style={{ width: '20%' }}>Día</th>
              <th style={{ width: '15%' }}>Estado</th>
              <th style={{ width: '30%' }}>Horario de Apertura</th>
              <th style={{ width: '30%' }}>Horario de Cierre</th>
            </tr>
          </thead>
          <tbody>
            {data.map((day, index) => (
              <tr key={day.day}>
                <td className="align-middle">{day.day}</td>
                <td>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`day-${index}-open`}
                      checked={day.open}
                      onChange={(e) => handleOpenToggle(index, e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor={`day-${index}-open`}>
                      {day.open ? 'Abierto' : 'Cerrado'}
                    </label>
                  </div>
                </td>
                <td>
                  <input
                    type="time"
                    className="form-control"
                    value={day.openTime}
                    onChange={(e) => handleHourChange(index, { openTime: e.target.value })}
                    disabled={!day.open}
                  />
                </td>
                <td>
                  <input
                    type="time"
                    className="form-control"
                    value={day.closeTime}
                    onChange={(e) => handleHourChange(index, { closeTime: e.target.value })}
                    disabled={!day.open}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="form-text text-muted mt-2">
        <i className="bi bi-info-circle me-1"></i>
        Los horarios se mostrarán en el sitio web y ayudarán a los clientes a saber cuándo pueden contactarte.
      </div>
    </FormSection>
  );
};

BusinessHoursSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      day: PropTypes.string.isRequired,
      open: PropTypes.bool.isRequired,
      openTime: PropTypes.string.isRequired,
      closeTime: PropTypes.string.isRequired
    })
  ).isRequired,
  onUpdate: PropTypes.func.isRequired
}; 