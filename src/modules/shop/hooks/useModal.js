import { useState, useCallback } from 'react';

/**
 * useModal custom hook con logs para depuración
 * Manages open/close state and selected product for a modal.
 */
export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  /**
   * Opens the modal with a given product.
   */
  const openModal = useCallback((product) => {
    console.log("openModal llamado con producto:", product?.name);
    setSelectedProduct(product);
    setIsOpen(true);
    console.log("Estado tras openModal:", { isOpen: true, product: product?.name });
  }, []);

  /**
   * Closes the modal and resets the product.
   */
  const closeModal = useCallback(() => {
    console.log("closeModal llamado");
    setIsOpen(false);
    // Importante: primero cerramos el modal, y luego con un pequeño retraso limpiamos el producto
    // Esto evita parpadeos en la UI mientras se cierra el modal
    setTimeout(() => {
      setSelectedProduct(null);
      console.log("selectedProduct reseteado");
    }, 300);
    console.log("Estado tras closeModal:", { isOpen: false });
  }, []);

  return {
    isOpen,
    selectedProduct,
    openModal,
    closeModal,
  };
};