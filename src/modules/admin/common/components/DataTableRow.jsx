import React from 'react';

/**
 * Componente reutilizable para renderizar una fila (<tr>) de DataTable.
 * Itera sobre la configuración de columnas para renderizar las celdas (<td>)
 * usando la función `renderCell` proporcionada para cada columna.
 *
 * @param {{
 *   item: any,                       // Objeto de datos para esta fila.
 *   columns: Array<import('./DataTable').DataTableColumn> // Configuración de columnas.
 * }} props
 */
export const DataTableRow = ({ item, columns }) => {
  return (
    <tr className="align-middle"> {/* Alineación vertical por defecto */}
      {columns.map((col) => (
        <td key={col.key} className={`px-3 py-3 ${col.cellClassName || ''}`}>
          {/* Llama a la función renderCell definida en la config de la columna */}
          {col.renderCell(item)}
        </td>
      ))}
    </tr>
  );
}; 