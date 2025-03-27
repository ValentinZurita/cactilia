// src/modules/admin/components/orders/OrderShippingForm.jsx
import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const OrderShippingForm = ({ order, onOrderUpdated }) => {
  const [formData, setFormData] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: ''
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const isShipped = order.status === 'shipped';

  // Cargar datos existentes cuando cambia el order.id
  useEffect(() => {
    if (order && order.shipping && order.shipping.trackingInfo) {
      const info = order.shipping.trackingInfo;
      setFormData({
        carrier: info.carrier || '',
        trackingNumber: info.trackingNumber || '',
        trackingUrl: info.trackingUrl || '',
        estimatedDelivery: info.estimatedDelivery || ''
      });
    }
  }, [order.id]); // Solo se ejecuta cuando cambia el ID del pedido

  // Manejador para cambios en los campos del formulario
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  /**
   * Enviar notificación de envío al cliente
   */
  const handleSendShippingNotification = async () => {
    setError(null);
    setSending(true);

    try {
      // Validación básica
      if (!formData.carrier || !formData.trackingNumber) {
        setError('Por favor ingresa al menos transportista y número de guía');
        setSending(false);
        return;
      }

      // Obtener referencia a la función Cloud
      const functions = getFunctions();
      const sendShippedEmail = httpsCallable(functions, 'sendOrderShippedEmail');

      // Llamar a la función Cloud
      const result = await sendShippedEmail({
        orderId: order.id,
        shippingInfo: formData
      });

      if (result.data.success) {
        if (onOrderUpdated) {
          onOrderUpdated();
        }
      } else {
        throw new Error(result.data.message || 'Error al enviar notificación');
      }
    } catch (err) {
      console.error('Error enviando notificación:', err);
      setError(err.message || 'Error al enviar notificación');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="shipping-form">
      <h6 className="border-bottom pb-2 mb-3 text-secondary fw-normal">
        Información de Envío
      </h6>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="row g-3 mb-3">
          {/* Transportista */}
          <div className="col-md-6">
            <label htmlFor="carrier" className="form-label">Transportista</label>
            <select
              id="carrier"
              className="form-select"
              value={formData.carrier}
              onChange={handleChange}
              disabled={sending}
            >
              <option value="">Seleccionar transportista...</option>
              <option value="DHL">DHL</option>
              <option value="Estafeta">Estafeta</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
              <option value="Correos de México">Correos de México</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Número de guía */}
          <div className="col-md-6">
            <label htmlFor="trackingNumber" className="form-label">Número de guía</label>
            <input
              type="text"
              id="trackingNumber"
              className="form-control"
              value={formData.trackingNumber}
              onChange={handleChange}
              disabled={sending}
              placeholder="Ej: ABC123456789"
            />
          </div>

          {/* URL de seguimiento */}
          <div className="col-md-12">
            <label htmlFor="trackingUrl" className="form-label">URL de seguimiento (opcional)</label>
            <input
              type="url"
              id="trackingUrl"
              className="form-control"
              value={formData.trackingUrl}
              onChange={handleChange}
              disabled={sending}
              placeholder="https://..."
            />
          </div>

          {/* Fecha estimada de entrega */}
          <div className="col-md-6">
            <label htmlFor="estimatedDelivery" className="form-label">Entrega estimada (opcional)</label>
            <input
              type="date"
              id="estimatedDelivery"
              className="form-control"
              value={formData.estimatedDelivery}
              onChange={handleChange}
              disabled={sending}
              min={new Date().toISOString().split('T')[0]} // fecha mínima = hoy
            />
          </div>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="alert alert-danger py-2 small mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {/* Status actual y botones */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {isShipped ? (
              <span className="badge bg-info">
                <i className="bi bi-truck me-1"></i>
                Pedido ya enviado
              </span>
            ) : (
              <span className="badge bg-warning text-dark">
                <i className="bi bi-hourglass me-1"></i>
                Pendiente de envío
              </span>
            )}
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSendShippingNotification}
            disabled={sending}
          >
            {sending ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                {isShipped ? 'Actualizando...' : 'Enviando...'}
              </>
            ) : (
              <>
                <i className={`bi bi-${isShipped ? 'arrow-repeat' : 'truck'} me-1`}></i>
                {isShipped ? 'Actualizar información' : 'Marcar como enviado y notificar'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};