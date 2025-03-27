import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useSelector } from 'react-redux';
import { updateOrderStatus } from '../orderAdminService.js'

/**
 * Formulario flexible para marcar pedidos como enviados
 * - Permite envíos locales sin datos de seguimiento
 * - Soporte para entrega directa o envío con transportista
 *
 * @param {Object} props
 * @param {Object} props.order - Datos del pedido
 * @param {Function} props.onComplete - Función a ejecutar cuando se complete
 * @param {Function} props.onCancel - Función para cancelar la acción
 */
export const ShipmentForm = ({ order, onComplete, onCancel }) => {
  const { uid } = useSelector(state => state.auth);
  const [shipmentType, setShipmentType] = useState('local');
  const [formData, setFormData] = useState({
    carrier: '',
    trackingNumber: '',
    trackingUrl: '',
    estimatedDelivery: '',
    notifyCustomer: true,
    notes: ''
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Detectar si es actualización o nuevo envío
  const isShipped = order.status === 'shipped';

  // Cargar datos existentes si hay información de envío
  useEffect(() => {
    if (order?.shipping?.trackingInfo) {
      const info = order.shipping.trackingInfo;
      setFormData({
        carrier: info.carrier || '',
        trackingNumber: info.trackingNumber || '',
        trackingUrl: info.trackingUrl || '',
        estimatedDelivery: info.estimatedDelivery || '',
        notifyCustomer: true,
        notes: ''
      });

      // Determinar el tipo de envío basado en los datos existentes
      if (info.carrier || info.trackingNumber) {
        setShipmentType('carrier');
      } else {
        setShipmentType('local');
      }
    }
  }, [order]);

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTypeChange = (e) => {
    setShipmentType(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación según tipo de envío
    if (shipmentType === 'carrier') {
      if (!formData.carrier || !formData.trackingNumber) {
        setError('Por favor ingresa transportista y número de guía');
        return;
      }
    }

    setSending(true);
    setError(null);

    try {
      // Preparar notas para el cambio de estado
      let notes = formData.notes || '';
      if (shipmentType === 'carrier') {
        notes = `Enviado con ${formData.carrier}, guía: ${formData.trackingNumber}. ${notes}`.trim();
      } else {
        notes = `Entrega local. ${notes}`.trim();
      }

      // Preparar información de seguimiento (si aplica)
      const trackingInfo = shipmentType === 'carrier'
        ? {
          carrier: formData.carrier,
          trackingNumber: formData.trackingNumber,
          trackingUrl: formData.trackingUrl,
          estimatedDelivery: formData.estimatedDelivery,
          isLocal: false
        }
        : {
          isLocal: true,
          carrier: 'Entrega local'
        };

      // Si no está ya enviado, actualizar estado
      if (!isShipped) {
        const statusResult = await updateOrderStatus(order.id, 'shipped', uid, notes);
        if (!statusResult.ok) {
          throw new Error(statusResult.error || 'Error al actualizar estado');
        }
      }

      // Enviar notificación por email si está marcado y tiene sentido
      if (formData.notifyCustomer && shipmentType === 'carrier') {
        const functions = getFunctions();
        const sendShippedEmail = httpsCallable(functions, 'sendOrderShippedEmail');

        const result = await sendShippedEmail({
          orderId: order.id,
          shippingInfo: trackingInfo
        });

        if (!result.data.success) {
          throw new Error(result.data.message || 'Error al enviar notificación');
        }
      }

      // Completar y cerrar
      onComplete();

    } catch (err) {
      console.error('Error procesando envío:', err);
      setError(err.message || 'Error al procesar el envío');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="shipment-form">
      <h5 className="mb-3">
        {isShipped ? 'Actualizar información de envío' : 'Marcar como enviado'}
      </h5>

      {/* Selector de tipo de envío */}
      <div className="mb-3">
        <div className="mb-2 text-muted">Tipo de envío:</div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="shipmentType"
            id="localShipment"
            value="local"
            checked={shipmentType === 'local'}
            onChange={handleTypeChange}
            disabled={sending}
          />
          <label className="form-check-label" htmlFor="localShipment">
            Entrega local/directa
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            name="shipmentType"
            id="carrierShipment"
            value="carrier"
            checked={shipmentType === 'carrier'}
            onChange={handleTypeChange}
            disabled={sending}
          />
          <label className="form-check-label" htmlFor="carrierShipment">
            Envío con transportista
          </label>
        </div>
      </div>

      {/* Campos para envío con transportista */}
      {shipmentType === 'carrier' && (
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="carrier" className="form-label">Transportista</label>
            <select
              id="carrier"
              className="form-select"
              value={formData.carrier}
              onChange={handleChange}
              disabled={sending}
              required
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

          <div className="col-md-6">
            <label htmlFor="trackingNumber" className="form-label">Número de guía</label>
            <input
              type="text"
              id="trackingNumber"
              className="form-control"
              value={formData.trackingNumber}
              onChange={handleChange}
              disabled={sending}
              required
              placeholder="Ej: ABC123456789"
            />
          </div>

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

          <div className="col-md-6">
            <label htmlFor="estimatedDelivery" className="form-label">Entrega estimada (opcional)</label>
            <input
              type="date"
              id="estimatedDelivery"
              className="form-control"
              value={formData.estimatedDelivery}
              onChange={handleChange}
              disabled={sending}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="col-md-12">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="notifyCustomer"
                checked={formData.notifyCustomer}
                onChange={handleChange}
                disabled={sending}
              />
              <label className="form-check-label" htmlFor="notifyCustomer">
                Notificar al cliente por email
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Notas (para ambos tipos) */}
      <div className="mt-3">
        <label htmlFor="notes" className="form-label">Notas (opcional)</label>
        <textarea
          id="notes"
          className="form-control"
          value={formData.notes}
          onChange={handleChange}
          disabled={sending}
          rows={3}
          placeholder="Información adicional sobre el envío..."
        ></textarea>
      </div>

      {error && (
        <div className="alert alert-danger py-2 small my-3">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="d-flex gap-2 mt-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onCancel}
          disabled={sending}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending}
        >
          {sending ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {isShipped ? 'Actualizando...' : 'Procesando envío...'}
            </>
          ) : (
            <>
              <i className="bi bi-truck me-2"></i>
              {isShipped ? 'Actualizar información' : 'Confirmar envío'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};