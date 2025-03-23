export const ActionItemCard = ({
                                 title,
                                 subtitle,
                                 isDefault = false,
                                 defaultBadgeText = "Predeterminado",
                                 iconComponent,
                                 actions = [],
                                 children,
                                 className = "",
                                 onClick, // Nuevo prop para manejar clics
                               }) => {
  // Determinar si la tarjeta es clicable
  const isClickable = typeof onClick === 'function';
  const cardClassName = `action-item ${className} ${isClickable ? 'clickable' : ''}`;

  return (
    <li
      className={cardClassName}
      onClick={isClickable ? onClick : undefined}
      style={isClickable ? { cursor: 'pointer' } : {}}
    >
      {/* Cabecera del elemento */}
      <div className="action-item-header">
        <div className="action-item-main">
          {/* Si hay un componente de icono, lo mostramos */}
          {iconComponent && (
            <div className="action-item-icon">
              {iconComponent}
            </div>
          )}

          <div className="action-item-info">
            {title && <h5 className="action-item-title">{title}</h5>}
            {subtitle && <div className="action-item-subtitle">{subtitle}</div>}
          </div>
        </div>

        {/* Badge de predeterminado (si aplica) */}
        {isDefault && (
          <span className="payment-default-tag">
            <i className="bi bi-check-circle-fill"></i>
            {defaultBadgeText}
          </span>
        )}
      </div>

      {/* Contenido adicional */}
      {children && (
        <div className="action-item-content">
          {children}
        </div>
      )}

      {/* Botones de acción */}
      <div className="action-item-actions">
        {actions.map((action, index) => (
          // Solo mostramos la acción si no tiene showIf o si showIf es true
          (action.showIf === undefined || action.showIf) && (
            <button
              key={index}
              className={`action-item-btn ${action.className || ""} ${action.type || ""}`}
              onClick={(e) => {
                e.stopPropagation(); // Evitar que el clic se propague a la tarjeta
                action.onClick();
              }}
              title={action.label}
              aria-label={action.label}
              disabled={action.disabled}
            >
              <i className={`bi bi-${action.icon}`}></i>
            </button>
          )
        ))}
      </div>
    </li>
  );
};