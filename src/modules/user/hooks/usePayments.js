import { useState } from 'react';

/**
 * Hook personalizado para manejar la lógica de métodos de pago
 *
 * @returns {Object} - Métodos y estado para manejar métodos de pago
 */
export const usePayments = () => {
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
   * Establece un metodo de pago como predeterminado
   * @param {string} id - ID del metodo de pago
   */
  const setDefaultPayment = (id) => {
    setPaymentMethods(paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id
    })));
  };

  /**
   * Elimina un metodo de pago
   * @param {string} id - ID del metodo de pago
   */
  const deletePayment = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este método de pago?')) {
      setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    }
  };

  /**
   * Edita un metodo de pago existente
   * @param {Object} payment - Metodo de pago a editar
   */
  const editPayment = (payment) => {
    // TODO aquí iría la lógica para mostrar un modal o formulario de edición
    console.log('Editando método de pago:', payment);
  };

  /**
   * Añade un nuevo metodo de pago
   */
  const addPayment = () => {
    // TODO aquí iría la lógica para mostrar un modal o formulario de nuevo método de pago
    console.log('Añadiendo nuevo método de pago');
  };

  return {
    paymentMethods,
    setDefaultPayment,
    deletePayment,
    editPayment,
    addPayment
  };
};