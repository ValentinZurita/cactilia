import { useState } from 'react';

/**
 * Hook personalizado para gestionar un modal
 * Proporciona funciones para abrir, cerrar y gestionar el contenido del modal
 *
 * @param {boolean} initialState - Estado inicial del modal (abierto o cerrado)
 * @returns {Object} - Funciones y estados para gestionar el modal
 */
export const useModal = (initialState = false) => {
  // Estado para controlar si el modal está abierto o cerrado
  const [isOpen, setIsOpen] = useState(initialState);

  // Estado para almacenar el contenido o datos específicos del modal
  const [modalData, setModalData] = useState(null);

  /**
   * Abre el modal y opcionalmente establece datos específicos
   *
   * @param {any} data - Datos opcionales a asociar con el modal
   */
  const openModal = (data = null) => {
    setModalData(data);
    setIsOpen(true);
  };

  /**
   * Cierra el modal y limpia los datos asociados
   */
  const closeModal = () => {
    setIsOpen(false);
    // Limpiar datos después de un breve retraso para que la animación de cierre sea suave
    setTimeout(() => {
      setModalData(null);
    }, 300);
  };

  /**
   * Actualiza los datos asociados al modal
   *
   * @param {any} data - Nuevos datos para asociar con el modal
   */
  const updateModalData = (data) => {
    setModalData(data);
  };

  return {
    isOpen,
    modalData,
    openModal,
    closeModal,
    updateModalData
  };
};