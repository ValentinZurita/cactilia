import React, { useState, useRef } from 'react';
import { CSVPreview } from './CSVPreview';
import { ImportSummary } from './ImportSummary';

/**
 * Componente para importar reglas de envío desde un archivo CSV.
 * Versión renovada con diseño minimalista
 */
export const ShippingImporter = ({ onImport, onCancel, onComplete }) => {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [importStrategy, setImportStrategy] = useState('skip');
  const [processing, setProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Manejar la selección de archivo
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setCsvData(null);
      return;
    }

    // Verificar tipo de archivo
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Por favor selecciona un archivo CSV válido.');
      setFile(null);
      setCsvData(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Leer el archivo como texto
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Parsear CSV manualmente para previsualización
        const text = event.target.result;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());

        // Verificar que el CSV tiene el formato esperado
        const requiredHeaders = ['zipcode', 'zona', 'precio_envio'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

        if (missingHeaders.length > 0) {
          setError(`El archivo CSV no contiene las columnas requeridas: ${missingHeaders.join(', ')}`);
          return;
        }

        // Procesar datos para previsualización
        const parsedData = [];
        for (let i = 1; i < Math.min(lines.length, 11); i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values = line.split(',');
          const rowData = {};

          headers.forEach((header, index) => {
            rowData[header] = values[index] ? values[index].trim() : '';
          });

          parsedData.push(rowData);
        }

        setCsvData({
          headers,
          rows: parsedData,
          totalRows: lines.length - 1,
          previewRows: parsedData.length
        });

      } catch (err) {
        console.error('Error al procesar el CSV:', err);
        setError('Error al procesar el archivo CSV. Asegúrate de que el formato es correcto.');
        setCsvData(null);
      }
    };

    reader.onerror = () => {
      setError('Error al leer el archivo.');
      setCsvData(null);
    };

    reader.readAsText(selectedFile);
  };

  // Manejar la importación del CSV
  const handleImport = async () => {
    if (!file) return;

    setProcessing(true);
    setError(null);

    try {
      // Leer el archivo como texto
      const text = await file.text();

      // Llamar a la función de importación proporcionada por el padre
      const result = await onImport(text, importStrategy);

      if (!result.ok) {
        throw new Error(result.error || 'Error al importar las reglas de envío');
      }

      setImportResult(result.data);

      // Si la importación fue exitosa y no hay errores, notificar completado
      if (result.data.errors.length === 0) {
        setTimeout(() => {
          onComplete();
        }, 3000);
      }

    } catch (err) {
      console.error('Error en la importación:', err);
      setError(err.message || 'Ocurrió un error durante la importación');
    } finally {
      setProcessing(false);
    }
  };

  // Reiniciar el proceso
  const handleReset = () => {
    setFile(null);
    setCsvData(null);
    setImportResult(null);
    setError(null);

    // Limpiar input de archivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Renderizar resultado de importación si está disponible
  if (importResult) {
    return (
      <ImportSummary
        result={importResult}
        onReset={handleReset}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        {/* Guía de importación */}
        <div className="mb-4">
          <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Instrucciones de Importación</h6>

          <div className="alert alert-secondary py-3 mb-3">
            <div className="d-flex">
              <i className="bi bi-info-circle fs-5 text-secondary me-3 mt-1"></i>
              <div>
                <p className="mb-2">El archivo CSV debe contener las siguientes columnas:</p>
                <div className="bg-light p-2 rounded mb-2">
                  <code>zipcode,zona,precio_envio,envio_gratis,servicios</code>
                </div>
                <p className="mb-0 small">
                  <strong>Ejemplo:</strong> 72000,Puebla Centro,50,false,estandar|express
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="alert alert-danger py-2 mb-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
        </div>

        {/* Selector de archivo */}
        <div className="mb-4">
          <div className="mb-3">
            <label htmlFor="csv-file" className="form-label text-secondary small">Seleccionar Archivo CSV</label>
            <div className="input-group">
              <input
                ref={fileInputRef}
                type="file"
                id="csv-file"
                className="form-control"
                accept=".csv"
                onChange={handleFileSelect}
                disabled={processing}
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={processing}
              >
                <i className="bi bi-upload"></i>
              </button>
            </div>
          </div>

          {file && (
            <div className="alert alert-success py-2 d-flex align-items-center">
              <i className="bi bi-file-earmark-text me-2"></i>
              <div>
                <strong>{file.name}</strong>
                <span className="ms-2 small text-muted">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
            </div>
          )}
        </div>

        {/* Previsualización si hay datos */}
        {csvData && (
          <>
            <div className="mb-4">
              <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Vista Previa</h6>
              <CSVPreview data={csvData} />
            </div>

            {/* Opciones de importación */}
            <div className="mb-4">
              <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">Opciones de Importación</h6>
              <div className="card border-0 rounded-4 bg-light">
                <div className="card-body p-3">
                  <div className="form-check mb-3">
                    <input
                      type="radio"
                      id="strategy-skip"
                      name="import-strategy"
                      className="form-check-input"
                      value="skip"
                      checked={importStrategy === 'skip'}
                      onChange={(e) => setImportStrategy(e.target.value)}
                      disabled={processing}
                    />
                    <label className="form-check-label" htmlFor="strategy-skip">
                      <span className="fw-medium">Omitir duplicados</span>
                      <p className="mb-0 small text-muted">No importar códigos postales que ya existen</p>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      id="strategy-overwrite"
                      name="import-strategy"
                      className="form-check-input"
                      value="overwrite"
                      checked={importStrategy === 'overwrite'}
                      onChange={(e) => setImportStrategy(e.target.value)}
                      disabled={processing}
                    />
                    <label className="form-check-label" htmlFor="strategy-overwrite">
                      <span className="fw-medium">Sobrescribir duplicados</span>
                      <p className="mb-0 small text-muted">Reemplazar códigos postales existentes</p>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Botones de acción */}
        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
          <button
            type="button"
            className="btn btn-outline-secondary rounded-3"
            onClick={onCancel}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-outline-dark rounded-3"
            onClick={handleImport}
            disabled={!csvData || processing}
          >
            {processing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Procesando...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-upload me-2"></i>
                Importar {csvData?.totalRows || 0} Reglas
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}