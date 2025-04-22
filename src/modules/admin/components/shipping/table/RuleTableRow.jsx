import React from 'react';
import { RuleStatusBadge } from '../components/RuleStatusBadge';
import { ActionButtonsContainer } from '../components/ActionButtonsContainer';
import { ActionButton } from '../components/ActionButton';
import { ShippingMethodsSummary } from '../components/ShippingMethodsSummary';

/**
 * Componente para renderizar una fila (<tr>) de la tabla de reglas de envío.
 * Utiliza componentes dedicados para Estado, Acciones y Resumen de Métodos.
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
      {/* Nombre */}
      <td className="px-3 py-3 fw-medium">{rule.zona}</td>
      {/* Tipo */}
      <td className="px-3 py-3">{coverageType}</td>
      
      {/* Métodos de Envío (resumen) */}
      <td className="px-3 py-3">
        <ShippingMethodsSummary methods={rule.opciones_mensajeria} />
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