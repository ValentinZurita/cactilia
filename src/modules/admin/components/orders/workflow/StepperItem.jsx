import React from 'react';

/**
 * Representa un paso del flujo de trabajo con diseño minimalista
 */
export const StepperItem = ({ step, index, isLastStep, onAction }) => {
  // Simplificación extrema: solo 2 estados visuales - activo/completado o inactivo
  const isActiveOrCompleted = step.status === 'current' || step.status === 'completed';

  return (
    <div className="px-3 text-center" style={{ flex: '1', minWidth: '130px' }}>
      <div className="position-relative">
        {/* Línea conectora simplificada */}
        {index > 0 && (
          <div
            className={`bg-secondary ${isActiveOrCompleted ? '' : 'opacity-25'}`}
            style={{
              position: 'absolute',
              height: '2px',
              top: '20px',
              left: '-50%',
              width: '100%'
            }}
          ></div>
        )}

        {/* Círculo indicador - solo negro/gris */}
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2 ${
            isActiveOrCompleted ? 'bg-dark text-white' : 'bg-light text-secondary border'
          }`}
          style={{ width: '40px', height: '40px', zIndex: 1, position: 'relative' }}
        >
          <i className={`bi bi-${step.icon}`}></i>
        </div>

        {/* Texto del paso */}
        <div className="px-1">
          <div className={isActiveOrCompleted ? 'text-dark fw-medium' : 'text-secondary'}>
            {step.title}
          </div>
          <div className="small text-muted mb-2">{step.description}</div>

          {/* Acciones simplificadas */}
          {step.actions && step.actions.some(action => action.visible && action.label) && (
            <div className="d-grid gap-1 mt-2">
              {step.actions
                .filter(action => action.visible && action.label)
                .map((action, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
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