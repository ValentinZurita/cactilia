import React from 'react';

/**
 * Versión mejorada del StepperItem con estilos Bootstrap estándar
 * - Soporta múltiples acciones por paso
 * - Usa clases Bootstrap estándar para consistencia
 *
 * @param {Object} props
 * @param {Object} props.step - Datos del paso con acciones
 * @param {number} props.index - Índice del paso
 * @param {boolean} props.isLastStep - Si es el último paso del stepper
 * @param {Function} props.onAction - Función para manejar la acción del paso
 */
export const StepperItem = ({ step, index, isLastStep, onAction }) => {
  // Determinar las clases según el estado del paso
  const circleClasses = {
    completed: 'bg-success text-white',
    current: 'bg-primary text-white',
    upcoming: 'bg-light text-secondary'
  };

  const titleClasses = {
    completed: 'text-secondary',
    current: 'text-primary fw-medium',
    upcoming: 'text-secondary'
  };

  return (
    <div className="step-item px-3" style={{ flex: '1', minWidth: '130px', textAlign: 'center' }}>
      <div className="position-relative">
        {/* Línea conectora entre pasos */}
        {index > 0 && (
          <div
            className="step-connector"
            style={{
              position: 'absolute',
              height: '2px',
              top: '20px',
              left: '-50%',
              width: '100%',
              background: step.status === 'completed' ? 'var(--bs-success)' :
                (step.status === 'current' ? 'var(--bs-primary)' : 'var(--bs-gray-300)')
            }}
          ></div>
        )}

        {/* Círculo del paso */}
        <div
          className={`step-circle d-flex align-items-center justify-content-center rounded-circle m-auto mb-2 ${circleClasses[step.status]}`}
          style={{ width: '40px', height: '40px', zIndex: 1, position: 'relative' }}
        >
          <i className={`bi bi-${step.icon}`}></i>
        </div>

        {/* Texto del paso */}
        <div className="step-text px-1">
          <div className={titleClasses[step.status]}>{step.title}</div>
          <div className="small text-muted mb-2">{step.description}</div>

          {/* Botones de acción */}
          {step.actions && step.actions.length > 0 && (
            <div className="d-grid gap-1 mt-2">
              {step.actions.filter(action => action.visible && action.label).map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`btn btn-sm ${action.primary ? 'btn-outline-primary' : 'btn-outline-secondary'}`}
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