import { useState, useEffect, useCallback } from 'react';
import { addMessage } from '../../../../../store/messages/messageSlice.js';

/**
 * Hook para manejar la selección de métodos de pago en el checkout
 *
 * @param {string} uid - ID del usuario
 * @param {Function} dispatch - Función dispatch de Redux
 * @returns {Object} Estados y funciones para manejo de métodos de pago
 */
export const usePaymentSelection = (uid, dispatch) => {
  // Estados relacionados con métodos de pago
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useNewCard, setUseNewCard] = useState(false);
  const [newCardData, setNewCardData] = useState({
    cardholderName: '',
    saveCard: false,
    isComplete: false,
    error: null
  });

  // Cargar métodos de pago al iniciar
  useEffect(() => {
    const loadPaymentMethods = async () => {
      if (!uid) return;

      setLoading(true);
      try {
        // Importación dinámica del servicio de métodos de pago
        const { getUserPaymentMethods } = await import('../../../../user/services/paymentService.js');
        const result = await getUserPaymentMethods(uid);

        if (result.ok) {
          setPaymentMethods(result.data);

          // Si no hay método seleccionado pero hay métodos disponibles,
          // seleccionar el método predeterminado o el primero
          if (!selectedPaymentId && !selectedPaymentType && result.data.length > 0) {
            const defaultMethod = result.data.find(method => method.isDefault);

            if (defaultMethod) {
              setSelectedPaymentId(defaultMethod.id);
              setSelectedPayment(defaultMethod);
              setSelectedPaymentType('card');
              setUseNewCard(false);
            } else if (result.data.length > 0) {
              setSelectedPaymentId(result.data[0].id);
              setSelectedPayment(result.data[0]);
              setSelectedPaymentType('card');
              setUseNewCard(false);
            }
          }
        } else {
          console.error('Error loading payment methods:', result.error);
          dispatch(
            addMessage({
              type: 'error',
              text: 'No se pudieron cargar tus métodos de pago'
            })
          );
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPaymentMethods();
  }, [uid, dispatch]);

  // Helper: Actualizar el método de pago seleccionado
  const updateSelectedPayment = useCallback((paymentList, paymentId) => {
    if (!paymentList || !paymentId) return;

    const payment = paymentList.find(method => method.id === paymentId);
    if (payment) {
      setSelectedPayment(payment);
    }
  }, []);

  // Manejador para cambio de método de pago guardado
  const handlePaymentChange = useCallback((paymentId, paymentType = 'card') => {
    setSelectedPaymentId(paymentId);
    setSelectedPaymentType(paymentType);
    updateSelectedPayment(paymentMethods, paymentId);

    if (paymentType === 'card') {
      setUseNewCard(false);
    }
  }, [updateSelectedPayment, paymentMethods]);

  // Manejador para seleccionar tarjeta nueva
  const handleNewCardSelect = useCallback(() => {
    setSelectedPaymentId(null);
    setSelectedPayment(null);
    setSelectedPaymentType('new_card');
    setUseNewCard(true);
  }, []);

  // Manejador para seleccionar OXXO
  const handleOxxoSelect = useCallback(() => {
    setSelectedPaymentId(null);
    setSelectedPayment(null);
    setSelectedPaymentType('oxxo');
    setUseNewCard(false);
  }, []);

  // Manejador para cambios en datos de tarjeta nueva
  const handleNewCardDataChange = useCallback((data) => {
    setNewCardData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  return {
    selectedPaymentId,
    selectedPaymentType,
    selectedPayment,
    paymentMethods,
    loading,
    useNewCard,
    newCardData,
    handlePaymentChange,
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,
    updateSelectedPayment
  };
};