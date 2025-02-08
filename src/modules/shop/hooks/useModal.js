import { useState, useCallback } from 'react';

/**
 * useModal custom hook
 * Manages open/close state and selected product for a modal.
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /**
   * Opens the modal with a given product.
   */
  const openModal = useCallback((product) => {
    setSelectedProduct(product);
    setIsOpen(true);
  }, []);

  /**
   * Closes the modal and resets the product.
   */
  const closeModal = useCallback(() => {
    setSelectedProduct(null);
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    selectedProduct,
    openModal,
    closeModal,
  };
};