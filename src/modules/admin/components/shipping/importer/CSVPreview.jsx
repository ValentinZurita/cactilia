import React from 'react';

/**
 * Componente para mostrar una vista previa de los datos CSV.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.data - Datos del CSV
 * @param {Array} props.data.headers - Cabeceras del CSV
 * @param {Array} props.data.rows - Filas de datos
 * @param {number} props.data.totalRows - Total de filas en el archivo
 * @param {number} props.data.previewRows - Filas mostradas en la vista previa
 */
export const CSVPreview = ({ data }) => {
  const { headers, rows, totalRows, previewRows } = data;

  // Si no hay datos para mostrar
  if (!headers || !rows || rows.length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="bi bi-info-circle me-2"></i>
        No hay datos para mostrar en la vista previa.
      </div>
    );
  }

  return (
    <div className="csv-preview">
      <h6 className="mb-3">Vista Previa ({previewRows} de {totalRows} filas)</h6>

      <div className="table-responsive">
        <table className="table table-sm table-striped table-bordered">
          <thead className="table-dark">
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>{row[header] || ''}</td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>

      {totalRows > previewRows && (
        <div className="text-center text-muted small mt-2">
          <i className="bi bi-three-dots me-1"></i>
          {totalRows - previewRows} filas más no mostradas en la vista previa
        </div>
      )}
    </div>
  );
};