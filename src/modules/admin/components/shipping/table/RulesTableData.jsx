import React from 'react';
import { RuleTableRow } from './RuleTableRow';

/**
 * Componente que renderiza la estructura principal de la tabla (<table>)
 * y mapea los datos de las reglas a componentes RuleTableRow.
 * @param {{ 
 *   rules: Array<object>, 
 *   onEdit: (id: string) => void, 
 *   onDelete: (id: string) => void 
 * }} props
 */
export const RulesTableData = ({ rules, onEdit, onDelete }) => {
  // Si no hay reglas para mostrar (esto podría ser redundante si el padre ya lo verifica)
  if (!rules || rules.length === 0) {
    // Opcionalmente, retornar null o un mensaje, aunque el padre debería manejar el estado vacío.
    return null; 
  }

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="table-responsive">
        <table className="table table-hover mb-0">
          {/* Encabezado de la tabla: usar clase table-dark de Bootstrap */}
          <thead className="table-dark">
            <tr>
              <th scope="col" className="px-3 py-3 border-0">Nombre</th>
              <th scope="col" className="px-3 py-3 border-0">Tipo</th>
              <th scope="col" className="px-3 py-3 border-0">Métodos</th>
              <th scope="col" className="px-3 py-3 border-0">Estado</th>
              <th scope="col" className="px-3 py-3 border-0 text-end">Acciones</th>
            </tr>
          </thead>
          {/* Cuerpo de la tabla: Mapea cada regla a un RuleTableRow */}
          <tbody>
            {rules.map((rule) => (
              <RuleTableRow 
                key={rule.id} 
                rule={rule} 
                onEdit={onEdit} 
                onDelete={onDelete} 
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 