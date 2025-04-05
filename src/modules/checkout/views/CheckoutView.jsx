import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useCart } from '../../../context/CartContext';
import CheckoutSummary from '../components/CheckoutSummary';
import CheckoutDebugInfo from '../components/CheckoutDebugInfo';
import PaymentForm from '../components/PaymentForm';
import AddressForm from '../components/AddressForm';

/**
 * Vista principal del proceso de checkout
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
    summary: null
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

  // Agregar Log de diagnóstico al cargar la vista
  useEffect(() => {
    console.warn('🚨 CHECKOUT VIEW LOADED 🚨');
    console.warn('🛒 CART:', cart);
    console.warn('📍 ADDRESS:', orderData.address);
  }, [cart, orderData.address]);
  
  // Manejar selección de dirección
  const handleAddressSubmit = (address) => {
    setOrderData(prev => ({
      ...prev,
      address
    }));
    
    setStep(2);
  };
  
  // Manejar selección de pago
  const handlePaymentSubmit = (payment) => {
    setOrderData(prev => ({
      ...prev,
      payment
    }));
    
    setStep(3);
  };
  
  // Manejar checkout final
  const handleCheckout = async (summary) => {
    // Guardar el resumen
    setOrderData(prev => ({
      ...prev,
      summary
    }));
    
    // Procesar el pedido
    try {
      setLoading(true);
      
      // Crear el pedido en Firebase
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: auth.currentUser.uid,
        address: orderData.address,
        payment: {
          ...orderData.payment,
          cardNumber: `XXXX-XXXX-XXXX-${orderData.payment.cardNumber.slice(-4)}` // Ocultar número de tarjeta
        },
        items: cart.items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          weight: item.product.weight || 1
        })),
        shipping: {
          option: summary.shippingOption,
          cost: summary.shipping
        },
        subtotal: summary.subtotal,
        tax: summary.tax,
        total: summary.total,
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
  
  return (
    <div className="checkout-view container py-5">
      {/* Alerta de Diagnóstico Forzada */}
      <div className="alert alert-danger mb-4 p-5 text-center">
        <h2 className="display-4 mb-4">DIAGNÓSTICO DE DESARROLLO</h2>
        <p className="lead">Este panel aparece para diagnosticar problemas con el envío</p>
        <hr/>
        <div className="row">
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información de dirección:</h5>
            {orderData.address ? (
              <ul className="list-unstyled">
                <li><strong>CP:</strong> {orderData.address.zipCode || orderData.address.postalCode || 'No definido'}</li>
                <li><strong>Estado:</strong> {orderData.address.state || 'No definido'}</li>
                <li><strong>Ciudad:</strong> {orderData.address.city || 'No definida'}</li>
              </ul>
            ) : (
              <p className="text-warning">No hay dirección configurada. Complete el paso 1 primero.</p>
            )}
          </div>
          <div className="col-md-6 text-start">
            <h5 className="mb-2">Información del carrito:</h5>
            {cart && cart.items && cart.items.length > 0 ? (
              <ul className="list-unstyled">
                <li><strong>Productos en carrito:</strong> {cart.items.length}</li>
                <li><strong>Productos con regla de envío:</strong> {cart.items.filter(item => 
                  (item.product?.shippingRuleId || (item.product?.shippingRuleIds && item.product.shippingRuleIds.length > 0))
                ).length}</li>
              </ul>
            ) : (
              <p className="text-warning">No hay productos en el carrito.</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <button 
            className="btn btn-lg btn-warning"
            onClick={() => {
              console.warn('DATOS PARA DEBUGGING:', {
                cart,
                address: orderData.address,
                step
              });
              alert('Se han mostrado los datos de diagnóstico en la consola.');
            }}
          >
            Ver Datos Completos en Consola
          </button>
        </div>
      </div>
      
      {/* Componente de diagnóstico */}
      <CheckoutDebugInfo cart={cart} userAddress={orderData.address} />
      
      <div className="row">
        <div className="col-lg-8 mb-4 mb-lg-0">
          {/* Pasos del checkout */}
          <div className="progress-container mb-4">
            <div className="progress" style={{ height: '4px' }}>
              <div 
                className="progress-bar bg-dark" 
                style={{ width: `${step * 33.3}%` }}
              ></div>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <div className={`step ${step >= 1 ? 'active' : ''}`}>
                <div className="step-icon">1</div>
                <div className="step-label">Dirección</div>
              </div>
              <div className={`step ${step >= 2 ? 'active' : ''}`}>
                <div className="step-icon">2</div>
                <div className="step-label">Pago</div>
              </div>
              <div className={`step ${step >= 3 ? 'active' : ''}`}>
                <div className="step-icon">3</div>
                <div className="step-label">Confirmar</div>
              </div>
            </div>
          </div>
          
          {/* Contenido del paso actual */}
          <div className="step-content">
            {step === 1 && (
              <AddressForm onSubmit={handleAddressSubmit} initialAddress={orderData.address} />
            )}
            
            {step === 2 && (
              <PaymentForm 
                onSubmit={handlePaymentSubmit} 
                onBack={() => setStep(1)}
                initialPayment={orderData.payment}
              />
            )}
            
            {step === 3 && (
              <div className="card shadow-sm">
                <div className="card-header bg-white py-3">
                  <h5 className="mb-0">Confirmar pedido</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="mb-3">Dirección de envío</h6>
                      <div className="text-muted">
                        <p className="mb-1">{orderData.address.fullName}</p>
                        <p className="mb-1">{orderData.address.street}</p>
                        <p className="mb-1">
                          {orderData.address.city}, {orderData.address.state} {orderData.address.zipCode}
                        </p>
                        <p className="mb-0">{orderData.address.phone}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="mb-3">Método de pago</h6>
                      <div className="text-muted">
                        <p className="mb-1">
                          <i className={`bi bi-credit-card me-2`}></i>
                          Terminación {orderData.payment.cardNumber.slice(-4)}
                        </p>
                        <p className="mb-0">{orderData.payment.cardholderName}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mostrar el método de envío seleccionado */}
                  {orderData.summary && orderData.summary.shippingOption && (
                    <div className="mb-4">
                      <h6 className="mb-3">Método de envío</h6>
                      <div className="text-muted">
                        <div className="d-flex align-items-center">
                          <i className="bi bi-truck me-2"></i>
                          <div>
                            <p className="mb-1">
                              <span className="fw-medium">{orderData.summary.shippingOption.label}</span> 
                              <span className="ms-2">({orderData.summary.shippingOption.carrier})</span>
                            </p>
                            <p className="mb-0 small">
                              <span>Entrega estimada: {orderData.summary.shippingOption.minDays}-{orderData.summary.shippingOption.maxDays} días</span>
                              <span className="ms-3 fw-medium">${orderData.summary.shipping.toFixed(2)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="d-flex justify-content-between mb-4">
                    <button 
                      className="btn btn-outline-dark"
                      onClick={() => setStep(2)}
                      disabled={loading}
                    >
                      Regresar
                    </button>
                    <button 
                      className="btn btn-dark px-4"
                      onClick={() => handleCheckout(orderData.summary)}
                      disabled={loading || !orderData.summary || !orderData.summary.shippingOption}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Procesando...
                        </>
                      ) : 'Confirmar pedido'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="col-lg-4">
          <CheckoutSummary 
            cart={cart} 
            userAddress={orderData.address}
            onCheckout={handleCheckout}
            currentStep={step}
          />
        </div>
      </div>
      
      <style jsx>{`
        .progress-container {
          padding: 0 40px;
        }
        
        .step {
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .step-icon {
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
        
        .step.active .step-icon {
          background-color: #212529;
          color: white;
        }
        
        .step-label {
          font-size: 0.8rem;
          color: #6c757d;
          transition: all 0.3s ease;
        }
        
        .step.active .step-label {
          color: #212529;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CheckoutView; 