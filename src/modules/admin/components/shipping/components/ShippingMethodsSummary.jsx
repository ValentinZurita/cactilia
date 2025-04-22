import React from 'react';

/**
 * Componente para mostrar un resumen de los métodos de envío.
 * Muestra los primeros N métodos como badges sutiles (fondo tenue) y un indicador "+N".
 * @param {{ 
 *   methods: Array<{ nombre: string, tiempo_entrega?: string, precio?: number }>, 
 *   maxVisible?: number 
 * }} props
 */
export const ShippingMethodsSummary = ({ methods = [], maxVisible = 2 }) => {
  if (!methods || methods.length === 0) {
    return <span className="text-muted small">No disponible</span>;
  }

  const visibleMethods = methods.slice(0, maxVisible);
  const hiddenCount = methods.length - visibleMethods.length;

  // Estilo sutil: píldora, sin negrita, fondo gris muy tenue, texto gris.
  const badgeClasses = "badge rounded-pill fw-normal bg-secondary bg-opacity-10 text-secondary";

  return (
    <div className="d-flex flex-wrap gap-1">
      {visibleMethods.map((method, idx) => (
        <span
          key={method.id || idx} // Usar un ID si está disponible, sino el índice
          className={badgeClasses}
          title={`${method.tiempo_entrega || 'N/A'} - $${method.precio || 0} MXN`}
        >
          {method.nombre || 'Sin nombre'}
        </span>
      ))}
      {hiddenCount > 0 && (
        <span className={badgeClasses} title={`${hiddenCount} métodos más`}>
          +{hiddenCount}
        </span>
      )}
    </div>
  );
}; 