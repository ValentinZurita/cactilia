/**
 * Componente individual para cada paso del timeline
 * Rediseñado para una línea continua
 */
export const StepperItem = ({
                              step,
                              index,
                              onAction,
                              isActive,
                              totalSteps
                            }) => {
  // Filtrar acciones visibles que tengan etiqueta
  const visibleActions = step.actions?.filter(action => action.visible && action.label) || [];

  // Calcular el ancho para distribuir uniformemente
  const itemWidth = `${100 / totalSteps}%`;

  return (
    <div className="text-center position-relative" style={{ width: itemWidth, minWidth: '130px' }}>
      {/* Línea conectora entre pasos - ahora implementada de forma más robusta */}
      {index > 0 && (
        <div
          className={`position-absolute ${isActive ? 'bg-dark' : 'bg-secondary opacity-25'}`}
          style={{
            height: '2px',
            top: '20px',
            right: '50%', // Comienza desde el centro
            width: '100%', // Cubre hasta el siguiente paso
            zIndex: 1
          }}
        ></div>
      )}

      {/* Círculo indicador del paso */}
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle mx-auto mb-2 
          ${isActive ? 'bg-dark text-white' : 'bg-light text-secondary border'}`}
        style={{
          width: '40px',
          height: '40px',
          zIndex: 2,
          position: 'relative',
          margin: '0 auto'
        }}
      >
        <i className={`bi bi-${step.icon}`}></i>
      </div>

      {/* Contenido del paso */}
      <div className="px-1 mt-3">
        <div className={isActive ? 'text-dark fw-medium' : 'text-secondary'}>
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
  );
};