import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  removeInvoiceFilesFromOrder,
  uploadInvoiceFilesForOrder,
  removeInvoiceFileByType
} from '../services/invoiceService.js'

/**
 * Componente para subir facturas a un pedido (PDF y XML)
 * Diseño sobrio y minimalista con estructura simplificada
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido
 * @param {Object} props.billing - Datos de facturación del pedido
 * @param {Function} props.onInvoiceUploaded - Función que se ejecuta cuando se sube una factura
 * @returns {JSX.Element}
 */
export const InvoiceUploader = ({ orderId, billing, onInvoiceUploaded }) => {
  // Estados locales
  const [pdfFile, setPdfFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Obtener el ID del usuario actual (administrador)
  const { uid } = useSelector(state => state.auth);

  // Comprobar si hay facturas ya subidas
  const hasPdf = billing?.invoicePdfUrl && billing?.invoicePdfName;
  const hasXml = billing?.invoiceXmlUrl && billing?.invoiceXmlName;
  const hasInvoice = hasPdf || hasXml || (billing?.invoiceUrl && billing?.invoiceFileName);

  /**
   * Manejar cambio de archivo PDF
   * @param {Event} e - Evento del input
   */
  const handlePdfChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

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
  };

  /**
   * Manejar cambio de archivo XML
   * @param {Event} e - Evento del input
   */
  const handleXmlChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

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
  };

  /**
   * Manejar subida de archivos
   */
  const handleUpload = async () => {
    if (!pdfFile && !xmlFile) {
      setError('Selecciona al menos un archivo para subir');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadInvoiceFilesForOrder(orderId, pdfFile, xmlFile, uid);

      if (!result.ok) {
        throw new Error(result.error || 'Error al subir los archivos de factura');
      }

      setPdfFile(null);
      setXmlFile(null);
      setShowUploadForm(false);

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

  /**
   * Manejar eliminación de archivo específico
   * @param {string} fileType - Tipo de archivo ('pdf' o 'xml')
   */
  const handleRemoveFile = async (fileType) => {
    const fileTypeLabel = fileType === 'pdf' ? 'PDF' : 'XML';

    if (!window.confirm(`¿Estás seguro de eliminar el archivo ${fileTypeLabel}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await removeInvoiceFileByType(orderId, fileType);

      if (!result.ok) {
        throw new Error(result.error || `Error al eliminar el archivo ${fileTypeLabel}`);
      }

      // Notificar al componente padre
      if (onInvoiceUploaded) {
        onInvoiceUploaded(null);
      }
    } catch (err) {
      setError(err.message || `Error al eliminar el archivo ${fileTypeLabel}`);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Función para obtener fecha formateada
   * @param {Object|Date} timestamp - Timestamp
   * @returns {string} - Fecha formateada
   */
  const getFormattedDate = (timestamp) => {
    if (!timestamp) return 'Fecha no disponible';

    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return 'Fecha no disponible';
  };

  /**
   * Renderiza el listado de archivos de factura
   */
  const renderInvoiceFiles = () => (
    <>
      <p className="text-muted small mb-4">
        Subido: {getFormattedDate(billing.invoiceUploadedAt)}
      </p>

      {/* PDF */}
      {(hasPdf || billing?.invoiceUrl) && (
        <div className="d-flex justify-content-between align-items-center border-bottom py-3 mb-4">
          <div>
            <i className="bi bi-file-earmark-pdf text-danger me-3"></i>
            <a
              href={billing.invoicePdfUrl || billing.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-dark"
            >
              {billing.invoicePdfName || billing.invoiceFileName}
            </a>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary invoice-delete-btn"
            onClick={() => handleRemoveFile('pdf')}
            disabled={uploading}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* XML */}
      {hasXml && (
        <div className="d-flex justify-content-between align-items-center py-3">
          <div>
            <i className="bi bi-file-earmark-code text-success me-3"></i>
            <a
              href={billing.invoiceXmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none text-dark"
            >
              {billing.invoiceXmlName}
            </a>
          </div>
          <button
            className="btn btn-sm btn-outline-secondary invoice-delete-btn"
            onClick={() => handleRemoveFile('xml')}
            disabled={uploading}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* Estilos específicos para el botón de eliminar */}
      <style dangerouslySetInnerHTML={{__html: `
        .invoice-delete-btn:hover {
          color: white;
          background-color: #dc3545;
          border-color: #dc3545;
        }
      `}} />
    </>
  );

  /**
   * Renderiza formulario de subida
   */
  const renderUploadForm = () => (
    <form className="mt-4">
      <fieldset disabled={uploading}>
        {/* Archivo PDF */}
        <div className="mb-4">
          <label className="form-label small text-secondary">Archivo PDF</label>
          <input
            type="file"
            className="form-control form-control-sm"
            onChange={handlePdfChange}
            accept=".pdf,application/pdf"
          />
          <p className="form-text small">Formato PDF. Tamaño máximo: 5MB.</p>
        </div>

        {/* Archivo XML */}
        <div className="mb-4">
          <label className="form-label small text-secondary">Archivo XML</label>
          <input
            type="file"
            className="form-control form-control-sm"
            onChange={handleXmlChange}
            accept=".xml,application/xml,text/xml"
          />
          <p className="form-text small">Formato XML (CFDI). Tamaño máximo: 5MB.</p>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="alert alert-danger py-2 small mb-4">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Botones de acción */}
        <div className="d-flex gap-3 justify-content-end">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowUploadForm(false)}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-dark"
            onClick={handleUpload}
            disabled={!pdfFile && !xmlFile}
          >
            {uploading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Subiendo...
              </>
            ) : (
              <>
                <i className="bi bi-cloud-upload me-2"></i>
                Subir archivos
              </>
            )}
          </button>
        </div>
      </fieldset>
    </form>
  );

  /**
   * Renderiza el estado vacío
   */
  const renderEmptyState = () => (
    <div className="text-center py-4">
      <p className="text-secondary mb-4">No hay facturas subidas para este pedido</p>
      <button
        type="button"
        className="btn btn-sm btn-outline-dark"
        onClick={() => setShowUploadForm(true)}
      >
        <i className="bi bi-cloud-upload me-2"></i>
        Subir factura
      </button>
    </div>
  );

  // Componente principal
  return (
    <section className="invoice-uploader">
      <h6 className="border-bottom pb-2 mb-4 text-secondary fw-normal">Factura Electrónica</h6>

      {hasInvoice ? renderInvoiceFiles() :
        (showUploadForm ? renderUploadForm() : renderEmptyState())}
    </section>
  );
};