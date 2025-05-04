import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { getFunctions, httpsCallable } from 'firebase/functions';
import {
  removeInvoiceFilesFromOrder,
  uploadInvoiceFilesForOrder,
  removeInvoiceFileByType
} from '../services/invoiceService.js'
import { selectSendingInvoice } from '../thunks/orderSelectors.js'
import { sendInvoiceEmailThunk } from '../thunks/orderThunks.js'
import { addMessage } from '../../../../../store/messages/messageSlice.js'
// Importar la utilidad de formato estándar
import { formatDate } from '../../../../../utils/formatting/formatters.js';
// Importar el botón de acción reutilizable
import { ActionButton } from '../../../common/components/ActionButton.jsx';

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
export const InvoiceUploader = ({
  orderId, 
  billing,
  onInvoiceUploaded
}) => {

  // Estados locales
  const [pdfFile, setPdfFile] = useState(null);
  const [xmlFile, setXmlFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Estados para email ya no son necesarios como estados locales
  // const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(null);

  // Obtener estados de Redux
  const dispatch = useDispatch();
  const { uid } = useSelector(state => state.auth);
  const sendingEmail = useSelector(selectSendingInvoice); // NUEVO: Estado desde Redux

  // Comprobar si hay facturas ya subidas
  const hasPdf = billing?.invoicePdfUrl && billing?.invoicePdfName;
  const hasXml = billing?.invoiceXmlUrl && billing?.invoiceXmlName;
  const hasInvoice = hasPdf || hasXml || (billing?.invoiceUrl && billing?.invoiceFileName);

  // Comprobar si ya se envió email de factura
  const invoiceEmailSent = billing?.invoiceEmailSent === true;
  const hasEmailForInvoice = !!billing?.fiscalData?.email;

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

      dispatch(addMessage({ /* ... mensaje éxito ... */ }));
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
   * Manejar el envío de facturas por email - MODIFICADO para usar Redux
   */
  const handleSendInvoiceEmail = async () => {
    if (!hasPdf && !hasXml) {
      setError('No hay facturas disponibles para enviar');
      return;
    }

    if (!hasEmailForInvoice) {
      setError('No hay email de facturación disponible');
      return;
    }

    setError(null);
    setEmailSuccess(null);

    try {
      // Usar thunk de Redux en lugar de llamada directa
      const resultAction = await dispatch(sendInvoiceEmailThunk({ orderId }));

      if (sendInvoiceEmailThunk.fulfilled.match(resultAction)) {
        setEmailSuccess(`Facturas enviadas correctamente a ${billing.fiscalData.email}`);

        // Notificar al componente padre para actualizar la información
        if (onInvoiceUploaded) {
          onInvoiceUploaded();
        }
      } else if (sendInvoiceEmailThunk.rejected.match(resultAction)) {
        throw new Error(resultAction.payload || 'Error al enviar facturas');
      }
    } catch (err) {
      console.error('Error enviando facturas por email:', err);
      setError(err.message || 'Error al enviar facturas por email');
    }
  };

  /**
   * Renderiza el listado de archivos de factura
   */
  const renderInvoiceFiles = () => (
    <>
      <p className="text-muted small mb-4">
        Subido: {formatDate(billing?.invoiceUploadedAt)}
        {invoiceEmailSent && billing?.invoiceEmailSentAt && (
          <> • Email enviado: {formatDate(billing.invoiceEmailSentAt)}</>
        )}
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
          <ActionButton
            iconClass="bi bi-trash"
            title="Eliminar PDF"
            onClick={() => handleRemoveFile('pdf')}
            disabled={uploading}
            variant="light"
            hoverTextColor="danger"
            className="btn-sm"
          />
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
          <ActionButton
            iconClass="bi bi-trash"
            title="Eliminar XML"
            onClick={() => handleRemoveFile('xml')}
            disabled={uploading}
            variant="light"
            hoverTextColor="danger"
            className="btn-sm"
          />
        </div>
      )}

      {/* Botón para enviar facturas por email */}
      {hasInvoice && hasEmailForInvoice && (
        <div className="mt-4 pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <p className="mb-0 text-muted small">
                <i className="bi bi-envelope-at me-1"></i>
                {billing.fiscalData.email}
                {invoiceEmailSent && (
                  <span className="text-secondary ms-1 fst-italic">
                    (Enviadas)
                  </span>
                )}
              </p>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={handleSendInvoiceEmail}
              disabled={sendingEmail}
            >
              {sendingEmail ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="bi bi-envelope me-1"></i>
                  {invoiceEmailSent ? 'Reenviar' : 'Enviar facturas'}
                </>
              )}
            </button>
          </div>

          {/* Mensajes de éxito/error */}
          {emailSuccess && (
            <div className="alert alert-success py-2 small mt-3">
              <i className="bi bi-check-circle-fill me-2"></i>
              {emailSuccess}
            </div>
          )}
        </div>
      )}
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

      {/* Mostrar error general si existe */}
      {error && !showUploadForm && (
        <div className="alert alert-danger py-2 small mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {hasInvoice ? renderInvoiceFiles() :
        (showUploadForm ? renderUploadForm() : renderEmptyState())}
    </section>
  );
};