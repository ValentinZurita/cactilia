import { useState, useEffect, useCallback } from 'react';
import { getUserAddresses } from '../../../../user/services/addressService';

/**
 * Hook para manejar el formulario de direcciones
 * @param {string} uid - ID del usuario
 * @returns {Object} Estado y funciones para el manejo de direcciones
 */
export const useAddressForm = (uid) => {
  // Estados para dirección
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
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

  // Cargar direcciones
  useEffect(() => {
    const loadAddresses = async () => {
      if (!uid) return;

      setLoadingAddresses(true);

      try {
        const result = await getUserAddresses(uid);

        if (result.ok) {
          setAddresses(result.data || []);

          // Seleccionar dirección por defecto
          if (result.data && result.data.length > 0 && !selectedAddressId) {
            const defaultAddress = result.data.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setSelectedAddressType('saved');
            } else {
              setSelectedAddressId(result.data[0].id);
              setSelectedAddressType('saved');
            }
          }
        } else {
          console.error('Error cargando direcciones:', result.error);
          setAddresses([]);
        }
      } catch (error) {
        console.error('Error en loadAddresses:', error);
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, [uid, selectedAddressId]);

  // Handler para cambio de dirección
  const handleAddressChange = useCallback((addressId, addressType = 'saved') => {
    setSelectedAddressId(addressId);
    setSelectedAddressType(addressType);
  }, []);

  // Handler para seleccionar nueva dirección
  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null);
    setSelectedAddressType('new');
  }, []);

  // Handler para cambios en datos de nueva dirección
  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({ ...prev, ...data }));
  }, []);

  // Obtener dirección seleccionada
  const selectedAddress = selectedAddressType === 'saved'
    ? addresses.find(addr => addr.id === selectedAddressId)
    : null;

  return {
    // Estados
    selectedAddressId,
    selectedAddressType,
    selectedAddress,
    addresses,
    loadingAddresses,
    newAddressData,

    // Handlers
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange,

    // Funciones
    reloadAddresses: () => loadAddresses(),

    // Reset
    resetAddressForm: () => {
      setSelectedAddressId(null);
      setSelectedAddressType('');
      setNewAddressData({
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
    }
  };
};