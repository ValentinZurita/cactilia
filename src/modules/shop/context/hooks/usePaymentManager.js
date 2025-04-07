import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserPaymentMethods } from '../../../user/services/paymentService.js'

/**
 * Hook personalizado para gestionar métodos de pago en el checkout
 *
 * Centraliza toda la lógica relacionada con:
 * - Carga de métodos de pago del usuario
 * - Selección de método existente, nueva tarjeta o OXXO
 * - Manejo del formulario de nueva tarjeta
 *
 * @param {string} userId - ID del usuario autenticado
 * @returns {Object} Estado y métodos para gestión de pagos
 */
export const usePaymentManager = (userId) => {
  // Estados para método de pago
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState('new_card');
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [newCardData, setNewCardData] = useState({
    cardholderName: '',
    saveCard: false,
    isComplete: false,
    error: null
  });

  // Referencia para evitar múltiples llamadas durante el montaje
  const initialLoadComplete = useRef(false);

  // Cargar métodos de pago cuando tenemos un userId
  useEffect(() => {
    loadUserPaymentMethods();
  }, [userId]);

  // Función para cargar métodos de pago del usuario
  const loadUserPaymentMethods = useCallback(async () => {
    // Si no hay userId, no hacer nada
    if (!userId) {
      setLoadingPayments(false);
      return;
    }

    setLoadingPayments(true);
    try {
      const result = await getUserPaymentMethods(userId);

      if (result.ok) {
        const methods = result.data || [];
        setPaymentMethods(methods);

        // Si hay métodos, seleccionar el predeterminado o primero
        if (methods.length > 0 && !selectedPaymentId) {
          const defaultMethod = methods.find(m => m.isDefault);
          if (defaultMethod) {
            setSelectedPaymentId(defaultMethod.id);
            setSelectedPaymentType('card');
          } else {
            setSelectedPaymentId(methods[0].id);
            setSelectedPaymentType('card');
          }
        } else if (methods.length === 0) {
          // Si no hay métodos guardados, seleccionar nueva tarjeta
          setSelectedPaymentType('new_card');
          setSelectedPaymentId(null);
        }

        initialLoadComplete.current = true;
      } else {
        console.error('Error cargando métodos de pago:', result.error);
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error en loadUserPaymentMethods:', error);
      setPaymentMethods([]);
    } finally {
      setLoadingPayments(false);
    }
  }, [userId, selectedPaymentId]);

  // Manejador para seleccionar un método de pago existente
  const handlePaymentSelect = useCallback((paymentId, paymentType = 'card') => {
    setSelectedPaymentId(paymentId);
    setSelectedPaymentType(paymentType);
  }, []);

  // Manejador para seleccionar tarjeta nueva
  const handleNewCardSelect = useCallback(() => {
    setSelectedPaymentId(null);
    setSelectedPaymentType('new_card');
  }, []);

  // Manejador para seleccionar OXXO
  const handleOxxoSelect = useCallback((billingManager) => {
    // Los usuarios autenticados ya tienen email, así que no necesitamos verificar
    // datos de facturación si la plataforma requiere autenticación para comprar
    
    setSelectedPaymentId(null);
    setSelectedPaymentType('oxxo');
  }, []);

  // Manejador para actualizar datos de tarjeta nueva
  const handleNewCardDataChange = useCallback((data) => {
    setNewCardData(prev => ({ ...prev, ...data }));
  }, []);

  // Función para manejar cuando se ha agregado un nuevo método de pago
  const handlePaymentMethodAdded = useCallback(() => {
    // Recargar la lista de métodos de pago
    loadUserPaymentMethods();
  }, [loadUserPaymentMethods]);

  // Obtener el método de pago seleccionado del array de métodos
  const selectedPayment = selectedPaymentType === 'card'
    ? paymentMethods.find(method => method.id === selectedPaymentId)
    : null;

  return {
    // Estado
    paymentMethods,
    selectedPaymentId,
    selectedPaymentType,
    selectedPayment,
    loadingPayments,
    newCardData,

    // Métodos
    handlePaymentSelect,
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,
    handlePaymentMethodAdded
  };
};