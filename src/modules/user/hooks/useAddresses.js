import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';
import {
  getUserAddresses,
  addAddress,
  deleteAddress as deleteAddressService,
  setDefaultAddress as setDefaultAddressService,
  updateAddress
} from '../services/addressService';

/**
 * Hook personalizado mejorado para gestionar direcciones de usuario
 * Soporta campos adicionales para direcciones mexicanas
 *
 * @returns {Object} - Estados y funciones para gestionar direcciones
 */
export const useAddresses = () => {
  // Obtener datos del usuario autenticado desde Redux
  const { uid, status } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  // Estados para gestionar direcciones
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Estados para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Referencia para evitar operaciones duplicadas
  const operationInProgressRef = useRef(false);

  /**
   * Cargar direcciones del usuario desde Firestore
   */
  const loadAddresses = useCallback(async () => {
    // Solo cargar direcciones si el usuario está autenticado
    if (status !== 'authenticated' || !uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getUserAddresses(uid);

      if (result.ok) {
        setAddresses(result.data);
      } else {
        setError(result.error || 'Error al cargar direcciones');
        dispatch(addMessage({
          type: 'error',
          text: 'No se pudieron cargar tus direcciones'
        }));
      }
    } catch (err) {
      console.error('Error en useAddresses:', err);
      setError('Error al cargar las direcciones');
      dispatch(addMessage({
        type: 'error',
        text: 'Error al cargar direcciones'
      }));
    } finally {
      setLoading(false);
    }
  }, [uid, status, dispatch]);

  // Cargar direcciones al montar el componente o cuando cambia el usuario
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /**
   * Abrir formulario para agregar una nueva dirección
   */
  const openAddForm = () => {
    setSelectedAddress(null);
    setShowForm(true);
  };

  /**
   * Abrir formulario para editar una dirección existente
   * @param {Object} address - Dirección a editar
   */
  const openEditForm = (address) => {
    setSelectedAddress(address);
    setShowForm(true);
  };

  /**
   * Cerrar formulario de direcciones
   */
  const closeForm = () => {
    setShowForm(false);
    setSelectedAddress(null);
  };

  /**
   * Agregar o actualizar una dirección
   *
   * @param {Object} addressData - Datos de la dirección
   * @returns {Promise<{ok: boolean, error: string}>}
   */
  const saveAddress = async (addressData) => {
    if (!uid) {
      dispatch(addMessage({
        type: 'error',
        text: 'Debes iniciar sesión para guardar direcciones'
      }));
      return { ok: false, error: 'No autenticado' };
    }

    setSubmitting(true);

    try {
      let result;

      // Determinar si estamos agregando o actualizando según si tiene ID
      if (addressData.id) {
        // Actualizar dirección existente
        result = await updateAddress(addressData.id, addressData, uid);

        if (result.ok) {
          // Actualizar la dirección en el estado local
          setAddresses(prev =>
            prev.map(address =>
              address.id === addressData.id ? { ...addressData, id: address.id } : address
            )
          );

          dispatch(addMessage({
            type: 'success',
            text: 'Dirección actualizada correctamente'
          }));
        }
      } else {
        // Agregar nueva dirección
        result = await addAddress(uid, addressData);

        if (result.ok) {
          // Si no hay direcciones, marcar esta como predeterminada
          const shouldBeDefault = addresses.length === 0 || addressData.isDefault;

          // Agregar la nueva dirección al estado local
          const newAddress = {
            ...addressData,
            id: result.id,
            isDefault: shouldBeDefault
          };

          setAddresses(prev => [...prev, newAddress]);

          dispatch(addMessage({
            type: 'success',
            text: 'Dirección agregada correctamente'
          }));
        }
      }

      if (!result.ok) {
        setError(result.error || 'Error al guardar la dirección');
        dispatch(addMessage({
          type: 'error',
          text: result.error || 'Error al guardar la dirección'
        }));
      } else {
        // Cerrar el formulario si la operación fue exitosa
        closeForm();
      }

      return result;
    } catch (err) {
      console.error('Error guardando dirección:', err);
      const errorMsg = 'Error al guardar la dirección';
      setError(errorMsg);
      dispatch(addMessage({
        type: 'error',
        text: errorMsg
      }));
      return { ok: false, error: errorMsg };
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Iniciar el proceso de confirmación de eliminación
   *
   * @param {string} addressId - ID de la dirección a eliminar
   */
  const confirmDeleteAddress = (addressId) => {
    // Obtener la dirección completa para mostrar en el modal
    const address = addresses.find(addr => addr.id === addressId);

    if (!address) {
      dispatch(addMessage({
        type: 'error',
        text: 'Dirección no encontrada'
      }));
      return;
    }

    // Verificar si es la dirección predeterminada
    if (address.isDefault) {
      dispatch(addMessage({
        type: 'error',
        text: 'No puedes eliminar la dirección predeterminada'
      }));
      return;
    }

    // Establecer la dirección que se va a eliminar
    setAddressToDelete(address);

    // Mostrar el modal de confirmación
    setShowConfirmModal(true);
  };

  /**
   * Cancelar la eliminación
   */
  const cancelDeleteAddress = () => {
    setShowConfirmModal(false);
    setAddressToDelete(null);
    setIsProcessing(false);
  };

  /**
   * Elimina una dirección después de la confirmación
   *
   * @returns {Promise<{ok: boolean, error: string}>}
   */
  const deleteAddress = async () => {
    if (!addressToDelete) return;

    // Evitar operaciones duplicadas
    if (operationInProgressRef.current) return;
    operationInProgressRef.current = true;

    setIsProcessing(true);

    try {
      const result = await deleteAddressService(addressToDelete.id);

      if (result.ok) {
        // Eliminar la dirección del estado local
        setAddresses(prev => prev.filter(address => address.id !== addressToDelete.id));

        dispatch(addMessage({
          type: 'success',
          text: 'Dirección eliminada correctamente'
        }));

        // Cerrar el modal
        setShowConfirmModal(false);
        setAddressToDelete(null);
      } else {
        setError(result.error || 'Error al eliminar la dirección');
        dispatch(addMessage({
          type: 'error',
          text: result.error || 'Error al eliminar la dirección'
        }));
      }

      return result;
    } catch (err) {
      console.error('Error eliminando dirección:', err);
      const errorMsg = 'Error al eliminar la dirección';
      setError(errorMsg);
      dispatch(addMessage({
        type: 'error',
        text: errorMsg
      }));
      return { ok: false, error: errorMsg };
    } finally {
      setIsProcessing(false);
      operationInProgressRef.current = false;
      setLoading(false);
    }
  };

  /**
   * Establece una dirección como predeterminada
   *
   * @param {string} addressId - ID de la dirección a establecer como predeterminada
   * @returns {Promise<{ok: boolean, error: string}>}
   */
  const setDefaultAddress = async (addressId) => {
    try {
      setLoading(true);

      const result = await setDefaultAddressService(uid, addressId);

      if (result.ok) {
        // Actualizar el estado local
        setAddresses(prev =>
          prev.map(address => ({
            ...address,
            isDefault: address.id === addressId
          }))
        );

        dispatch(addMessage({
          type: 'success',
          text: 'Dirección predeterminada actualizada'
        }));
      } else {
        setError(result.error || 'Error al establecer dirección predeterminada');
        dispatch(addMessage({
          type: 'error',
          text: result.error || 'Error al establecer dirección predeterminada'
        }));
      }

      return result;
    } catch (err) {
      console.error('Error estableciendo dirección predeterminada:', err);
      const errorMsg = 'Error al establecer dirección predeterminada';
      setError(errorMsg);
      dispatch(addMessage({
        type: 'error',
        text: errorMsg
      }));
      return { ok: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Retornar los estados y funciones necesarios
  return {
    addresses,
    loading,
    error,
    submitting,
    selectedAddress,
    showForm,
    showConfirmModal,
    addressToDelete,
    isProcessing,
    loadAddresses,
    saveAddress,
    deleteAddress,
    confirmDeleteAddress,
    cancelDeleteAddress,
    setDefaultAddress,
    openAddForm,
    openEditForm,
    closeForm
  };
};