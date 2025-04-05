import { useState, useEffect } from 'react';
import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi';
import { groupProductsIntoPackages, calculateTotalShippingCost } from '../../../../checkout/utils/shippingCalculator';

/**
 * Hook para gestionar las opciones de envío en el checkout
 * Obtiene las reglas de envío desde Firestore y calcula las opciones disponibles
 */
export const useShippingOptions = (cartItems, selectedAddressId) => {
  const [loading, setLoading] = useState(true);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  
  // Obtener dirección del usuario cuando cambia el ID seleccionado
  useEffect(() => {
    const getUserAddress = async () => {
      if (!selectedAddressId) {
        setUserAddress(null);
        return;
      }
      
      // Aquí normalmente obtendríamos la dirección de Firestore
      // Pero para simplificar, asumimos que ya tenemos la dirección en el componente padre
      // y que selectedAddressId es en realidad el objeto dirección completo
      setUserAddress(selectedAddressId);
    };
    
    getUserAddress();
  }, [selectedAddressId]);
  
  // Calcular opciones de envío cuando cambian los items o la dirección
  useEffect(() => {
    const calculateShippingOptions = async () => {
      console.log('🚚 Calculando opciones de envío reales...');
      setLoading(true);
      setError(null);
      
      // Validar que tengamos items y dirección
      if (!cartItems || cartItems.length === 0) {
        setOptions([]);
        setLoading(false);
        return;
      }
      
      if (!userAddress || !userAddress.zipCode) {
        setError('Se requiere una dirección para calcular el envío');
        setOptions([]);
        setLoading(false);
        return;
      }
      
      try {
        // 1. Agrupar productos por regla de envío
        const shippingGroups = [];
        const processedRules = new Map(); // Map para evitar duplicados
        
        // Recorrer cada item y procesarlo
        for (const item of cartItems) {
          const product = item.product || item;
          
          // Obtener reglas de envío (múltiples o única)
          const ruleIds = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) 
            ? product.shippingRuleIds 
            : (product.shippingRuleId ? [product.shippingRuleId] : []);
          
          if (ruleIds.length === 0) {
            console.warn(`Producto ${product.name || product.id} no tiene reglas de envío`);
            continue;
          }
          
          // Procesar solo la primera regla (simplificado)
          const ruleId = ruleIds[0];
          
          // Si ya procesamos esta regla, añadir el producto al grupo existente
          if (processedRules.has(ruleId)) {
            const groupIndex = processedRules.get(ruleId);
            shippingGroups[groupIndex].items.push(item);
            continue;
          }
          
          // Obtener regla desde Firestore
          console.log(`Obteniendo regla ${ruleId} desde Firestore`);
          let ruleData;
          
          try {
            ruleData = await fetchShippingRuleById(ruleId);
            
            if (!ruleData) {
              console.error(`Regla de envío ${ruleId} no encontrada`);
              continue;
            }
          } catch (err) {
            console.error(`Error al obtener regla ${ruleId}:`, err);
            continue;
          }
          
          // Crear nuevo grupo con esta regla
          const groupIndex = shippingGroups.length;
          shippingGroups.push({
            id: `group-${ruleId}`,
            rule: ruleData,
            items: [item]
          });
          
          // Marcar esta regla como procesada
          processedRules.set(ruleId, groupIndex);
        }
        
        // Si no hay grupos válidos, no hay opciones de envío
        if (shippingGroups.length === 0) {
          console.warn('No se encontraron reglas de envío válidas para ningún producto');
          setError('Los productos en tu carrito no tienen opciones de envío disponibles');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        // 2. Para cada grupo, calcular opciones de envío
        const allOptions = [];
        
        for (const group of shippingGroups) {
          // Calcular peso y cantidad total del grupo
          let totalWeight = 0;
          let totalQuantity = 0;
          
          for (const item of group.items) {
            const product = item.product || item;
            const weight = parseFloat(product.weight || 1);
            const quantity = parseInt(item.quantity || 1);
            
            totalWeight += weight * quantity;
            totalQuantity += quantity;
          }
          
          group.totalWeight = totalWeight;
          group.totalQuantity = totalQuantity;
          
          // Procesar cada método de envío de la regla
          if (group.rule.opciones_mensajeria && Array.isArray(group.rule.opciones_mensajeria)) {
            for (const method of group.rule.opciones_mensajeria) {
              // Extraer datos del método
              const methodId = `${group.rule.id}-${method.nombre?.replace(/\s+/g, '-')?.toLowerCase() || 'method'}`;
              const methodPrice = parseFloat(method.precio || 0);
              
              // Extraer configuración de paquetes
              const configPaquetes = method.configuracion_paquetes || {};
              const maxWeight = parseFloat(configPaquetes.peso_maximo_paquete || 20);
              const extraWeightCost = parseFloat(configPaquetes.costo_por_kg_extra || 10);
              const maxItems = parseInt(configPaquetes.maximo_productos_por_paquete || 10);
              
              // Configurar opción de envío
              const shippingOption = {
                id: methodId,
                ruleId: group.rule.id,
                ruleName: group.rule.zona || 'Envío',
                carrier: method.nombre || 'Servicio',
                label: method.label || method.nombre || 'Envío',
                price: methodPrice,
                tiempo_entrega: method.tiempo_entrega || '3-5 días',
                minDays: parseInt(method.minDays || 3),
                maxDays: parseInt(method.maxDays || 5),
                maxPackageWeight: maxWeight,
                extraWeightCost: extraWeightCost,
                maxProductsPerPackage: maxItems
              };
              
              // Calcular paquetes necesarios
              const packages = groupProductsIntoPackages(group.items, shippingOption);
              
              // Calcular costo total
              const totalCost = calculateTotalShippingCost(packages, shippingOption);
              
              // Verificar envío gratuito (si aplica)
              const subtotal = group.items.reduce((sum, item) => {
                const price = parseFloat((item.product || item).price || 0);
                const quantity = parseInt(item.quantity || 1);
                return sum + (price * quantity);
              }, 0);
              
              const isFreeShipping = 
                group.rule.envio_gratis || 
                (group.rule.envio_gratis_monto_minimo && subtotal >= parseFloat(group.rule.envio_gratis_monto_minimo));
              
              // Añadir opción a la lista
              allOptions.push({
                ...shippingOption,
                calculatedCost: isFreeShipping ? 0 : totalCost,
                totalCost: isFreeShipping ? 0 : totalCost,
                packages,
                isFreeShipping,
                details: `${method.tiempo_entrega || '3-5 días'} (${isFreeShipping ? 'Gratis' : `$${totalCost.toFixed(2)}`})`,
                groupInfo: {
                  id: group.id,
                  items: group.items,
                  totalWeight,
                  totalQuantity
                }
              });
            }
          }
        }
        
        // Si no hay opciones disponibles después de todo el proceso
        if (allOptions.length === 0) {
          setError('No hay opciones de envío disponibles para tu dirección');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        // Ordenar opciones por precio (más barata primero)
        const sortedOptions = allOptions.sort((a, b) => {
          // Primero ordenar por envío gratuito
          if (a.isFreeShipping && !b.isFreeShipping) return -1;
          if (!a.isFreeShipping && b.isFreeShipping) return 1;
          
          // Luego por precio
          return a.totalCost - b.totalCost;
        });
        
        console.log('🚚 Opciones calculadas:', sortedOptions);
        setOptions(sortedOptions);
        
        // Si hay una opción seleccionada y ya no está disponible, deseleccionarla
        if (selectedOption && !sortedOptions.some(opt => opt.id === selectedOption.id)) {
          setSelectedOption(null);
        }
      } catch (err) {
        console.error('Error al calcular opciones de envío:', err);
        setError('Error al calcular opciones de envío');
      } finally {
        setLoading(false);
      }
    };
    
    calculateShippingOptions();
  }, [cartItems, userAddress]);
  
  // Función para seleccionar una opción
  const selectShippingOption = (option) => {
    console.log('🚚 Seleccionando opción de envío:', option);
    setSelectedOption(option);
  };
  
  return {
    loading,
    error,
    options,
    selectedOption,
    selectShippingOption
  };
}; 