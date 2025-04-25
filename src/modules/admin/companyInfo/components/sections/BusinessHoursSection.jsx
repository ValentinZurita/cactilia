import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Sección de horarios de atención de la empresa
 * Con diseño elegante y moderno
 */
const BusinessHoursSection = ({ data, onUpdate }) => {
  // Valor por defecto si no hay datos
  const defaultHours = [
    { day: 'Lunes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Martes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Miércoles', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Jueves', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Viernes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Sábado', open: true, openingTime: '10:00', closingTime: '14:00' },
    { day: 'Domingo', open: false, openingTime: '', closingTime: '' },
  ];
  
  const [businessHours, setBusinessHours] = useState(data.length > 0 ? data : defaultHours);
  
  const handleToggleOpen = (index) => {
    const updatedHours = [...businessHours];
    updatedHours[index].open = !updatedHours[index].open;
    
    // Si está cerrando, limpiar horas
    if (!updatedHours[index].open) {
      updatedHours[index].openingTime = '';
      updatedHours[index].closingTime = '';
    } else {
      // Si está abriendo, poner horas por defecto
      updatedHours[index].openingTime = '09:00';
      updatedHours[index].closingTime = '18:00';
    }
    
    setBusinessHours(updatedHours);
    onUpdate(updatedHours);
  };
  
  const handleTimeChange = (index, field, value) => {
    const updatedHours = [...businessHours];
    updatedHours[index][field] = value;
    
    setBusinessHours(updatedHours);
    onUpdate(updatedHours);
  };
  
  const handleCopyToAll = (index) => {
    if (!businessHours[index].open) return;
    
    const sourceTimes = {
      openingTime: businessHours[index].openingTime,
      closingTime: businessHours[index].closingTime
    };
    
    const updatedHours = businessHours.map(hour => {
      if (hour.open) {
        return {
          ...hour,
          openingTime: sourceTimes.openingTime,
          closingTime: sourceTimes.closingTime
        };
      }
      return hour;
    });
    
    setBusinessHours(updatedHours);
    onUpdate(updatedHours);
  };
  
  return (
    <div className="business-hours-section">
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-dark">
              <tr>
                <th scope="col" className="px-3 py-3 border-0">Día</th>
                <th scope="col" className="px-3 py-3 border-0">Estado</th>
                <th scope="col" className="px-3 py-3 border-0">Horario de apertura</th>
                <th scope="col" className="px-3 py-3 border-0">Horario de cierre</th>
                <th scope="col" className="px-3 py-3 border-0">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {businessHours.map((hour, index) => (
                <tr key={hour.day} className={!hour.open ? 'text-muted' : ''}>
                  <td className="px-3 py-2">
                    <span className="fw-medium">{hour.day}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`open-${index}`}
                        checked={hour.open}
                        onChange={() => handleToggleOpen(index)}
                      />
                      <label className="form-check-label" htmlFor={`open-${index}`}>
                        {hour.open ? 'Abierto' : 'Cerrado'}
                      </label>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={hour.openingTime}
                      onChange={(e) => handleTimeChange(index, 'openingTime', e.target.value)}
                      disabled={!hour.open}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="time"
                      className="form-control form-control-sm"
                      value={hour.closingTime}
                      onChange={(e) => handleTimeChange(index, 'closingTime', e.target.value)}
                      disabled={!hour.open}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleCopyToAll(index)}
                      disabled={!hour.open}
                      title="Aplicar este horario a todos los días abiertos"
                    >
                      <i className="bi bi-files me-1"></i>
                      Aplicar a todos
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-3 text-muted small">
        <i className="bi bi-info-circle me-1"></i>
        Los horarios se mostrarán en la página de contacto y en el pie de página.
      </div>
    </div>
  );
};

BusinessHoursSection.propTypes = {
  data: PropTypes.array.isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default BusinessHoursSection; 