import React from 'react';

/**
 * Representa un paso individual del flujo de trabajo
 */
export const StepperItem = ({ step, index, onAction }) => {
  // Solo dos estados visuales para simplificar: activo/completado o inactivo
  const isActiveOrCompleted = step.status === 'current' || step.status === 'completed';

  // Filtrar acciones visibles que tengan etiqueta
  const visibleActions = step.actions?.filter(action => action.visible && action.label) || [];

  return (
    <div className="px-3 text-center" style={{ flex: '1', minWidth: '130px' }}>
      <div className="position-relative">
        {/* Línea conectora entre pasos */}
        {index > 0 && (
          <div
            className={`position-absolute ${isActiveOrCompleted ? 'bg-secondary' : 'bg-secondary opacity-25'}`}
            style={{
              height: '2px',
              top: '20px',
              left: '-50%',
              width: '100%'
            }}
          ></div>
        )}

        {/* Círculo indicador del paso */}
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2 
            ${isActiveOrCompleted ? 'bg-dark text-white' : 'bg-light text-secondary border'}`}
          style={{ width: '40px', height: '40px', zIndex: 1, position: 'relative' }}
        >
          <i className={`bi bi-${step.icon}`}></i>
        </div>

        {/* Contenido del paso */}
        <div className="px-1">
          <div className={isActiveOrCompleted ? 'text-dark fw-medium' : 'text-secondary'}>
            {step.title}
          </div>
          <div className="small text-muted mb-2">{step.description}</div>

          {/* Botones de acción */}
          {visibleActions.length > 0 && (
            <div className="d-grid gap-1 mt-2">
              {visibleActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn btn-sm ${action.variant || 'btn-outline-secondary'}`}
                  onClick={() => onAction(action.id)}
                >
                  {action.icon && (
                    <i className={`bi bi-${action.icon} me-1`}></i>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
