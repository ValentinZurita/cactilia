import { useState } from 'react';

/**
 * Custom hook to toggle a boolean state
 * @returns {[boolean, Function]} - The current state and a function to toggle it
 */
const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue((prev) => !prev);
  return [value, toggle];
};

/**
 * Action button component
 * @param {Object} props - Props for the button
 * @param {string} props.className - Additional classes for the button
 * @param {Function} props.onClick - Click handler for the button
 * @param {string} props.title - Title for the button
 * @param {JSX.Element} props.icon - Icon to display in the button
 * @returns {JSX.Element}
 */
const ActionButton = ({ className, onClick, title, icon }) => (
  <button
    type="button"
    className={`btn btn-sm ${className}`}
    onClick={onClick}
    title={title}
  >
    {icon}
  </button>
);

/**
 * Elemento individual en la lista de bloques
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {string} props.title - Título a mostrar
 * @param {string} props.icon - Clase del icono
 * @param {boolean} props.isSelected - Si está seleccionado
 * @param {Function} props.onClick - Manejador de clic
 * @param {Function} props.onDelete - Manejador para eliminar
 * @param {Function} props.onClone - Manejador para clonar
 * @param {Function} props.onMoveUp - Manejador para mover arriba
 * @param {Function} props.onMoveDown - Manejador para mover abajo
 * @param {boolean} props.isFirst - Si es el primer elemento
 * @param {boolean} props.isLast - Si es el último elemento
 * @returns {JSX.Element}
 */
export const BlockItem = ({
                            block,
                            title,
                            icon,
                            isSelected,
                            onClick,
                            onDelete,
                            onClone,
                            onMoveUp,
                            onMoveDown,
                            isFirst = false,
                            isLast = false
                          }) => {
  // Estado para mostrar/ocultar menú de opciones
  const [showOptions, toggleShowOptions] = useToggle(false);

  // Obtener nombre para mostrar (para bloques con título propio)
  const displayName = block.title ? `${title}: ${block.title}` : title;

  return (
    <div
      className={`block-item p-3 mb-2 border rounded d-flex flex-column ${
        isSelected ? 'border-primary bg-light' : 'border-light'
      }`}
    >

      {/* Contenido principal del bloque */}
      <div className="d-flex justify-content-between align-items-center" onClick={onClick}>
        <div className="d-flex align-items-center">
          <i className="bi bi-grip-vertical text-muted me-2"></i>
          <i className={`bi ${icon} me-2 ${isSelected ? 'text-primary' : 'text-muted'}`}></i>
          <span className="fw-medium text-truncate" style={{ maxWidth: "150px" }}>
            {displayName}
          </span>
        </div>

        {/* Toggle de opciones */}
        <ActionButton
          className="btn-link text-secondary p-0"
          onClick={(e) => { e.stopPropagation(); toggleShowOptions(); } }
          title="Opciones"
          icon={<i className="bi bi-three-dots-vertical"></i>}
        />
      </div>

      {/* Panel de opciones expandible */}
      {showOptions && (
        <div className="block-options mt-2 pt-2 border-top">
          <div className="d-flex justify-content-between">

            {/* Opciones de movimiento */}
            <div>

              {/* Botones de mover arriba/abajo */}
              <ActionButton
                className="btn-outline-secondary me-1"
                onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
                title="Mover arriba"
                icon={<i className="bi bi-arrow-up"></i>}
                disabled={isFirst}
              />

              {/* Botón de mover abajo */}
              <ActionButton
                className="btn-outline-secondary"
                onClick={(e) => { e.stopPropagation(); onMoveDown(); } }
                title="Mover abajo"
                icon={<i className="bi bi-arrow-down"></i>}
                disabled={isLast}
              />

            </div>

            {/* Opciones de clonar/eliminar */}
            <div>

              {/* Botón de clonar */}
              <ActionButton
                className="btn-outline-primary me-1"
                onClick={(e) => { e.stopPropagation(); onClone(); } }
                title="Duplicar bloque"
                icon={<i className="bi bi-copy"></i>}
              />

              {/* Botón de eliminar */}
              <ActionButton
                className="btn-outline-danger"
                onClick={ (e) => { e.stopPropagation(); onDelete(); } }
                title="Eliminar bloque"
                icon={<i className="bi bi-trash"></i>}
              />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};