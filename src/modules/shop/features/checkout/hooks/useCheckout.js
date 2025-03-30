// src/modules/shop/features/checkout/hooks/useCheckout.js
import { useCheckoutContext } from '../../../context/CheckoutContext';

/**
 * Hook para acceder al contexto de checkout
 * @returns {Object} Estado y métodos del checkout
 */
export const useCheckout = () => {
  return useCheckoutContext();
};