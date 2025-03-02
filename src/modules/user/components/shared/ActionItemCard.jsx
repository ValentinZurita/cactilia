/**
 * Componente genérico para mostrar un elemento con acciones (editar, eliminar, establecer como predeterminado)
 * Usado para direcciones, métodos de pago, y otros elementos similares
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título principal del elemento
 * @param {string|JSX.Element} props.subtitle - Subtítulo o descripción secundaria
 * @param {boolean} props.isDefault - Si el elemento es el predeterminado
 * @param {string} props.defaultBadgeText - Texto a mostrar en la etiqueta de predeterminado
 * @param {JSX.Element} props.iconComponent - Icono o imagen principal
 * @param {Array} props.actions - Lista de acciones disponibles: [{icon, label, onClick, showIf}]
 * @param {JSX.Element} props.children - Contenido adicional a mostrar en el cuerpo
 * @param {string} props.className - Clases CSS adicionales
 * @returns {JSX.Element}
 */
export const ActionItemCard = ({
                                 title,
                                 subtitle,
                                 isDefault = false,
                                 defaultBadgeText = "Predeterminado",
                                 iconComponent,
                                 actions = [],
                                 children,
                                 className = ""
                               }) => {
  return (
    <li className={`action-item ${className}`}>
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
          <span className="action-item-default-badge">
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
              onClick={action.onClick}
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