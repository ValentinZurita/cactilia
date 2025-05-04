import React from 'react';

/**
 * Componente auxiliar para mostrar una fila de información con etiqueta y valor.
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta descriptiva (en gris)
 * @param {string | React.ReactNode} props.value - Valor a mostrar (en negro)
 * @param {string} [props.className=''] - Clases CSS adicionales para el div contenedor
 * @returns {JSX.Element}
 */
export const InfoRow = ({ label, value, className = '' }) => (
  <div className={className}> 
    <p className="mb-0 small text-secondary">{label}</p>
    {/* Permitir que el valor sea seleccionable por el usuario */}
    <p className="mb-0 user-select-all">{value}</p>
  </div>
); 