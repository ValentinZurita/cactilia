import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCart } from './useCart.js'
import { addMessage } from '../../../../../store/messages/messageSlice.js'


/**
 * Hook personalizado que encapsula toda la lógica de la página del carrito
 *
 * Centraliza el manejo del estado, validaciones y acciones relacionadas
 *
 * @returns {Object} Estado y métodos para la página del carrito
 */
export const useCartPageLogic = () => {

  /*

  +----------------------------------------+
  |            Importaciones               |
  +----------------------------------------+

   */

  // Hooks de navegación y estado
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.auth);

  // Estado de UI
  const [isValidating, setIsValidating] = useState(false);

  // Referencias para control de validación
  const validationTimerRef = useRef(null);
  const hasValidatedRef = useRef(false);

  // Obtener datos y funciones del carrito
  const {
    items: cartItems,
    itemsCount,
    hasStockIssues,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    forceStockValidation,
    isValidatingStock
  } = useCart();


  /*

  +----------------------------------------+
  |            Validación inicial          |
  +----------------------------------------+

   */

  useEffect(() => {

    // Limpiar cualquier timer previo
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Si ya validamos o no hay items, no hacer nada
    if (hasValidatedRef.current || cartItems.length === 0) {
      return;
    }

    const validateInitialStock = async () => {
      setIsValidating(true);
      try {
        await forceStockValidation();
        hasValidatedRef.current = true;
      } catch (error) {
        console.error('Error en validación inicial:', error);
      } finally {
        setIsValidating(false);
      }
    };

    // Iniciar validación después de un breve retraso
    validationTimerRef.current = setTimeout(validateInitialStock, 1000);

    // Limpiar timer en desmontaje
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, [cartItems.length, forceStockValidation]);


  /*

  +----------------------------------------+
  |            Lógica del carrito          |
  +----------------------------------------+

   */

  /**
   * Maneja el proceso de ir al checkout con todas las validaciones necesarias
   */
  const handleCheckout = async () => {
    // Verificar si el usuario está autenticado
    if (status !== 'authenticated') {
      navigate('/auth/login?redirect=shop/checkout');
      return;
    }

    // Validar stock antes de proceder
    setIsValidating(true);
    try {
      const stockValidation = await forceStockValidation();

      if (!stockValidation.valid) {
        dispatch(addMessage({
          type: 'warning',
          text: stockValidation.error || 'Hay productos con problemas de stock',
          autoHide: true,
          duration: 3000
        }));
        return;
      }

      navigate('/shop/checkout');
    } catch (error) {
      console.error('Error validando stock para checkout:', error);
      dispatch(addMessage({
        type: 'error',
        text: 'Error al verificar disponibilidad',
        autoHide: true,
        duration: 3000
      }));
    } finally {
      setIsValidating(false);
    }
  };


  /*

  +----------------------------------------+
  |            Navegación y UI             |
  +----------------------------------------+

   */

  return {
    // Datos
    cartItems,

    // Lógica del carrito
    cartLogic: {
      itemsCount,
      hasStockIssues,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      handleCheckout
    },

    // Estado de la UI
    uiState: {
      isValidating: isValidating || isValidatingStock
    }
  };
};