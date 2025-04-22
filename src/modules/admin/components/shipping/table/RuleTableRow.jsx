import React from 'react';
import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { ActionButtonsContainer } from '../components/ActionButtonsContainer';
import { ActionButton } from '../components/ActionButton';

/**
 * Componente para renderizar una fila (<tr>) de la tabla de reglas de envío.
 * Utiliza ActionButtonsContainer y ActionButton para las acciones.
 * @param {{ 
 *   rule: object, 
 *   onEdit: (id: string) => void, 
 *   onDelete: (id: string) => void 
 * }} props
 */
export const RuleTableRow = ({ rule, onEdit, onDelete }) => {

  // Determinar tipo de cobertura (lógica de presentación específica de la fila)
  let coverageType = "CP";
  if (rule.zipcodes && rule.zipcodes.length > 0) {
    if (rule.zipcodes.includes('nacional')) {
      coverageType = "Nacional";
    } else if (rule.zipcodes.some(z => z.startsWith('estado_'))) {
      coverageType = "Regional";
    }
  }

  // Callbacks específicos para esta fila
  const handleEdit = () => onEdit(rule.id);
  const handleDelete = () => onDelete(rule.id);

  return (
    <tr className="shipping-rule-row align-middle">
      {/* Tipo de Cobertura */}
      <td className="px-3 py-3">{coverageType}</td>
      
      {/* Nombre de la Zona */}
      <td className="px-3 py-3 fw-medium">{rule.zona}</td>
      
      {/* Métodos de Envío (resumen) */}
      <td className="px-3 py-3">
        {rule.opciones_mensajeria?.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">
            {rule.opciones_mensajeria.slice(0, 2).map((opcion, idx) => (
              <span
                key={idx}
                className="badge bg-light text-dark border"
                title={`${opcion.tiempo_entrega || 'N/A'} - $${opcion.precio || 0} MXN`}
              >
                {opcion.nombre || 'Sin nombre'}
              </span>
            ))}
            {rule.opciones_mensajeria.length > 2 && (
              <span className="badge bg-light text-dark border">
                +{rule.opciones_mensajeria.length - 2}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted small">No disponible</span>
        )}
      </td>
      
      {/* Estado (Activo/Inactivo) */}
      <td className="px-3 py-3">
        <RuleStatusBadge isActive={rule.activo} />
      </td>
      
      {/* Botones de Acción */}
      <td className="px-3 py-3 text-end">
        <ActionButtonsContainer size="sm" ariaLabel="Acciones de regla">
          {/* Botón Editar */} 
          <ActionButton 
            iconClass="bi bi-pencil"
            title="Editar regla"
            onClick={handleEdit}
            variant="light"       // Fondo gris claro
            textColor="secondary" // Icono gris
            isFirst={true}        // Es el primer botón en el grupo
          />
          {/* Botón Eliminar */} 
          <ActionButton 
            iconClass="bi bi-trash"
            title="Eliminar regla"
            onClick={handleDelete}
            confirmMessage={`¿Estás seguro de eliminar la regla para "${rule.zona}"?`} // Mensaje de confirmación
            variant="light"       // Fondo gris claro
            textColor="secondary" // Color inicial del icono
            hoverTextColor="danger" // Color del icono al hacer hover
            isLast={true}         // Es el último botón en el grupo
          />
          {/* Aquí podrías añadir más ActionButton si fuera necesario en el futuro */} 
        </ActionButtonsContainer>
      </td>
    </tr>
  );
}; 