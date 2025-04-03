import React from 'react';
import PropTypes from 'prop-types';
import { StatusBadge, CoverageTypeBadge, ShippingMethodBadge } from '../ui';
import { getCoverageType } from '../../utils';

/**
 * Tabla para mostrar reglas de envío con un diseño minimalista y elegante
 */
const ShippingRulesTable = ({
  rules,
  onEdit,
  onDelete
}) => {
  // Si no hay reglas, mostrar mensaje
  if (!rules || rules.length === 0) {
    return null;
  }
  
  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          <thead style={{ backgroundColor: '#212529', color: 'white' }}>
            <tr>
              <th scope="col" className="px-3 py-3 border-0">Tipo</th>
              <th scope="col" className="px-3 py-3 border-0">Zona</th>
              <th scope="col" className="px-3 py-3 border-0">Métodos</th>
              <th scope="col" className="px-3 py-3 border-0">Estado</th>
              <th scope="col" className="px-3 py-3 border-0 text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => {
              // Determinar tipo de cobertura
              const coverageType = getCoverageType(rule);
              
              return (
                <tr key={rule.id} className="shipping-rule-row">
                  <td className="px-3 py-3 align-middle">
                    <CoverageTypeBadge type={coverageType} />
                  </td>
                  <td className="px-3 py-3 align-middle fw-medium">
                    {rule.zona}
                  </td>
                  <td className="px-3 py-3 align-middle">
                    {rule.opciones_mensajeria?.length > 0 ? (
                      <div className="d-flex flex-wrap gap-1">
                        {rule.opciones_mensajeria.slice(0, 2).map((opcion, idx) => (
                          <ShippingMethodBadge 
                            key={idx} 
                            option={opcion} 
                            showPrice={false}
                          />
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
                  <td className="px-3 py-3 align-middle">
                    <StatusBadge isActive={!!rule.activo} />
                  </td>
                  <td className="px-3 py-3 align-middle text-end">
                    <ActionButtons 
                      ruleId={rule.id}
                      ruleName={rule.zona}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Botones de acción para cada fila de la tabla
 */
const ActionButtons = ({ ruleId, ruleName, onEdit, onDelete }) => (
  <div className="d-flex gap-2 justify-content-end">
    <button
      className="btn btn-sm btn-outline-dark rounded-3"
      onClick={() => onEdit?.(ruleId)}
      title={`Editar regla: ${ruleName}`}
      aria-label={`Editar regla: ${ruleName}`}
    >
      <i className="bi bi-pencil"></i>
    </button>
    <button
      className="btn btn-sm btn-outline-danger rounded-3"
      onClick={() => {
        if (window.confirm(`¿Estás seguro de eliminar la regla para ${ruleName}?`)) {
          onDelete?.(ruleId);
        }
      }}
      title={`Eliminar regla: ${ruleName}`}
      aria-label={`Eliminar regla: ${ruleName}`}
    >
      <i className="bi bi-trash"></i>
    </button>
  </div>
);

ActionButtons.propTypes = {
  ruleId: PropTypes.string.isRequired,
  ruleName: PropTypes.string.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

ShippingRulesTable.propTypes = {
  /** Lista de reglas de envío */
  rules: PropTypes.array.isRequired,
  /** Función para editar una regla */
  onEdit: PropTypes.func,
  /** Función para eliminar una regla */
  onDelete: PropTypes.func
};

export default ShippingRulesTable; 