import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Hook personalizado para manejar la lógica de métodos de pago
 *
 * @returns {Object} - Métodos y estado para manejar métodos de pago
 */
export const usePayments = () => {
  const dispatch = useDispatch();

  // Datos de ejemplo - vendrían de Firebase en implementación real
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'visa',
      cardNumber: '**** **** **** 4242',
      cardHolder: 'Valentin A. Perez',
      expiryDate: '12/28',
      isDefault: true
    },
    {
      id: '2',
      type: 'mastercard',
      cardNumber: '**** **** **** 5678',
      cardHolder: 'Valentin A. Perez',
      expiryDate: '09/27',
      isDefault: false
    }
  ]);

  /**
   * Establece un método de pago como predeterminado
   * @param {string} id - ID del método de pago
   */
  const setDefaultPayment = useCallback((id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));

    dispatch(addMessage({
      type: 'success',
      text: 'Método de pago establecido como predeterminado'
    }));
  }, [paymentMethods, dispatch]);

  /**
   * Elimina un método de pago
   * @param {string} id - ID del método de pago
   */
  const deletePayment = useCallback((id) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));

      dispatch(addMessage({
        type: 'success',
        text: 'Método de pago eliminado correctamente'
      }));
    }
  }, [paymentMethods, dispatch]);

  /**
   * Edita un método de pago existente
   * @param {Object} payment - Método de pago a editar
   */
  const editPayment = useCallback((payment) => {
    // TODO aquí iría la lógica para mostrar un modal o formulario de edición
    console.log('Editando método de pago:', payment);

    dispatch(addMessage({
      type: 'info',
      text: 'Funcionalidad de edición en desarrollo'
    }));
  }, [dispatch]);

  /**
   * Añade un nuevo método de pago
   */
  const addPayment = useCallback(() => {
    // TODO aquí iría la lógica para mostrar un modal o formulario de nuevo método de pago
    console.log('Añadiendo nuevo método de pago');

    dispatch(addMessage({
      type: 'info',
      text: 'Funcionalidad de añadir método de pago en desarrollo'
    }));
  }, [dispatch]);

  return {
    paymentMethods,
    setDefaultPayment,
    deletePayment,
    editPayment,
    addPayment
  };
};