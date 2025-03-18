import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { CheckoutSummary } from '../components/checkout/CheckoutSummary';
import { AddressSelector } from '../components/checkout/AddressSelector';
import { PaymentMethodSelector } from '../components/checkout/PaymentMethodSelector';
import { BillingInfoForm } from '../components/checkout/BillingInfoForm';
import { CheckoutButton } from '../components/checkout/CheckoutButton';
import { OrderConfirmation } from '../components/checkout/OrderConfirmation';
import '../styles/checkout.css';
import { useCart } from '../../user/hooks/useCart.js'

/**
 * CheckoutPage - Página principal para el proceso de pago
 * Integra selección de dirección, método de pago, y resumen del pedido
 */
export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { status, uid } = useSelector(state => state.auth);
  const {
    items,
    total,
    subtotal,
    taxes,
    shipping,
    finalTotal,
    isFreeShipping,
    hasOutOfStockItems
  } = useCart();

  // Estado para el checkout
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1); // 1: checkout, 2: processing, 3: confirmation
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Custom hooks para direcciones y métodos de pago
  const { addresses, loading: addressesLoading } = useAddresses();
  const { paymentMethods, loading: paymentsLoading } = usePayments();

  // Verificar que el usuario esté autenticado
  useEffect(() => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=checkout');
    }
  }, [status, navigate]);

  // Verificar que haya productos en el carrito
  useEffect(() => {
    if (items.length === 0 && status === 'authenticated') {
      navigate('/shop');
    }
  }, [items, status, navigate]);

  // Manejar cambio de dirección
  const handleAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
  };

  // Manejar cambio de método de pago
  const handlePaymentChange = (paymentId) => {
    setSelectedPaymentId(paymentId);
  };

  // Manejar cambio en requerimiento de factura
  const handleInvoiceChange = (requires) => {
    setRequiresInvoice(requires);
  };

  // Manejar datos fiscales
  const handleFiscalDataChange = (data) => {
    setFiscalData(data);
  };

  // Manejar notas del pedido
  const handleNotesChange = (e) => {
    setOrderNotes(e.target.value);
  };

  // Procesar la orden
  const handleProcessOrder = async () => {
    if (!selectedAddressId) {
      setError('Debes seleccionar una dirección de envío');
      return;
    }

    if (!selectedPaymentId) {
      setError('Debes seleccionar un método de pago');
      return;
    }

    if (requiresInvoice && (!fiscalData || !fiscalData.rfc)) {
      setError('Los datos fiscales son requeridos para la factura');
      return;
    }

    if (hasOutOfStockItems) {
      setError('Hay productos sin stock en tu carrito');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setStep(2);

    try {
      // Aquí llamaríamos a la función de Cloud Functions para procesar la orden
      // Por ahora simulamos una respuesta exitosa
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular ID de orden
      const mockOrderId = `ORD-${Date.now()}`;
      setOrderId(mockOrderId);
      setStep(3);
    } catch (err) {
      console.error('Error al procesar la orden:', err);
      setError('Error al procesar tu orden. Por favor, intenta de nuevo.');
      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  };

  // Si está en paso de confirmación, mostrar pantalla de confirmación
  if (step === 3) {
    return <OrderConfirmation orderId={orderId} />;
  }

  return (
    <div className="container checkout-page my-5">
      <h1 className="checkout-title mb-4">Finalizar Compra</h1>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      <div className="row">
        {/* Columna izquierda: Formulario de checkout */}
        <div className="col-lg-8">
          <div className="checkout-section">
            <h2 className="section-title">
              <span className="step-number">1</span>
              Dirección de Envío
            </h2>
            <AddressSelector
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressChange}
              loading={addressesLoading}
            />
          </div>

          <div className="checkout-section">
            <h2 className="section-title">
              <span className="step-number">2</span>
              Método de Pago
            </h2>
            <PaymentMethodSelector
              paymentMethods={paymentMethods}
              selectedPaymentId={selectedPaymentId}
              onPaymentSelect={handlePaymentChange}
              loading={paymentsLoading}
            />
          </div>

          {/* Información fiscal (opcional) */}
          <div className="checkout-section">
            <h2 className="section-title">
              <span className="step-number">3</span>
              Información Fiscal
            </h2>
            <BillingInfoForm
              requiresInvoice={requiresInvoice}
              onRequiresInvoiceChange={handleInvoiceChange}
              fiscalData={fiscalData}
              onFiscalDataChange={handleFiscalDataChange}
            />
          </div>

          {/* Notas adicionales */}
          <div className="checkout-section">
            <h2 className="section-title">
              <span className="step-number">4</span>
              Notas Adicionales
            </h2>
            <div className="form-group">
              <textarea
                className="form-control"
                rows="3"
                placeholder="Instrucciones especiales para la entrega (opcional)"
                value={orderNotes}
                onChange={handleNotesChange}
              ></textarea>
              <small className="form-text text-muted">
                Por ejemplo: "Dejar con el portero" o "Llamar antes de entregar"
              </small>
            </div>
          </div>
        </div>

        {/* Columna derecha: Resumen del pedido */}
        <div className="col-lg-4">
          <div className="checkout-summary-container">
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              taxes={taxes}
              shipping={shipping}
              finalTotal={finalTotal}
              isFreeShipping={isFreeShipping}
            />

            <div className="mt-4">
              <CheckoutButton
                onCheckout={handleProcessOrder}
                isProcessing={isProcessing}
                disabled={!selectedAddressId || !selectedPaymentId || hasOutOfStockItems}
              />

              <div className="checkout-terms mt-3">
                <small className="text-muted">
                  Al completar tu compra, aceptas nuestros <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a> y <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};