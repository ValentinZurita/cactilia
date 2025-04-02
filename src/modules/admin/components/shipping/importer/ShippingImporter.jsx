import React, { useState, useRef } from 'react';
import { CSVPreview } from './CSVPreview';
import { ImportSummary } from './ImportSummary';

/**
 * Componente para importar reglas de envío desde un archivo CSV.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onImport - Función para importar las reglas
 * @param {Function} props.onCancel - Función para cancelar la importación
 * @param {Function} props.onComplete - Función a llamar cuando se completa la importación
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

  // Manejar el cambio de estrategia de importación
  const handleStrategyChange = (e) => {
    setImportStrategy(e.target.value);
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

  // Seleccionar otro archivo
  const handleChangeFile = () => {
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    <div className="shipping-importer card border-0 shadow-sm rounded-4">
      <div className="card-body p-4">
        {/* Guía de importación */}
        <div className="mb-4">
          <h5 className="card-title mb-3">Importar Reglas de Envío</h5>
          <p className="card-text text-muted">
            Sube un archivo CSV con las reglas de envío. El archivo debe contener las siguientes columnas:
          </p>
          <div className="bg-light p-3 rounded-3 mb-3">
            <code>zipcode,zona,precio_envio,envio_gratis,servicios</code>
          </div>
          <p className="small text-muted mb-0">
            <strong>Ejemplo:</strong><br />
            <code>72000,Puebla Centro,50,false,estandar|express</code><br />
            <code>72001,Puebla Norte,60,false,express</code>
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Selector de archivo */}
        <div className="mb-4">
          <label htmlFor="csv-file" className="form-label">Seleccionar Archivo CSV</label>
          <input
            ref={fileInputRef}
            type="file"
            id="csv-file"
            className="form-control"
            accept=".csv"
            onChange={handleFileSelect}
            disabled={processing}
          />
        </div>

        {/* Previsualización si hay datos */}
        {csvData && (
          <>
            <CSVPreview data={csvData} />

            {/* Opciones de importación */}
            <div className="mb-4 mt-4">
              <label className="form-label">Opciones de Importación</label>
              <div className="card bg-light border-0 rounded-3">
                <div className="card-body">
                  <div className="form-check mb-2">
                    <input
                      type="radio"
                      id="strategy-skip"
                      name="import-strategy"
                      className="form-check-input"
                      value="skip"
                      checked={importStrategy === 'skip'}
                      onChange={handleStrategyChange}
                      disabled={processing}
                    />
                    <label className="form-check-label" htmlFor="strategy-skip">
                      <strong>Omitir duplicados</strong> - No importar códigos postales que ya existen
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
                      onChange={handleStrategyChange}
                      disabled={processing}
                    />
                    <label className="form-check-label" htmlFor="strategy-overwrite">
                      <strong>Sobrescribir duplicados</strong> - Reemplazar códigos postales existentes
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
            className="btn btn-outline-secondary"
            onClick={onCancel}
            disabled={processing}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
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
};