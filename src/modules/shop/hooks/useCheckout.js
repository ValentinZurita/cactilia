// src/modules/shop/hooks/useCheckout.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { FirebaseDB } from '../../../firebase/firebaseConfig';
import { addMessage } from '../../../store/messages/messageSlice';
import { clearCartWithSync } from '../../../store/cart/cartThunk';
import { useCart } from '../../user/hooks/useCart';

/**
 * Custom hook to handle the checkout process
 * Manages selection of address, payment method, and order processing
 */
export const useCheckout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Get Firebase Functions instance
  const functions = getFunctions();

  // Connect to emulator in development
  if (process.env.NODE_ENV !== 'production') {
    // Use a ref to track if we've already connected to avoid "already connected" errors
    const hasConnected = useRef(false);

    useEffect(() => {
      if (!hasConnected.current) {
        try {
          connectFunctionsEmulator(functions, "localhost", 5001);
          console.log("Connected to Firebase Functions emulator");
          hasConnected.current = true;
        } catch (e) {
          console.log("Emulator connection error (can be ignored if already connected):", e);
        }
      }
    }, []);
  }

  // Get user information from Redux store
  const { uid, status } = useSelector(state => state.auth);

  // Get cart information
  const {
    items,
    subtotal,
    taxes,
    shipping,
    finalTotal,
    isFreeShipping,
    hasOutOfStockItems,
  } = useCart();

  // Checkout states
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [step, setStep] = useState(1); // 1: checkout, 2: processing, 3: confirmation
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);

  // Verify user is authenticated
  useEffect(() => {
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=checkout');
    }
  }, [status, navigate]);

  // Verify cart has items
  useEffect(() => {
    if (items.length === 0 && status === 'authenticated') {
      navigate('/shop');
    }
  }, [items, status, navigate]);

  // Load user addresses
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingAddresses(true);
      try {
        const { getUserAddresses } = await import('../../user/services/addressService');
        const result = await getUserAddresses(uid);

        if (result.ok) {
          setAddresses(result.data);
        } else {
          console.error("Error loading addresses:", result.error);
          dispatch(addMessage({
            type: 'error',
            text: 'Could not load your shipping addresses'
          }));
        }
      } catch (error) {
        console.error("Error loading addresses:", error);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadUserAddresses();
  }, [uid, status, dispatch]);

  // Load user payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (status !== 'authenticated' || !uid) return;

      setLoadingPayments(true);
      try {
        const { getUserPaymentMethods } = await import('../../user/services/paymentService');
        const result = await getUserPaymentMethods(uid);

        if (result.ok) {
          setPaymentMethods(result.data);
        } else {
          console.error("Error loading payment methods:", result.error);
          dispatch(addMessage({
            type: 'error',
            text: 'Could not load your payment methods'
          }));
        }
      } catch (error) {
        console.error("Error loading payment methods:", error);
      } finally {
        setLoadingPayments(false);
      }
    };

    loadPaymentMethods();
  }, [uid, status, dispatch]);

  // Update selected address when ID changes
  const updateSelectedAddress = useCallback((addresses, addressId) => {
    if (!addresses || !addressId) return;

    const address = addresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
    }
  }, []);

  // Update selected payment method when ID changes
  const updateSelectedPayment = useCallback((paymentMethods, paymentId) => {
    if (!paymentMethods || !paymentId) return;

    const payment = paymentMethods.find(method => method.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
    }
  }, []);

  // Handle address change
  const handleAddressChange = useCallback((addressId) => {
    setSelectedAddressId(addressId);
    updateSelectedAddress(addresses, addressId);
  }, [updateSelectedAddress, addresses]);

  // Handle payment method change
  const handlePaymentChange = useCallback((paymentId) => {
    setSelectedPaymentId(paymentId);
    updateSelectedPayment(paymentMethods, paymentId);
  }, [updateSelectedPayment, paymentMethods]);

  // Handle invoice requirement change
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);

    // If no longer requires invoice, clear fiscal data
    if (!requires) {
      setFiscalData(null);
    }
  }, []);

  // Handle fiscal data change
  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(data);
  }, []);

  // Handle order notes change
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value);
  }, []);

  // Validate checkout data is complete
  const validateCheckoutData = useCallback(() => {
    if (!selectedAddressId || !selectedAddress) {
      setError('You must select a shipping address');
      return false;
    }

    if (!selectedPaymentId || !selectedPayment) {
      setError('You must select a payment method');
      return false;
    }

    if (requiresInvoice && (!fiscalData || !fiscalData.rfc)) {
      setError('Fiscal data is required for invoicing');
      return false;
    }

    if (hasOutOfStockItems) {
      setError('There are out-of-stock items in your cart');
      return false;
    }

    if (!stripe || !elements) {
      setError('Payment system is not ready. Please try again.');
      return false;
    }

    setError(null);
    return true;
  }, [
    selectedAddressId,
    selectedAddress,
    selectedPaymentId,
    selectedPayment,
    requiresInvoice,
    fiscalData,
    hasOutOfStockItems,
    stripe,
    elements
  ]);

  // Prepare order data
  const prepareOrderData = useCallback(() => {
    // Create a copy of shipping address information
    const shippingInfo = {
      addressId: selectedAddressId,
      address: { ...selectedAddress },
      method: 'standard',
      cost: isFreeShipping ? 0 : shipping,
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days later
    };

    // Create a limited copy of payment method information (for security)
    const paymentInfo = {
      methodId: selectedPaymentId,
      method: {
        type: selectedPayment.type,
        last4: selectedPayment.cardNumber.split(' ').pop(),
        brand: selectedPayment.type
      },
      status: 'pending',
      stripePaymentMethodId: selectedPayment.stripePaymentMethodId
    };

    // Billing information
    const billingInfo = {
      requiresInvoice,
      fiscalData: requiresInvoice ? fiscalData : null
    };

    // Complete order data
    return {
      userId: uid,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      shipping: shippingInfo,
      payment: paymentInfo,
      billing: billingInfo,
      totals: {
        subtotal,
        tax: taxes,
        shipping: isFreeShipping ? 0 : shipping,
        discount: 0,
        total: finalTotal
      },
      notes: orderNotes,
      status: 'pending',
      createdAt: new Date()
    };
  }, [
    selectedAddressId,
    selectedAddress,
    selectedPaymentId,
    selectedPayment,
    requiresInvoice,
    fiscalData,
    isFreeShipping,
    shipping,
    subtotal,
    taxes,
    finalTotal,
    orderNotes,
    uid,
    items
  ]);

  // Process order
  const handleProcessOrder = useCallback(async () => {
    // Validate data
    if (!validateCheckoutData()) {
      return;
    }

    setIsProcessing(true);
    setStep(2);

    try {
      // 1. Prepare order data
      const orderData = prepareOrderData();

      // 2. Create PaymentIntent in Stripe through our Cloud Function
      const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
      const paymentResponse = await createPaymentIntent({
        amount: Math.round(orderData.totals.total * 100), // Convert to cents and round
        paymentMethodId: orderData.payment.stripePaymentMethodId,
        description: `Order at Cactilia`
      });

      if (!paymentResponse.data || !paymentResponse.data.clientSecret) {
        throw new Error("Could not create payment intent");
      }

      const { clientSecret, paymentIntentId } = paymentResponse.data;
      setClientSecret(clientSecret);

      // 3. Save order to Firestore with PaymentIntent ID
      const orderToSave = {
        ...orderData,
        payment: {
          ...orderData.payment,
          paymentIntentId
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(FirebaseDB, 'orders'), orderToSave);
      setOrderId(orderRef.id);

      // 4. Confirm payment with Stripe
      const { error: stripeError } = await stripe.confirmCardPayment(
        clientSecret, {
          payment_method: orderData.payment.stripePaymentMethodId
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // 5. Confirm payment result via Cloud Function
      const confirmOrderPayment = httpsCallable(functions, 'confirmOrderPayment');
      const confirmResult = await confirmOrderPayment({
        orderId: orderRef.id,
        paymentIntentId
      });

      if (!confirmResult.data || !confirmResult.data.success) {
        throw new Error("Error confirming payment");
      }

      // 6. Show success message and clear cart
      dispatch(addMessage({
        type: 'success',
        text: 'Payment completed successfully! Your order has been processed.',
        autoHide: true,
        duration: 5000
      }));

      dispatch(clearCartWithSync());

      // 7. Change to confirmation step
      setStep(3);

    } catch (err) {
      console.error('Error processing order:', err);
      setError(err.message || 'Error processing your order. Please try again.');

      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error processing payment.',
        autoHide: true,
        duration: 5000
      }));

      setStep(1);
    } finally {
      setIsProcessing(false);
    }
  }, [
    validateCheckoutData,
    prepareOrderData,
    dispatch,
    functions,
    stripe,
    FirebaseDB
  ]);

  return {
    // States
    selectedAddressId,
    selectedPaymentId,
    requiresInvoice,
    fiscalData,
    orderNotes,
    step,
    error,
    orderId,
    isProcessing,
    addresses,
    paymentMethods,
    loadingAddresses,
    loadingPayments,

    // Handlers
    handleAddressChange,
    handlePaymentChange,
    handleInvoiceChange,
    handleFiscalDataChange,
    handleNotesChange,
    handleProcessOrder,

    // Helper selectors
    updateSelectedAddress,
    updateSelectedPayment
  };
};