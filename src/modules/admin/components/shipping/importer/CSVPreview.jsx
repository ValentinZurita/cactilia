import React from 'react';

/**
 * Componente para mostrar una vista previa de los datos CSV.
 * Versión renovada con diseño más limpio
 */
export const CSVPreview = ({ data }) => {
  const { headers, rows, totalRows, previewRows } = data;

  // Si no hay datos para mostrar
  if (!headers || !rows || rows.length === 0) {
    return (
      <div className="alert alert-secondary py-3">
        <div className="d-flex align-items-center">
          <i className="bi bi-info-circle text-secondary me-3 fs-4"></i>
          <p className="mb-0">No hay datos para mostrar en la vista previa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="csv-preview">
      {/* Información de vista previa */}
      <div className="d-flex justify-content-between mb-3">
        <span className="text-secondary small">
          Mostrando {previewRows} de {totalRows} filas
        </span>
        {totalRows > previewRows && (
          <span className="text-muted small">
            <i className="bi bi-info-circle me-1"></i>
            {totalRows - previewRows} filas adicionales no mostradas
          </span>
        )}
      </div>

      {/* Tabla de vista previa */}
      <div className="table-responsive">
        <table className="table table-sm table-hover border">
          <thead className="bg-light">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="text-secondary small fw-medium">
                {header}
              </th>
            ))}
          </tr>
          </thead>
          <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="small">
                  {row[header] !== undefined ? row[header] :
                    <span className="text-muted fst-italic">vacío</span>}
                </td>
              ))}
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};