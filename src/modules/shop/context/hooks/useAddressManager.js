import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserAddresses } from '../../../user/services/addressService.js'

/**
 * Hook personalizado para gestionar las direcciones en el checkout
 *
 * Centraliza toda la lógica relacionada con:
 * - Carga de direcciones del usuario
 * - Selección de dirección existente o nueva
 * - Manejo del formulario de nueva dirección
 *
 * @param {string} userId - ID del usuario autenticado
 * @returns {Object} Estado y métodos para gestión de direcciones
 */
export const useAddressManager = (userId) => {
  // Estados para dirección
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState('');
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

  // Referencia para evitar múltiples llamadas durante el montaje
  const initialLoadComplete = useRef(false);

  // Cargar direcciones cuando tenemos un userId
  useEffect(() => {
    const loadAddresses = async () => {
      // Si no hay userId o ya cargamos, no hacer nada
      if (!userId || initialLoadComplete.current) return;

      setLoadingAddresses(true);
      try {
        const result = await getUserAddresses(userId);

        if (result.ok) {
          const addressData = result.data || [];
          setAddresses(addressData);

          // Seleccionar dirección por defecto
          if (addressData.length > 0 && !selectedAddressId) {
            const defaultAddress = addressData.find(addr => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setSelectedAddressType('saved');
            } else {
              setSelectedAddressId(addressData[0].id);
              setSelectedAddressType('saved');
            }
          }

          initialLoadComplete.current = true;
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
  }, [userId, selectedAddressId]);

  // Manejador para cambio de dirección
  const handleAddressChange = useCallback((addressId, addressType = 'saved') => {
    setSelectedAddressId(addressId);
    setSelectedAddressType(addressType);
  }, []);

  // Manejador para seleccionar dirección nueva
  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null);
    setSelectedAddressType('new');
  }, []);

  // Manejador para actualizar datos de dirección nueva
  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({ ...prev, ...data }));
  }, []);

  // Obtener la dirección seleccionada del array de direcciones
  const selectedAddress = selectedAddressType === 'saved'
    ? addresses.find(addr => addr.id === selectedAddressId)
    : null;

  return {
    // Estado
    addresses,
    selectedAddressId,
    selectedAddressType,
    selectedAddress,
    loadingAddresses,
    newAddressData,

    // Métodos
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange
  };
};