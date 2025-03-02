import { useCallback } from 'react';
import { useItemsCollection } from './useItemsCollection';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../../store/messages/messageSlice';

/**
 * Hook refactorizado para manejar direcciones utilizando el hook genérico
 *
 * @returns {Object} - Métodos y estado para manejar direcciones
 */
export const useAddresses = () => {
  // Usar Redux para enviar mensajes globales (reemplazando useMessages)
  const dispatch = useDispatch();

  // Validación específica para direcciones
  const validateAddress = useCallback((address) => {
    if (!address.name || !address.street || !address.city || !address.state || !address.zip) {
      return {
        valid: false,
        error: 'Todos los campos son obligatorios'
      };
    }
    return { valid: true };
  }, []);

  // Datos iniciales (en una implementación real vendrían de Firebase)
  const initialAddresses = [
    {
      id: '1',
      name: 'Casa',
      street: 'Av. Siempre Viva 742',
      city: 'CDMX',
      state: 'CDMX',
      zip: '01234',
      isDefault: true
    },
    {
      id: '2',
      name: 'Oficina',
      street: 'Av. Reforma 222, Piso 3',
      city: 'CDMX',
      state: 'CDMX',
      zip: '06600',
      isDefault: false
    }
  ];

  // Usar el hook genérico con la configuración para direcciones
  const addressCollection = useItemsCollection({
    initialItems: initialAddresses,
    itemType: 'dirección',
    validateItem: validateAddress
  });

  // Métodos específicos o personalizados para direcciones
  const setDefaultAddress = useCallback((addressId) => {
    const result = addressCollection.setDefaultItem(addressId);
    if (result) {
      dispatch(addMessage({
        type: 'success',
        text: 'Dirección establecida como predeterminada'
      }));
    }
    return result;
  }, [addressCollection.setDefaultItem, dispatch]);

  const deleteAddress = useCallback((addressId) => {
    const result = addressCollection.deleteItem(addressId);
    if (result) {
      dispatch(addMessage({
        type: 'success',
        text: 'Dirección eliminada correctamente'
      }));
    }
    return result;
  }, [addressCollection.deleteItem, dispatch]);

  const editAddress = useCallback((address) => {
    // En una implementación real, aquí se mostraría un modal o se navegaría a un formulario
    console.log('Editando dirección:', address);

    // Simulación de edición
    setTimeout(() => {
      dispatch(addMessage({
        type: 'info',
        text: 'Funcionalidad de edición en desarrollo'
      }));
    }, 500);
  }, [dispatch]);

  const addAddress = useCallback(() => {
    // En una implementación real, aquí se mostraría un modal o se navegaría a un formulario
    console.log('Añadiendo nueva dirección');

    // Simulación de adición
    setTimeout(() => {
      dispatch(addMessage({
        type: 'info',
        text: 'Funcionalidad de añadir dirección en desarrollo'
      }));
    }, 500);
  }, [dispatch]);

  // Retornar la combinación del hook genérico con funcionalidades específicas
  return {
    addresses: addressCollection.items,
    loading: addressCollection.loading,
    error: addressCollection.error,
    setDefaultAddress,
    deleteAddress,
    editAddress,
    addAddress
  };
};