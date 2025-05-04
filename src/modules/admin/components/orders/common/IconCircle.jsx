import React from 'react';

/**
 * Componente auxiliar para mostrar un icono dentro de un círculo con fondo claro.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.icon - Clase del icono de Bootstrap Icons (ej: 'receipt', 'geo-alt')
 * @param {string} [props.className=''] - Clases CSS adicionales para el div contenedor
 * @returns {JSX.Element}
 */
export const IconCircle = ({ icon, className = '', ...props }) => (
  <div
    className={`rounded-circle bg-light p-2 d-flex align-items-center justify-content-center me-3 ${className}`}
    style={{ width: '42px', height: '42px', minWidth: '42px' }} // Estilos fijos para consistencia
    {...props}
  >
    <i className={`bi bi-${icon} text-secondary`}></i> 
  </div>
); 