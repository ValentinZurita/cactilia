import { useState, useEffect } from 'react';
import { prepareShippingOptionsForCheckout } from '../../../../checkout/services/shippingGroupingService';
import { getUserAddresses } from '../../../../user/services/addressService';

/**
 * Hook personalizado para gestionar las opciones de envío
 * 
 * Proporciona:
 * - Lista de opciones de envío disponibles
 * - Opción seleccionada actual
 * - Funciones para seleccionar opciones
 * - Estado de carga
 * 
 * @param {Array} cartItems - Items del carrito
 * @param {string} selectedAddressId - ID de la dirección seleccionada
 * @returns {Object} Estado y funciones para manejar opciones de envío
 */
export const useShippingOptions = (cartItems, selectedAddressId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shippingGroups, setShippingGroups] = useState([]);
  const [shippingRules, setShippingRules] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  
  // Cargar direcciones del usuario cuando sea necesario
  useEffect(() => {
    const loadUserAddresses = async () => {
      try {
        // Usamos la función global para obtener el ID del usuario
        const userId = window.firebase?.auth()?.currentUser?.uid;
        if (!userId) return;
        
        const { ok, data } = await getUserAddresses(userId);
        if (ok && data) {
          setUserAddresses(data);
        }
      } catch (err) {
        console.error('Error al cargar direcciones:', err);
      }
    };
    
    loadUserAddresses();
  }, []);
  
  // Función para obtener una dirección por su ID
  const getUserAddressById = (addressId) => {
    return userAddresses.find(addr => addr.id === addressId);
  };
  
  // Función para generar opciones directamente desde las reglas de envío
  const generateOptionsFromRules = (groups, rules) => {
    console.log('🔍 Generando opciones directamente desde reglas:', { 
      groups: groups.length, 
      rules: rules.length 
    });
    
    // Guardar las reglas para referencia
    setShippingRules(rules);
    
    // Si no hay grupos o reglas, no podemos generar opciones
    if (!groups.length || !rules.length) {
      console.warn('❌ No hay grupos o reglas para generar opciones');
      return [];
    }
    
    const generatedOptions = [];
    
    // Para cada grupo, crear opciones basadas en sus reglas
    groups.forEach(group => {
      // Si el grupo tiene reglas de envío, usarlas
      if (group.rules && group.rules.length > 0) {
        console.log(`📦 Procesando grupo "${group.name}" con ${group.rules.length} reglas`);
        
        group.rules.forEach(rule => {
          console.log(`🚢 Regla: ${rule.zona} (${rule.id}), opciones de mensajería:`, rule.opciones_mensajeria?.length || 0);
          
          // Si la regla tiene opciones de mensajería
          if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
            rule.opciones_mensajeria.forEach((opcion, index) => {
              const optionId = `${rule.id}-option-${index}`;
              const price = parseFloat(opcion.precio) || 50;
              
              console.log(`🏷️ Creando opción: ${opcion.nombre || 'Sin nombre'}, precio: ${price}`);
              
              // Crear una opción formateada para cada opción de mensajería
              generatedOptions.push({
                id: optionId,
                label: opcion.nombre || 'Envío estándar',
                carrier: rule.zona || 'Servicio de envío',
                totalCost: price,
                calculatedCost: price,
                minDays: 2,
                maxDays: 7,
                details: `Zona: ${rule.zona || 'Nacional'}`,
                groupsData: [{ 
                  groupId: group.id,
                  option: {
                    id: optionId,
                    calculatedCost: price
                  },
                  items: group.items 
                }]
              });
            });
          } else {
            console.warn(`⚠️ La regla ${rule.zona} no tiene opciones de mensajería`);
          }
        });
      } else {
        console.warn(`⚠️ El grupo ${group.name} no tiene reglas de envío`);
      }
    });
    
    console.log(`✅ Opciones generadas manualmente: ${generatedOptions.length}`, generatedOptions);
    return generatedOptions;
  };
  
  // Cargar opciones de envío cuando cambia el carrito o la dirección
  useEffect(() => {
    const fetchShippingOptions = async () => {
      // Si no hay productos o no hay dirección seleccionada, no calculamos
      if (!cartItems || cartItems.length === 0 || !selectedAddressId) {
        setLoading(false);
        setOptions([]);
        setSelectedOption(null);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Obtener la dirección completa
        const userAddress = getUserAddressById(selectedAddressId);
        
        if (!userAddress) {
          setError('No se encontró la dirección seleccionada');
          setLoading(false);
          return;
        }
        
        console.log('🔄 Obteniendo opciones de envío para:', {
          productos: cartItems.length,
          direccion: {
            id: selectedAddressId,
            cp: userAddress.zipCode || userAddress.postalCode
          }
        });
        
        // Calcular opciones de envío
        const result = await prepareShippingOptionsForCheckout(cartItems, userAddress);
        console.log('📊 Resultado de prepareShippingOptionsForCheckout:', {
          grupos: result.groups?.length || 0,
          reglas: result.groups?.reduce((count, g) => count + (g.rules?.length || 0), 0) || 0,
          opciones: result.totalOptions?.length || 0
        });
        
        // DIAGNÓSTICO: Imprimir resultado completo para inspección
        console.log('🚨 RESULTADO COMPLETO DE SHIPPING OPTIONS:', JSON.stringify(result, null, 2));
        
        // Guardar grupos 
        setShippingGroups(result.groups || []);
        
        // Extraer todas las reglas de los grupos
        const allRules = [];
        if (result.groups && result.groups.length > 0) {
          result.groups.forEach(group => {
            if (group.rules && Array.isArray(group.rules)) {
              group.rules.forEach(rule => {
                if (!allRules.some(r => r.id === rule.id)) {
                  allRules.push(rule);
                }
              });
            }
          });
        }
        
        // Guardar reglas para referencia
        setShippingRules(allRules);
        console.log(`📏 Reglas encontradas: ${allRules.length}`);
        
        // Verificar si tenemos opciones de envío totales
        let formattedOptions = [];
        if (result.totalOptions && result.totalOptions.length > 0) {
          // Transformar opciones para el selector
          formattedOptions = result.totalOptions.map(option => ({
            id: option.id,
            label: option.label,
            carrier: option.carrier,
            totalCost: option.totalCost,
            calculatedCost: option.totalCost, // Para compatibilidad
            minDays: 3, // Valores predeterminados, actualizar cuando tengamos datos reales
            maxDays: 5,
            details: option.groups?.length > 1 
              ? `Envío combinado para ${option.groups.length} grupos de productos` 
              : undefined,
            // Datos completos para uso interno
            groupsData: option.groups
          }));
          
          console.log(`🚚 Opciones formateadas desde totalOptions: ${formattedOptions.length}`);
        } else {
          console.warn('⚠️ No hay opciones en totalOptions, generando manualmente desde reglas y grupos');
        }
        
        // Si no hay opciones pero sí hay grupos, generar opciones manualmente
        if (formattedOptions.length === 0 && result.groups && result.groups.length > 0) {
          console.warn('⚠️ FORZANDO GENERACIÓN MANUAL DE OPCIONES');
          
          // CREAR OPCIONES DIRECTAMENTE DE LOS GRUPOS DE ENVÍO
          const manualOptions = [];
          
          result.groups.forEach(group => {
            if (group.rules && group.rules.length > 0) {
              group.rules.forEach(rule => {
                console.log(`📦 Procesando regla: ${rule.id} (${rule.zona || 'Sin nombre'})`);
                console.log('Datos completos de regla:', JSON.stringify(rule, null, 2));
                
                // Si la regla tiene opciones de mensajería definidas
                if (rule.opciones_mensajeria && rule.opciones_mensajeria.length > 0) {
                  console.log(`📬 ${rule.opciones_mensajeria.length} opciones de mensajería encontradas`);
                  
                  rule.opciones_mensajeria.forEach((opcion, index) => {
                    const optionId = `manual-${rule.id}-option-${index}`;
                    const precio = parseFloat(opcion.precio) || 150;
                    
                    console.log(`🏷️ Creando opción: ${opcion.nombre || 'Sin nombre'}, precio: ${precio}`);
                    
                    manualOptions.push({
                      id: optionId,
                      label: opcion.nombre || `Envío ${rule.zona || 'Estándar'}`,
                      carrier: rule.zona || 'Servicio de envío',
                      totalCost: precio,
                      calculatedCost: precio,
                      minDays: parseInt(opcion.tiempo_entrega?.split('-')[0] || 3, 10),
                      maxDays: parseInt(opcion.tiempo_entrega?.split('-')[1] || 5, 10),
                      details: `Zona: ${rule.zona || 'Nacional'}`,
                      groupsData: [{
                        groupId: group.id,
                        option: {
                          id: optionId,
                          calculatedCost: precio,
                          label: opcion.nombre || `Envío ${rule.zona || 'Estándar'}`
                        },
                        items: group.items
                      }]
                    });
                  });
                } else {
                  // Si no hay opciones de mensajería, crear una opción por defecto
                  console.warn(`⚠️ La regla ${rule.id} no tiene opciones de mensajería, creando opción por defecto`);
                  
                  const optionId = `default-${rule.id}`;
                  manualOptions.push({
                    id: optionId,
                    label: `Envío ${rule.zona || 'Estándar'}`,
                    carrier: 'Nacional',
                    totalCost: 200,
                    calculatedCost: 200,
                    minDays: 3,
                    maxDays: 5,
                    details: 'Opción generada automáticamente',
                    groupsData: [{
                      groupId: group.id,
                      option: {
                        id: optionId,
                        calculatedCost: 200,
                        label: `Envío ${rule.zona || 'Estándar'}`
                      },
                      items: group.items
                    }]
                  });
                }
              });
            } else {
              // Si el grupo no tiene reglas, crear una opción por defecto
              console.warn(`⚠️ El grupo ${group.id} no tiene reglas de envío, creando opción por defecto`);
              
              const optionId = `default-group-${group.id}`;
              manualOptions.push({
                id: optionId,
                label: 'Envío Estándar',
                carrier: 'Nacional',
                totalCost: 150,
                calculatedCost: 150,
                minDays: 3,
                maxDays: 5,
                details: 'Opción por defecto',
                groupsData: [{
                  groupId: group.id,
                  option: {
                    id: optionId,
                    calculatedCost: 150,
                    label: 'Envío Estándar'
                  },
                  items: group.items
                }]
              });
            }
          });
          
          console.log(`🚚 Opciones generadas manualmente: ${manualOptions.length}`);
          formattedOptions = manualOptions;
        }
        
        console.log(`🚢 Opciones finales: ${formattedOptions.length}`);
        
        // ASEGURAR QUE SIEMPRE HAYA AL MENOS UNA OPCIÓN DE ENVÍO
        if (formattedOptions.length === 0) {
          console.warn('⚠️ No se pudieron generar opciones, añadiendo opción por defecto forzada');
          
          formattedOptions = [{
            id: 'default-fallback',
            label: 'Envío Estándar',
            carrier: 'Nacional',
            totalCost: 200,
            calculatedCost: 200,
            minDays: 3,
            maxDays: 5,
            details: 'Opción por defecto (generada como fallback)'
          }];
        }
        
        // Actualizar estado con las opciones
        setOptions(formattedOptions);
        
        // Seleccionar automáticamente la opción más económica
        if (formattedOptions.length > 0 && !selectedOption) {
          // Ordenar por precio y seleccionar la más barata
          const sortedOptions = [...formattedOptions].sort((a, b) => a.totalCost - b.totalCost);
          console.log(`✅ Seleccionando opción más económica: ${sortedOptions[0].label} ($${sortedOptions[0].totalCost})`);
          setSelectedOption(sortedOptions[0]);
        } else if (formattedOptions.length > 0 && selectedOption) {
          // Mantener la selección actual si sigue disponible
          const currentOption = formattedOptions.find(opt => opt.id === selectedOption.id);
          setSelectedOption(currentOption || formattedOptions[0]);
        } else {
          setSelectedOption(null);
        }
      } catch (err) {
        console.error('❌ Error al cargar opciones de envío:', err);
        console.error('Detalles del error:', err.stack || err);
        setError('No se pudieron cargar las opciones de envío');
        
        // En caso de error, crear una opción por defecto
        const fallbackOptions = [{
          id: 'error-fallback',
          label: 'Envío Estándar',
          carrier: 'Nacional',
          totalCost: 200,
          calculatedCost: 200,
          minDays: 3,
          maxDays: 5,
          details: 'Opción generada por error en cálculo'
        }];
        
        setOptions(fallbackOptions);
        setSelectedOption(fallbackOptions[0]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchShippingOptions();
  }, [cartItems, selectedAddressId, userAddresses, selectedOption]);
  
  // Función para seleccionar una opción de envío
  const selectShippingOption = (option) => {
    setSelectedOption(option);
  };
  
  return {
    loading,
    error,
    options,
    selectedOption,
    selectShippingOption,
    shippingGroups,
    shippingRules
  };
}; 