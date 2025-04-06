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
  const [selectedAddressType, setSelectedAddressType] = useState('new');
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

  // Cargar direcciones al montar o cambiar userId
  useEffect(() => {
    loadUserAddresses();
  }, [userId]);

  // Función para cargar direcciones del usuario
  const loadUserAddresses = useCallback(async () => {
    if (!userId) {
      setLoadingAddresses(false);
      return;
    }

    setLoadingAddresses(true);

    try {
      const result = await getUserAddresses(userId);
      if (result.ok) {
        const userAddresses = result.data || [];
        setAddresses(userAddresses);
        
        // Si hay direcciones, seleccionar la predeterminada o la primera
        if (userAddresses.length > 0) {
          const defaultAddress = userAddresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setSelectedAddressType('saved');
          } else {
            setSelectedAddressId(userAddresses[0].id);
            setSelectedAddressType('saved');
          }
        } else {
          // Para usuarios nuevos sin direcciones, configurar como "nueva dirección"
          setSelectedAddressType('new');
          setSelectedAddressId(null);
        }

        initialLoadComplete.current = true;
      } else {
        console.error('Error obteniendo direcciones:', result.error);
        setAddresses([]);
        // En caso de error, también configurar como nueva dirección
        setSelectedAddressType('new');
        setSelectedAddressId(null);
      }
    } catch (error) {
      console.error('Error en loadUserAddresses:', error);
      setAddresses([]);
      // En caso de error, también configurar como nueva dirección
      setSelectedAddressType('new');
      setSelectedAddressId(null);
    } finally {
      setLoadingAddresses(false);
    }
  }, [userId]);

  // Seleccionar una dirección existente
  const handleAddressSelect = useCallback((addressId, type = 'saved') => {
    setSelectedAddressId(addressId);
    setSelectedAddressType(type);
  }, []);

  // Seleccionar nueva dirección (formulario)
  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null);
    setSelectedAddressType('new');
  }, []);

  // Manejar cambios en los datos de la nueva dirección
  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({ ...prev, ...data }));
  }, []);

  // Handler para cuando se agrega una nueva dirección permanente
  const handleAddressAdded = useCallback(() => {
    // Recargar direcciones del usuario
    loadUserAddresses();
  }, [loadUserAddresses]);

  // Estado derivado - Dirección seleccionada actual
  const selectedAddress = selectedAddressType === 'saved' && selectedAddressId
    ? addresses.find(addr => addr.id === selectedAddressId) || null
    : null;

  return {
    // Estados
    addresses,
    selectedAddressId,
    selectedAddressType,
    loadingAddresses,
    newAddressData,
    selectedAddress,

    // Métodos
    loadUserAddresses,
    handleAddressSelect,
    handleNewAddressSelect,
    handleNewAddressDataChange,
    handleAddressAdded
  };
};