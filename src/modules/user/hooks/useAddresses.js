import { useState } from 'react'

/**
 * Hook personalizado para manejar la lógica de direcciones
 *
 * @returns {Object} - Métodos y estado para manejar direcciones
 */
export const useAddresses = () => {

  // Datos de ejemplo - en una implementación real vendrían de Firebase
  const [addresses, setAddresses] = useState([
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
  ]);

  /**
   * Establece una dirección como predeterminada
   * @param {string} id - ID de la dirección
   */
  const setDefaultAddress = (id) => {
    // Actualizar direcciones, estableciendo solo una como predeterminada
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  /**
   * Elimina una dirección
   * @param {string} id - ID de la dirección
   */
  const deleteAddress = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta dirección?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  /**
   * Edita una dirección existente
   * @param {Object} address - Dirección a editar
   */
  const editAddress = (address) => {
    //TODO aqui iría la lógica para mostrar un modal o formulario de edición
    console.log('Editando dirección:', address);
  };

  /**
   * Añade una nueva dirección
   */
  const addAddress = () => {
    // TODO aquí iría la lógica para mostrar un modal o formulario de nueva dirección
    console.log('Añadiendo nueva dirección');
  };

  return {
    addresses,
    setDefaultAddress,
    deleteAddress,
    editAddress,
    addAddress
  };
};