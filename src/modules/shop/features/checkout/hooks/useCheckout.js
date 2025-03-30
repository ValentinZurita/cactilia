import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { addMessage } from '../../../../../store/messages/messageSlice.js';
import { clearCartWithSync } from '../../../../../store/cart/cartThunk.js';
import { useCart } from '../../cart/hooks/useCart.js';
import { useCheckoutForm } from './useCheckoutForm';
import { useOrderProcessing } from './useOrderProcessing';

/**
 * Hook principal para el flujo de checkout
 * Combina múltiples hooks especializados para manejar diferentes partes del proceso
 *
 * @returns {Object} Estado y funciones para manejar el flujo de Checkout
 */
export const useCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Obtener datos de autenticación del usuario
  const auth = useSelector(state => state.auth);
  const { uid, status } = auth;

  // Obtener datos del carrito
  const {
    items: cartItems,
    subtotal: cartSubtotal,
    taxes: cartTaxes,
    shipping: cartShipping,
    finalTotal: cartTotal,
    isFreeShipping,
    hasOutOfStockItems
  } = useCart();

  // Obtener formulario de checkout (direcciones, pagos, facturación)
  const form = useCheckoutForm(uid);

  // Obtener procesamiento de órdenes
  const orderProcessing = useOrderProcessing({
    auth,
    cart: {
      items: cartItems,
      subtotal: cartSubtotal,
      taxes: cartTaxes,
      shipping: cartShipping,
      finalTotal: cartTotal,
      isFreeShipping,
      hasOutOfStockItems
    },
    form,
    stripe,
    elements
  });

  // Manejar éxito en el proceso de orden
  useEffect(() => {
    if (orderProcessing.isSuccess) {
      if (form.selectedPaymentType === 'oxxo') {
        dispatch(addMessage({
          type: 'success',
          text: 'Pedido registrado correctamente. Revisa tu correo para el voucher de pago OXXO.',
          autoHide: true,
          duration: 8000
        }));
      } else {
        dispatch(clearCartWithSync());
        dispatch(addMessage({
          type: 'success',
          text: '¡Pedido completado correctamente!',
          autoHide: true,
          duration: 5000
        }));
      }
    }
  }, [orderProcessing.isSuccess, form.selectedPaymentType, dispatch]);

  // Manejador para procesar la orden
  const handleProcessOrder = async () => {
    try {
      // Validar stock de productos
      if (hasOutOfStockItems) {
        dispatch(addMessage({
          type: 'error',
          text: 'Hay productos sin stock en tu carrito. Por favor elimínalos antes de continuar.',
          autoHide: true,
          duration: 5000
        }));
        return;
      }

      await orderProcessing.processOrder();
    } catch (error) {
      console.error('Error al procesar orden:', error);
      dispatch(addMessage({
        type: 'error',
        text: error.message || 'Error al procesar el pedido. Intenta nuevamente.',
        autoHide: true,
        duration: 5000
      }));
    }
  };

  return {
    // Estados del carrito
    cartItems,
    cartSubtotal,
    cartTaxes,
    cartShipping,
    cartTotal,
    isFreeShipping,
    hasOutOfStockItems,

    // Estados y funciones de formulario
    ...form,

    // Estados de procesamiento
    step: orderProcessing.step,
    error: orderProcessing.error,
    isProcessing: orderProcessing.isProcessing,
    orderId: orderProcessing.orderId,

    // Manejador para procesar la orden
    handleProcessOrder
  };
};