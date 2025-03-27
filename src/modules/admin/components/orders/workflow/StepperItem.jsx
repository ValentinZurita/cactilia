/**
 * Elemento individual del stepper
 * Soporta orientación horizontal (desktop) y vertical (móvil)
 * Alineación perfecta en modo vertical con la línea principal
 */
export const StepperItem = ({
                              step,
                              index,
                              onAction,
                              isActive,
                              totalSteps,
                              orientation
                            }) => {
  // Filtrar acciones visibles
  const visibleActions = step.actions?.filter(action => action.visible && action.label) || [];

  // Versión horizontal (desktop/tablet)
  if (orientation === 'horizontal') {
    // Calcular el ancho para distribuir uniformemente
    const itemWidth = `${100 / totalSteps}%`;

    return (
      <div className="text-center position-relative" style={{ width: itemWidth, minWidth: '130px' }}>
        {/* Línea conectora entre pasos */}
        {index > 0 && (
          <div
            className={`position-absolute ${isActive ? 'bg-dark' : 'bg-secondary opacity-25'}`}
            style={{
              height: '2px',
              top: '20px',
              right: '50%',
              width: '100%',
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
  }

  // Versión vertical (móvil) - Perfectamente alineada con la línea central
  return (
    <div className="d-flex py-3 position-relative">
      {/* Círculo indicador - z-index elevado para aparecer sobre la línea */}
      <div
        className={`d-flex align-items-center justify-content-center rounded-circle me-3
          ${isActive ? 'bg-dark text-white' : 'bg-light text-secondary border'}`}
        style={{
          width: '40px',
          height: '40px',
          zIndex: 10,  // Mayor z-index para asegurar visibilidad
          position: 'relative',
          minWidth: '40px'
        }}
      >
        <i className={`bi bi-${step.icon}`}></i>
      </div>

      {/* Contenido y acciones */}
      <div className="flex-grow-1">
        <div className={`${isActive ? 'text-dark fw-medium' : 'text-secondary'} mb-1`}>
          {step.title}
        </div>
        <div className="small text-muted mb-2">{step.description}</div>

        {/* Botones de acción */}
        {visibleActions.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mt-2">
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