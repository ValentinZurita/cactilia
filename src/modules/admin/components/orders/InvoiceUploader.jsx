import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { removeInvoiceFilesFromOrder, uploadInvoiceFilesForOrder } from './invoiceService.js'

/**
 * Componente para subir facturas a un pedido (PDF y XML)
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido
 * @param {Object} props.billing - Datos de facturación del pedido
 * @param {Function} props.onInvoiceUploaded - Función que se ejecuta cuando se sube una factura
 * @returns {JSX.Element}
 */
export const InvoiceUploader = ({ orderId, billing, onInvoiceUploaded }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Obtener el ID del usuario actual (administrador)
  const { uid } = useSelector(state => state.auth);

  // Comprobar si hay facturas ya subidas
  const hasPdf = billing?.invoicePdfUrl && billing?.invoicePdfName;
  const hasXml = billing?.invoiceXmlUrl && billing?.invoiceXmlName;
  const hasInvoice = hasPdf || hasXml || (billing?.invoiceUrl && billing?.invoiceFileName);

  // Manejar cambio de archivo PDF
  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('application/pdf')) {
        setError('El PDF debe ser un archivo PDF válido');
        setPdfFile(null);
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo PDF es demasiado grande. Máximo 5MB.');
        setPdfFile(null);
        return;
      }

      setPdfFile(selectedFile);
      setError(null);
    }
  };

  // Manejar cambio de archivo XML
  const handleXmlChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('application/xml') &&
        !selectedFile.type.startsWith('text/xml') &&
        !selectedFile.name.toLowerCase().endsWith('.xml')) {
        setError('El archivo XML debe ser un archivo XML válido');
        setXmlFile(null);
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo XML es demasiado grande. Máximo 5MB.');
        setXmlFile(null);
        return;
      }

      setXmlFile(selectedFile);
      setError(null);
    }
  };

  // Manejar subida de archivos
  const handleUpload = async () => {
    if (!pdfFile && !xmlFile) {
      setError('Selecciona al menos un archivo para subir');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      // Usar la función actualizada que acepta PDF y XML
      const result = await uploadInvoiceFilesForOrder(orderId, pdfFile, xmlFile, uid);

      if (!result.ok) {
        throw new Error(result.error || 'Error al subir los archivos de factura');
      }

      setSuccess(true);
      setPdfFile(null);
      setXmlFile(null);

      // Notificar al componente padre
      if (onInvoiceUploaded) {
        onInvoiceUploaded(result.data);
      }
    } catch (err) {
      setError(err.message || 'Error al subir los archivos de factura');
    } finally {
      setUploading(false);
    }
  };

  // Manejar eliminación de facturas
  const handleRemove = async () => {
    if (!hasInvoice) return;

    if (!window.confirm('¿Estás seguro de eliminar los archivos de factura? Esta acción no se puede deshacer.')) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await removeInvoiceFilesFromOrder(orderId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar los archivos de factura');
      }

      // Notificar al componente padre
      if (onInvoiceUploaded) {
        onInvoiceUploaded(null);
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar los archivos de factura');
    } finally {
      setUploading(false);
    }
  };

  // Función para obtener fecha formateada
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';

    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return 'Fecha no disponible';
  };

  return (
    <div className="invoice-uploader">
      <h6 className="mb-3">Factura Electrónica</h6>

      {/* Si ya existen archivos de factura, mostrar información */}
      {hasInvoice && (
        <div className="mb-3">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div className="d-flex">
              <div className="ms-2">
                <div className="text-muted small">
                  Subido: {getFormattedDate(billing.invoiceUploadedAt)}
                </div>
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
              disabled={uploading}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>

          {/* PDF */}
          {(hasPdf || billing?.invoiceUrl) && (
            <div className="d-flex align-items-center mb-2 border-bottom pb-2">
              <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
              <div>
                <a
                  href={billing.invoicePdfUrl || billing.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-medium"
                >
                  {billing.invoicePdfName || billing.invoiceFileName}
                </a>
                <span className="ms-2 badge bg-primary">PDF</span>
              </div>
            </div>
          )}

          {/* XML */}
          {hasXml && (
            <div className="d-flex align-items-center">
              <i className="bi bi-file-earmark-code text-primary me-2"></i>
              <div>
                <a
                  href={billing.invoiceXmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fw-medium"
                >
                  {billing.invoiceXmlName}
                </a>
                <span className="ms-2 badge bg-info">XML</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Si no hay factura o queremos reemplazarla */}
      {!hasInvoice && (
        <>
          <div className="row mb-3">
            {/* Archivo PDF */}
            <div className="col-12 mb-2">
              <label className="form-label mb-1">Archivo PDF</label>
              <input
                type="file"
                className="form-control"
                onChange={handlePdfChange}
                accept=".pdf,application/pdf"
                disabled={uploading}
              />
              <div className="form-text small">
                Archivo PDF de la factura. Tamaño máximo: 5MB.
              </div>
            </div>

            {/* Archivo XML */}
            <div className="col-12">
              <label className="form-label mb-1">Archivo XML</label>
              <input
                type="file"
                className="form-control"
                onChange={handleXmlChange}
                accept=".xml,application/xml,text/xml"
                disabled={uploading}
              />
              <div className="form-text small">
                Archivo XML de la factura (CFDI). Tamaño máximo: 5MB.
              </div>
            </div>
          </div>

          {/* Mostrar errores */}
          {error && (
            <div className="alert alert-danger py-2 small">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Mostrar éxito */}
          {success && (
            <div className="alert alert-success py-2 small">
              <i className="bi bi-check-circle-fill me-2"></i>
              Archivos de factura subidos correctamente
            </div>
          )}

          <div className="d-grid">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={(!pdfFile && !xmlFile) || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Subiendo...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Subir Archivos
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};