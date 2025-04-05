import { useState, useEffect } from 'react';

/**
 * Hook ultra simplificado para gestionar las opciones de envío
 * Versión simplificada que siempre muestra opciones fijas
 */
export const useShippingOptions = (cartItems, selectedAddressId) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  
  // Cargar opciones de envío fijas
  useEffect(() => {
    // Simular carga
    setLoading(true);
    
    setTimeout(() => {
      // Opciones fijas de envío
      const fixedOptions = [
        {
          id: 'opcion-economica',
          ruleId: 'nacional',
          ruleName: 'Nacional',
          carrier: 'Correos de México',
          label: 'Correos de México - Económico',
          price: 200,
          calculatedCost: 200,
          totalCost: 200,
          tiempo_entrega: '5-15 días',
          minDays: 5,
          maxDays: 15,
          details: 'Entrega en 5-15 días hábiles'
        },
        {
          id: 'opcion-rapida',
          ruleId: 'nacional',
          ruleName: 'Nacional',
          carrier: 'Correos de México',
          label: 'Correos de México - Rápido',
          price: 300,
          calculatedCost: 300,
          totalCost: 300,
          tiempo_entrega: '1-10 días',
          minDays: 1,
          maxDays: 10,
          details: 'Entrega en 1-10 días hábiles'
        }
      ];
      
      console.log('✅ OPCIONES FIJAS CARGADAS:', fixedOptions);
      
      // Establecer opciones
      setOptions(fixedOptions);
      
      // Seleccionar la más barata por defecto
      setSelectedOption(fixedOptions[0]);
      
      setLoading(false);
    }, 300);
  }, [selectedAddressId]); // Solo re-ejecutar cuando cambia la dirección
  
  // Función para seleccionar una opción
  const selectShippingOption = (option) => {
    console.log('✅ SELECCIONANDO OPCIÓN:', option);
    setSelectedOption(option);
  };
  
  return {
    loading,
    error: null,
    options,
    selectedOption,
    selectShippingOption
  };
}; 