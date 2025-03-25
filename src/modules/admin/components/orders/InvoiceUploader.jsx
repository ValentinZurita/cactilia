import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { removeInvoiceFromOrder, uploadInvoiceForOrder } from './invoiceService.js'


/**
 * Componente para subir facturas a un pedido
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.orderId - ID del pedido
 * @param {Object} props.billing - Datos de facturación del pedido
 * @param {Function} props.onInvoiceUploaded - Función que se ejecuta cuando se sube una factura
 * @returns {JSX.Element}
 */
export const InvoiceUploader = ({ orderId, billing, onInvoiceUploaded }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Obtener el ID del usuario actual (administrador)
  const { uid } = useSelector(state => state.auth);

  // Comprobar si hay una factura ya subida
  const hasInvoice = billing?.invoiceUrl && billing?.invoiceFileName;

  // Permitir solo archivos PDF
  const acceptedFileTypes = ".pdf";

  // Manejar cambio de archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validar tipo de archivo
      if (!selectedFile.type.startsWith('application/pdf')) {
        setError('Solo se permiten archivos PDF');
        setFile(null);
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('El archivo es demasiado grande. Máximo 5MB.');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  // Manejar subida de archivo
  const handleUpload = async () => {
    if (!file) {
      setError('Selecciona un archivo para subir');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await uploadInvoiceForOrder(orderId, file, uid);

      if (!result.ok) {
        throw new Error(result.error || 'Error al subir la factura');
      }

      setSuccess(true);
      setFile(null);

      // Notificar al componente padre
      if (onInvoiceUploaded) {
        onInvoiceUploaded(result.data);
      }
    } catch (err) {
      setError(err.message || 'Error al subir la factura');
    } finally {
      setUploading(false);
    }
  };

  // Manejar eliminación de factura
  const handleRemove = async () => {
    if (!hasInvoice) return;

    if (!window.confirm('¿Estás seguro de eliminar esta factura? Esta acción no se puede deshacer.')) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await removeInvoiceFromOrder(orderId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar la factura');
      }

      // Notificar al componente padre
      if (onInvoiceUploaded) {
        onInvoiceUploaded(null);
      }
    } catch (err) {
      setError(err.message || 'Error al eliminar la factura');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="invoice-uploader">
      <h6 className="mb-3">Factura Electrónica</h6>

      {/* Si ya existe una factura, mostrar información */}
      {hasInvoice && (
        <div className="mb-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
            <div>
              <a
                href={billing.invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="fw-medium"
              >
                {billing.invoiceFileName}
              </a>
              <div className="text-muted small">
                Subido: {billing.invoiceUploadedAt?.seconds ?
                new Date(billing.invoiceUploadedAt.seconds * 1000).toLocaleString() :
                'Fecha no disponible'
              }
              </div>
            </div>
            <button
              className="btn btn-sm btn-outline-danger ms-auto"
              onClick={handleRemove}
              disabled={uploading}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        </div>
      )}

      {/* Si no hay factura o queremos reemplazarla */}
      {!hasInvoice && (
        <>
          <div className="mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileChange}
              accept={acceptedFileTypes}
              disabled={uploading}
            />
            <div className="form-text">
              Sólo archivos PDF. Tamaño máximo: 5MB.
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
              Factura subida correctamente
            </div>
          )}

          <div className="d-grid">
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Subiendo...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Subir Factura
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};