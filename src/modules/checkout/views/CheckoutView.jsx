import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig';
import AddressForm from '../components/AddressForm';
import PaymentForm from '../components/PaymentForm';
import CheckoutSummary from '../components/CheckoutSummary';
import NewShipping from '../NewShipping2';
import { useCart } from '../../shop/features/cart/hooks/index.js'

/**
 * Vista completa del checkout con integración del sistema de envío
 */
const CheckoutView = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const auth = getAuth();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState({
    address: null,
    payment: null,
    shipping: null
  });

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (!user) {
        navigate('/login?redirect=checkout');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  // Manejar selección de dirección
  const handleAddressSubmit = (address) => {
    setOrderData(prev => ({
      ...prev,
      address
    }));

    // Avanzar al paso 2
    setStep(2);
  };

  // Manejar selección de opción de envío
  const handleShippingSelected = (shippingOption) => {
    setOrderData(prev => ({
      ...prev,
      shipping: shippingOption
    }));

    // No avanzamos automáticamente para permitir cambios en la selección
  };

  // Manejar avance del paso 2 (envío) al paso 3 (pago)
  const handleContinueToPayment = () => {
    if (!orderData.shipping) {
      alert('Por favor selecciona una opción de envío');
      return;
    }

    // Avanzar al paso 3 (pago)
    setStep(3);
  };

  // Manejar selección de pago
  const handlePaymentSubmit = (payment) => {
    setOrderData(prev => ({
      ...prev,
      payment
    }));

    // Avanzar al paso de confirmación
    setStep(4);
  };

  // Manejar confirmación final del pedido
  const handleConfirmOrder = async () => {
    // Validar que tenemos todos los datos necesarios
    if (!orderData.address || !orderData.shipping || !orderData.payment) {
      alert('Faltan datos para procesar el pedido');
      return;
    }

    try {
      setLoading(true);

      // Calcular subtotales
      const subtotal = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      // Calcular impuesto (ejemplo: 16% IVA)
      const tax = subtotal * 0.16;

      // Obtener costo de envío
      const shippingCost = orderData.shipping.calculatedCost || 0;

      // Crear el pedido en Firebase
      const orderRef = await addDoc(collection(FirebaseDB, 'orders'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,

        // Datos de dirección
        address: orderData.address,

        // Datos de envío
        shipping: {
          option: {
            id: orderData.shipping.id,
            name: orderData.shipping.name,
            ruleId: orderData.shipping.ruleId,
            deliveryTime: orderData.shipping.deliveryTime
          },
          cost: shippingCost,
          isFreeShipping: orderData.shipping.isFree || false,
          packages: orderData.shipping.packages || []
        },

        // Datos de pago (ocultando información sensible)
        payment: {
          cardholderName: orderData.payment.cardholderName,
          cardNumber: `XXXX-XXXX-XXXX-${orderData.payment.cardNumber.slice(-4)}`,
          expiryMonth: orderData.payment.expiryMonth,
          expiryYear: orderData.payment.expiryYear
        },

        // Productos
        items: cart.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          weight: item.product.weight || 1,
          image: item.product.image || null
        })),

        // Totales
        subtotal,
        tax,
        shippingCost,
        total: subtotal + tax + shippingCost,

        // Metadatos
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Limpiar carrito
      clearCart();

      // Redirigir a página de confirmación
      navigate(`/checkout/success?order=${orderRef.id}`);

    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      alert('Ocurrió un error al procesar tu pedido. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Método alternativo: usar CheckoutSummary para manejar opciones de envío
  const handleCheckoutSummarySubmit = (summaryData) => {
    // Si estamos en el paso de envío, actualizar datos de envío
    if (step === 2 && summaryData.shippingOption) {
      setOrderData(prev => ({
        ...prev,
        shipping: summaryData.shippingOption
      }));

      // Avanzar al paso de pago
      setStep(3);
    }
    // Si estamos en el paso final, procesar pedido
    else if (step === 4) {
      handleConfirmOrder();
    }
  };

  // Verificar si el carrito está vacío
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container py-5">
        <div className="alert alert-info">
          <h4>Tu carrito está vacío</h4>
          <p>No hay productos en tu carrito. Agrega algunos productos antes de proceder al checkout.</p>
          <button
            className="btn btn-primary mt-3"
            onClick={() => navigate('/products')}
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-view container py-5">
      {/* Pasos del checkout */}
      <div className="checkout-steps mb-5">
        <div className="progress" style={{ height: '4px' }}>
          <div
            className="progress-bar bg-dark"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        <div className="d-flex justify-content-between mt-2">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <div className="step-icon">1</div>
            <div className="step-label">Dirección</div>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <div className="step-icon">2</div>
            <div className="step-label">Envío</div>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-icon">3</div>
            <div className="step-label">Pago</div>
          </div>
          <div className={`step ${step >= 4 ? 'active' : ''}`}>
            <div className="step-icon">4</div>
            <div className="step-label">Confirmación</div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Contenido principal según el paso */}
        <div className="col-lg-8 mb-4 mb-lg-0">
          {/* Paso 1: Dirección */}
          {step === 1 && (
            <AddressForm
              onSubmit={handleAddressSubmit}
              initialAddress={orderData.address}
            />
          )}

          {/* Paso 2: Opciones de Envío */}
          {step === 2 && (
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Opciones de envío</h5>
              </div>
              <div className="card-body">
                <NewShipping
                  cartItems={cart.items}
                  selectedAddress={orderData.address}
                  onShippingOptionSelected={handleShippingSelected}
                />

                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setStep(1)}
                  >
                    Regresar
                  </button>
                  <button
                    type="button"
                    className="btn btn-dark px-4 fw-medium"
                    onClick={handleContinueToPayment}
                    disabled={!orderData.shipping}
                  >
                    Continuar al pago
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Método de Pago */}
          {step === 3 && (
            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={() => setStep(2)}
              initialPayment={orderData.payment}
            />
          )}

          {/* Paso 4: Confirmación */}
          {step === 4 && (
            <div className="card shadow-sm">
              <div className="card-header bg-white py-3">
                <h5 className="mb-0">Confirmación de pedido</h5>
              </div>
              <div className="card-body">
                {/* Resumen de dirección */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="mb-3">Dirección de envío</h6>
                    <div className="bg-light p-3 rounded">
                      <div className="mb-1 fw-medium">{orderData.address.fullName}</div>
                      <div className="mb-1">{orderData.address.street}</div>
                      <div className="mb-1">
                        {orderData.address.city}, {orderData.address.state} {orderData.address.zipCode}
                      </div>
                      <div>{orderData.address.phone}</div>
                      {orderData.address.notes && (
                        <div className="mt-2 small text-muted">
                          <strong>Notas:</strong> {orderData.address.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="mb-3">Método de pago</h6>
                    <div className="bg-light p-3 rounded">
                      <div className="mb-1 fw-medium">{orderData.payment.cardholderName}</div>
                      <div className="d-flex align-items-center mb-1">
                        <i className="bi bi-credit-card me-2"></i>
                        Tarjeta terminada en {orderData.payment.cardNumber.slice(-4)}
                      </div>
                      <div>Vence: {orderData.payment.expiryMonth}/{orderData.payment.expiryYear}</div>
                    </div>
                  </div>
                </div>

                {/* Resumen de envío */}
                <div className="mb-4">
                  <h6 className="mb-3">Método de envío</h6>
                  <div className="bg-light p-3 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-medium">{orderData.shipping.name}</div>
                        <div className="text-muted small">
                          {orderData.shipping.deliveryTime}
                        </div>
                      </div>
                      <div className="h5 mb-0">
                        {orderData.shipping.isFree || orderData.shipping.calculatedCost === 0 ? (
                          <span className="text-success">Gratis</span>
                        ) : (
                          <span>${orderData.shipping.calculatedCost.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen de productos */}
                <div className="mb-4">
                  <h6 className="mb-3">Productos ({cart.items.length})</h6>
                  <div className="list-group mb-3">
                    {cart.items.map(item => (
                      <div
                        key={item.product.id}
                        className="list-group-item d-flex justify-content-between align-items-center py-3"
                      >
                        <div className="d-flex align-items-center">
                          {item.product.image && (
                            <div
                              className="me-3"
                              style={{
                                width: '50px',
                                height: '50px',
                                background: '#f8f9fa',
                                borderRadius: '4px',
                                overflow: 'hidden'
                              }}
                            >
                              <img
                                src={item.product.image}
                                alt={item.product.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            </div>
                          )}
                          <div>
                            <div className="fw-medium">{item.product.name}</div>
                            <div className="text-muted small">
                              {item.quantity} x ${item.product.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="fw-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setStep(3)}
                    disabled={loading}
                  >
                    Regresar
                  </button>
                  <button
                    type="button"
                    className="btn btn-success px-4 fw-medium"
                    onClick={handleConfirmOrder}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar y pagar'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen del pedido - INTEGRACIÓN CON CHECKSOUT SUMMARY */}
        <div className="col-lg-4">
          <CheckoutSummary
            cart={cart}
            userAddress={orderData.address}
            onCheckout={handleCheckoutSummarySubmit}
            currentStep={step}
          />
        </div>
      </div>

      <style jsx>{`
          .checkout-steps .step {
              text-align: center;
              position: relative;
              z-index: 1;
          }

          .checkout-steps .step-icon {
              width: 30px;
              height: 30px;
              border-radius: 50%;
              background-color: #e9ecef;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 5px;
              font-weight: 500;
              transition: all 0.3s ease;
          }

          .checkout-steps .step.active .step-icon {
              background-color: #212529;
              color: white;
          }

          .checkout-steps .step-label {
              font-size: 0.8rem;
              color: #6c757d;
              transition: all 0.3s ease;
          }

          .checkout-steps .step.active .step-label {
              color: #212529;
              font-weight: 500;
          }
      `}</style>
    </div>
  );
};

export default CheckoutView;