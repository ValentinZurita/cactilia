import React, { useState, useMemo } from 'react';
import { LoadingIndicator } from './LoadingIndicator';
import { EmptyState } from './EmptyState';
import { DataTableRow } from './DataTableRow'; // Importar el componente de fila

/**
 * @typedef {object} DataTableColumn
 * @property {string} key - Identificador único para la columna. Usado para ordenación.
 * @property {React.ReactNode | string} header - Contenido para la celda de cabecera (<th>).
 * @property {(item: any) => React.ReactNode} renderCell - Función que recibe un item de datos y devuelve el JSX para la celda (<td>).
 * @property {boolean} [isSortable] - Indica si la columna se puede ordenar.
 * @property {string} [cellClassName] - Clases CSS opcionales para aplicar a las celdas (<td>) de esta columna.
 * @property {string} [headerClassName] - Clases CSS opcionales para aplicar a la cabecera (<th>) de esta columna.
 */

/**
 * @typedef {object} SortConfig
 * @property {string | null} key - La 'key' de la columna por la que se ordena actualmente.
 * @property {'asc' | 'desc' | null} direction - La dirección de la ordenación.
 */

/**
 * Componente reutilizable para mostrar datos tabulares con soporte para carga,
 * estados vacíos y ordenación básica (controlada externamente).
 *
 * @param {{
 *   data: Array<any>,                // Array de objetos a mostrar.
 *   columns: Array<DataTableColumn>, // Configuración de las columnas.
 *   isLoading: boolean,              // Indica si los datos están cargando.
 *   keyExtractor: (item: any) => string | number, // Función para obtener una key única para cada fila.
 *   sortConfig?: SortConfig,          // Configuración actual de ordenación { key, direction }.
 *   onSortChange?: (sortKey: string) => void, // Callback al hacer clic en una cabecera ordenable.
 *   tableClassName?: string,          // Clases CSS opcionales para la tabla.
 *   emptyStateTitle?: string,         // Título para el estado vacío si no hay datos.
 *   emptyStateMessage?: string,       // Mensaje para el estado vacío si no hay datos.
 *   emptyStateIconClass?: string,     // Icono para el estado vacío si no hay datos.
 *   noResultsTitle?: string,          // Título si hay filtro activo pero no hay resultados.
 *   noResultsMessage?: string,        // Mensaje si hay filtro activo pero no hay resultados.
 *   noResultsIconClass?: string       // Icono si hay filtro activo pero no hay resultados.
 *   isFiltered?: boolean              // Indica si los datos actuales son resultado de un filtro.
 * }} props
 */
export const DataTable = ({
  data = [],
  columns = [],
  isLoading = false,
  keyExtractor,
  sortConfig = { key: null, direction: null },
  onSortChange,
  tableClassName = "table table-hover mb-0", // Clases por defecto de Bootstrap
  emptyStateTitle = "No hay datos disponibles",
  emptyStateMessage,
  emptyStateIconClass = "bi bi-table",
  noResultsTitle = "No se encontraron resultados",
  noResultsMessage,
  noResultsIconClass = "bi bi-search",
  isFiltered = false
}) => {

  const handleHeaderClick = (columnKey) => {
    if (onSortChange) {
      onSortChange(columnKey);
    }
  };

  // Determinar estados
  const hasData = data && data.length > 0;
  const showLoading = isLoading;
  const showEmptyState = !isLoading && !hasData && !isFiltered;
  const showNoResultsState = !isLoading && !hasData && isFiltered;
  const showTable = !isLoading && hasData;

  // Renderizar icono de ordenación
  const renderSortIcon = (columnKey) => {
    if (!onSortChange) return null; // No mostrar si no hay callback de ordenación

    if (sortConfig.key !== columnKey) {
      // No ordenado por esta columna (o icono neutro)
      return <i className="bi bi-arrow-down-up ms-2 opacity-25"></i>;
    }
    if (sortConfig.direction === 'asc') {
      return <i className="bi bi-sort-up ms-2"></i>;
    }
    if (sortConfig.direction === 'desc') {
      return <i className="bi bi-sort-down ms-2"></i>;
    }
    return null; // Por si acaso
  };

  return (
    <div className="data-table-container">
      {showLoading && (
        <LoadingIndicator message="Cargando datos..." />
      )}

      {showEmptyState && (
        <EmptyState
          iconClass={emptyStateIconClass}
          title={emptyStateTitle}
          message={emptyStateMessage}
        />
      )}

      {showNoResultsState && (
         <EmptyState
          iconClass={noResultsIconClass}
          title={noResultsTitle}
          message={noResultsMessage}
        />
      )}

      {showTable && (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className={tableClassName}>
              <thead className="table-dark">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={`px-3 py-3 border-0 ${col.isSortable && onSortChange ? 'cursor-pointer' : ''} ${col.headerClassName || ''}`}
                      onClick={col.isSortable ? () => handleHeaderClick(col.key) : undefined}
                      style={col.isSortable && onSortChange ? { cursor: 'pointer' } : {}}
                    >
                      {col.header}
                      {col.isSortable && renderSortIcon(col.key)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <DataTableRow
                    key={keyExtractor(item)}
                    item={item}
                    columns={columns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}; 