import { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';
import {
  getUserPaymentMethods,
  deletePaymentMethod,
  setDefaultPaymentMethod
} from '../services/paymentService';
import { useFirebaseFunctionsMock } from '../services/mockFirebaseFunctions.js'

/**
 * Custom hook mejorado para gestión de métodos de pago
 * Incluye protecciones para operaciones concurrentes
 */
export const usePayments = () => {
  const dispatch = useDispatch();
  const { uid, status } = useSelector(state => state.auth);

  // Referencia para evitar operaciones duplicadas
  const operationInProgressRef = useRef(false);

  // Estados para gestionar métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Usar mocks en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    useFirebaseFunctionsMock();
  }

  // Cargar métodos de pago desde Firestore
  const loadPaymentMethods = useCallback(async () => {
    // Solo cargar si el usuario está autenticado
    if (status !== 'authenticated' || !uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserPaymentMethods(uid);

      if (result.ok) {
        console.log('Métodos de pago cargados:', result.data);
        setPaymentMethods(result.data);
      } else {
        setError(result.error || 'Error al cargar métodos de pago');
        dispatch(addMessage({
          type: 'error',
          text: 'No se pudieron cargar tus métodos de pago'
        }));
      }
    } catch (err) {
      console.error('Error en usePayments:', err);
      setError('Error al cargar los métodos de pago');
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar métodos de pago'
      }));
    } finally {
      setLoading(false);
    }
  }, [uid, status, dispatch]);

  // Cargar métodos de pago cuando cambia el trigger de actualización
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods, refreshTrigger]);

  // Actualizar la lista de métodos de pago
  const refreshPaymentMethods = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Establecer un método de pago como predeterminado
  const setDefaultPayment = useCallback(async (id) => {
    if (!id) return;

    // Evitar operaciones duplicadas
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    setLoading(true);

    try {
      const result = await setDefaultPaymentMethod(uid, id);

      if (result.ok) {
        // Actualizar el estado local para una respuesta más rápida
        setPaymentMethods(prevMethods =>
          prevMethods.map(method => ({
            ...method,
            isDefault: method.id === id
          }))
        );

        dispatch(addMessage({
          type: 'success',
          text: 'Método de pago predeterminado actualizado'
        }));
      } else {
        throw new Error(result.error || 'Error al actualizar método de pago predeterminado');
      }
    } catch (err) {
      console.error('Error estableciendo método de pago predeterminado:', err);
      dispatch(addMessage({
        type: 'error',
        text: err.message || 'Error al actualizar método de pago predeterminado'
      }));

      // Recargar para asegurar que los datos estén sincronizados
      refreshPaymentMethods();
    } finally {
      setLoading(false);
      operationInProgressRef.current = false;
    }
  }, [uid, dispatch, refreshPaymentMethods]);

  // Eliminar un método de pago
  const deletePayment = useCallback(async (id) => {
    // Buscar el método de pago para obtener el ID de Stripe
    const paymentMethod = paymentMethods.find(method => method.id === id);

    if (!paymentMethod) {
      dispatch(addMessage({
        type: 'error',
        text: 'Método de pago no encontrado'
      }));
      return;
    }

    // Evitar operaciones duplicadas
    if (operationInProgressRef.current) return;

    // Confirmar eliminación
    if (window.confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
      operationInProgressRef.current = true;
      setLoading(true);

      try {
        const result = await deletePaymentMethod(
          id,
          paymentMethod.stripePaymentMethodId
        );

        if (result.ok) {
          // Actualizar el estado local
          setPaymentMethods(prevMethods =>
            prevMethods.filter(method => method.id !== id)
          );

          dispatch(addMessage({
            type: 'success',
            text: 'Método de pago eliminado correctamente'
          }));
        } else {
          throw new Error(result.error || 'Error al eliminar método de pago');
        }
      } catch (err) {
        console.error('Error eliminando método de pago:', err);
        dispatch(addMessage({
          type: 'error',
          text: err.message || 'Error al eliminar método de pago'
        }));

        // Recargar para asegurar que los datos estén sincronizados
        refreshPaymentMethods();
      } finally {
        setLoading(false);
        operationInProgressRef.current = false;
      }
    }
  }, [paymentMethods, dispatch, refreshPaymentMethods]);

  // Abrir el formulario para agregar un nuevo método de pago
  const addPayment = useCallback(() => {
    setShowForm(true);
  }, []);

  // Cerrar el formulario de forma segura
  const closeForm = useCallback(() => {
    if (!operationInProgressRef.current) {
      setShowForm(false);
    }
  }, []);

  // Manejar el éxito después de agregar un método de pago
  const handlePaymentAdded = useCallback(() => {
    // Pequeño retraso para asegurar que Firestore ya tenga los datos actualizados
    setTimeout(() => {
      refreshPaymentMethods();
    }, 500);
  }, [refreshPaymentMethods]);

  return {
    paymentMethods,
    loading,
    error,
    showForm,
    setDefaultPayment,
    deletePayment,
    addPayment,
    closeForm,
    handlePaymentAdded,
    refreshPaymentMethods,
    loadPaymentMethods
  };
};