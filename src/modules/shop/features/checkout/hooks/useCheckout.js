import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { addMessage } from '../../../../../store/messages/messageSlice.js';
import { useCart } from '../../../../user/hooks/useCart.js';
import { useAddressSelection } from './useAddressSelection';
import { usePaymentSelection } from './usePaymentSelection';
import { useOrderProcessing } from './useOrderProcessing.js';
import { useFiscalData } from './useFiscalData';

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

  // Datos del carrito
  const { items, subtotal, taxes, shipping, finalTotal, isFreeShipping, hasOutOfStockItems } = useCart();

  // Estados básicos para el proceso de checkout
  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1);   // 1: Formulario, 2: Procesando
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Importar hooks especializados
  const addressSelection = useAddressSelection(uid, dispatch);
  const paymentSelection = usePaymentSelection(uid, dispatch);
  const fiscalData = useFiscalData();
  const orderProcessing = useOrderProcessing({
    auth,
    items,
    subtotal,
    taxes,
    shipping,
    finalTotal,
    isFreeShipping,
    addressSelection,
    paymentSelection,
    fiscalData,
    orderNotes,
    stripe,
    elements,
    dispatch,
    setStep,
    setError,
    setOrderId,
    setIsProcessing,
    setClientSecret
  });

  // Redireccionar si no está autenticado
  useEffect(() => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=checkout');
    }
  }, [status, navigate]);

  // Redireccionar si el carrito está vacío
  useEffect(() => {
    if (items.length === 0 && status === 'authenticated') {
      navigate('/shop');
    }
  }, [items, status, navigate]);

  // Manejar notas del pedido
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  // Devolver todos los estados y funciones necesarias
  return {
    // Datos de selección de dirección
    selectedAddressId: addressSelection.selectedAddressId,
    selectedAddressType: addressSelection.selectedAddressType,
    addresses: addressSelection.addresses,
    loadingAddresses: addressSelection.loading,
    useNewAddress: addressSelection.useNewAddress,
    newAddressData: addressSelection.newAddressData,
    handleAddressChange: addressSelection.handleAddressChange,
    handleNewAddressSelect: addressSelection.handleNewAddressSelect,
    handleNewAddressDataChange: addressSelection.handleNewAddressDataChange,

    // Datos de selección de método de pago
    selectedPaymentId: paymentSelection.selectedPaymentId,
    selectedPaymentType: paymentSelection.selectedPaymentType,
    paymentMethods: paymentSelection.paymentMethods,
    loadingPayments: paymentSelection.loading,
    useNewCard: paymentSelection.useNewCard,
    newCardData: paymentSelection.newCardData,
    handlePaymentChange: paymentSelection.handlePaymentChange,
    handleNewCardSelect: paymentSelection.handleNewCardSelect,
    handleOxxoSelect: paymentSelection.handleOxxoSelect,
    handleNewCardDataChange: paymentSelection.handleNewCardDataChange,

    // Datos de facturación
    requiresInvoice: fiscalData.requiresInvoice,
    fiscalData: fiscalData.data,
    handleInvoiceChange: fiscalData.handleInvoiceChange,
    handleFiscalDataChange: fiscalData.handleFiscalDataChange,

    // Datos del proceso de checkout
    orderNotes,
    step,
    error,
    orderId,
    isProcessing,
    handleNotesChange,
    handleProcessOrder: orderProcessing.processOrder
  };
};