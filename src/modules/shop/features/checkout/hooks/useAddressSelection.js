import { useState, useEffect, useCallback } from 'react';
import { addMessage } from '../../../../../store/messages/messageSlice.js';

/**
 * Hook para manejar la selección de direcciones en el checkout
 *
 * @param {string} uid - ID del usuario
 * @param {Function} dispatch - Función dispatch de Redux
 * @returns {Object} Estados y funciones para manejo de direcciones
 */
export const useAddressSelection = (uid, dispatch) => {
  // Estados relacionados con direcciones
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    street: '',
    numExt: '',
    numInt: '',
    colonia: '',
    city: '',
    state: '',
    zip: '',
    references: '',
    saveAddress: false
  });

  // Cargar direcciones al iniciar
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (!uid) return;

      setLoading(true);
      try {
        // Importación dinámica del servicio de direcciones
        const { getUserAddresses } = await import('../../../../user/services/addressService.js');
        const result = await getUserAddresses(uid);

        if (result.ok) {
          setAddresses(result.data);

          // Si no hay dirección seleccionada pero hay direcciones disponibles,
          // seleccionar la dirección predeterminada o la primera
          if (!selectedAddressId && !selectedAddressType && result.data.length > 0) {
            const defaultAddress = result.data.find(address => address.isDefault);

            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setSelectedAddress(defaultAddress);
              setSelectedAddressType('saved');
              setUseNewAddress(false);
            } else if (result.data.length > 0) {
              setSelectedAddressId(result.data[0].id);
              setSelectedAddress(result.data[0]);
              setSelectedAddressType('saved');
              setUseNewAddress(false);
            }
          }
        } else {
          console.error('Error loading addresses:', result.error);
          dispatch(
            addMessage({
              type: 'error',
              text: 'No se pudieron cargar tus direcciones'
            })
          );
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserAddresses();
  }, [uid, dispatch]);

  // Helper: Actualizar la dirección seleccionada
  const updateSelectedAddress = useCallback((addressesList, addressId) => {
    if (!addressesList || !addressId) return;

    const address = addressesList.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
    }
  }, []);

  // Manejador para cambio de dirección guardada
  const handleAddressChange = useCallback((addressId, addressType = 'saved') => {
    setSelectedAddressId(addressId);
    setSelectedAddressType(addressType);

    if (addressType === 'saved') {
      updateSelectedAddress(addresses, addressId);
      setUseNewAddress(false);
    }
  }, [updateSelectedAddress, addresses]);

  // Manejador para seleccionar dirección nueva
  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null);
    setSelectedAddress(null);
    setSelectedAddressType('new');
    setUseNewAddress(true);
  }, []);

  // Manejador para cambios en datos de dirección nueva
  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  return {
    selectedAddressId,
    selectedAddressType,
    selectedAddress,
    addresses,
    loading,
    useNewAddress,
    newAddressData,
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange,
    updateSelectedAddress
  };
};