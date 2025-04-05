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
  // Añadir estados para grupos y reglas de envío
  const [shippingGroups, setShippingGroups] = useState([]);
  const [shippingRules, setShippingRules] = useState([]);
  // Estado para productos excluidos (sin reglas de envío)
  const [excludedProducts, setExcludedProducts] = useState([]);
  
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

      // Debuggear qué estamos recibiendo como dirección
      console.log('🏠 Dirección seleccionada:', selectedAddressId);
      
      // Al cambiar la dirección, reiniciamos la opción seleccionada
      // para forzar una nueva evaluación basada en la nueva dirección
      setSelectedOption(null);
    };
    
    getUserAddress();
  }, [selectedAddressId]);
  
  // Calcular opciones de envío cuando cambian los items o la dirección
  useEffect(() => {
    const calculateShippingOptions = async () => {
      console.log('🚚 Calculando opciones de envío...');
      setLoading(true);
      setError(null);
      
      // Validar que tengamos items
      if (!cartItems || cartItems.length === 0) {
        setOptions([]);
        setShippingGroups([]);
        setShippingRules([]);
        setExcludedProducts([]);
        setLoading(false);
        return;
      }
      
      try {
        // 1. Agrupar productos por regla de envío (esto se hace siempre, incluso sin dirección)
        const shippingGroups = [];
        const processedRules = new Map(); // Map para evitar duplicados
        const allRules = []; // Para almacenar todas las reglas de envío
        const excluded = []; // Para almacenar productos sin reglas de envío
        
        // Recorrer cada item y procesarlo
        for (const item of cartItems) {
          const product = item.product || item;
          
          // Obtener reglas de envío (múltiples o única)
          const ruleIds = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) 
            ? product.shippingRuleIds 
            : (product.shippingRuleId ? [product.shippingRuleId] : []);
          
          if (ruleIds.length === 0) {
            console.warn(`Producto ${product.name || product.id} no tiene reglas de envío`);
            excluded.push({...product, quantity: item.quantity});
            continue;
          }
          
          // Procesar todas las reglas disponibles
          for (const ruleId of ruleIds) {
            // Si ya procesamos esta regla, añadir el producto al grupo existente y continuar
            if (processedRules.has(ruleId)) {
              const groupIndex = processedRules.get(ruleId);
              
              // Verificar si este producto ya está en el grupo para evitar duplicaciones
              const productAlreadyInGroup = shippingGroups[groupIndex].items.some(
                groupItem => (groupItem.id === item.id || (groupItem.product && groupItem.product.id === product.id))
              );
              
              if (!productAlreadyInGroup) {
                shippingGroups[groupIndex].items.push(item);
              }
              continue;
            }
            
            // Obtener regla desde Firestore
            let ruleData;
            
            try {
              ruleData = await fetchShippingRuleById(ruleId);
              
              if (!ruleData) {
                console.error(`Regla de envío ${ruleId} no encontrada`);
                continue;
              }
              
              // Almacenar la regla en el array de todas las reglas si no existe ya
              if (!allRules.some(rule => rule.id === ruleId)) {
                allRules.push({
                  id: ruleId,
                  ...ruleData
                });
              }
            } catch (err) {
              console.error(`Error al obtener regla ${ruleId}:`, err);
              continue;
            }
            
            // Crear nuevo grupo con esta regla
            const groupIndex = shippingGroups.length;
            shippingGroups.push({
              id: `group-${ruleId}`,
              name: ruleData.zona || 'Grupo de envío',
              rule: ruleData,
              rules: [ruleData],
              items: [item]
            });
            
            // Marcar esta regla como procesada
            processedRules.set(ruleId, groupIndex);
          }
          
          // Si después de procesar todas las reglas, el producto no está en ningún grupo, considerarlo excluido
          if (!shippingGroups.some(group => 
            group.items.some(groupItem => 
              groupItem.id === item.id || (groupItem.product && groupItem.product.id === product.id)
            )
          )) {
            excluded.push({...product, quantity: item.quantity});
          }
        }
        
        // Actualizar el estado de productos excluidos
        setExcludedProducts(excluded);
        
        // Actualizar el estado de los grupos y reglas (esto se hace siempre)
        console.log(`✅ Grupos de envío: ${shippingGroups.length}, Reglas: ${allRules.length}`);
        setShippingGroups(shippingGroups);
        setShippingRules(allRules);
        
        // Si no hay grupos válidos, no hay opciones de envío
        if (shippingGroups.length === 0) {
          console.warn('No se encontraron reglas de envío válidas para ningún producto');
          setError('Los productos en tu carrito no tienen opciones de envío disponibles');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        // Verificar si hay dirección para calcular opciones de envío concretas
        // Aceptar tanto zipCode como zip
        const hasValidPostalCode = userAddress && (userAddress.zipCode || userAddress.zip);
        
        if (!userAddress) {
          console.warn('⚠️ No hay dirección seleccionada para calcular opciones de envío');
          setError('Se requiere una dirección para calcular el envío');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        if (!hasValidPostalCode) {
          console.warn('⚠️ Dirección sin código postal válido');
          setError('Se requiere un código postal válido para calcular el envío');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        // Obtener los datos necesarios de la dirección
        const postalCode = userAddress.zipCode || userAddress.zip;
        const state = userAddress.state || userAddress.estado;
        const city = userAddress.city || userAddress.ciudad;
        
        console.log(`🏙️ Validando opciones para CP: ${postalCode}, Estado: ${state}, Ciudad: ${city}`);
        
        // Filtrar grupos según la dirección (validar reglas por código postal)
        const validGroups = shippingGroups.filter(group => {
          // Validar si la regla aplica para esta dirección
          const rule = group.rule;
          const zipcodes = rule.zipcodes || [];
          
          // 1. Verificar si hay coincidencia exacta con el CP
          if (zipcodes.includes(postalCode)) {
            console.log(`✅ Regla ${rule.zona} aplica por coincidencia exacta de CP: ${postalCode}`);
            return true;
          }
          
          // 2. Verificar si la regla incluye el estado
          if (state && zipcodes.some(zip => zip.toLowerCase() === state.toLowerCase())) {
            console.log(`✅ Regla ${rule.zona} aplica por coincidencia de estado: ${state}`);
            return true;
          }
          
          // 3. Verificar si la regla es nacional (incluye 'nacional', 'todos', 'all' o '*')
          const nationalKeywords = ['nacional', 'todos', 'all', '*'];
          if (zipcodes.some(zip => nationalKeywords.includes(zip.toLowerCase()))) {
            console.log(`✅ Regla ${rule.zona} aplica porque es nacional`);
            return true;
          }
          
          // Si llegamos aquí, la regla no aplica para esta dirección
          console.log(`❌ Regla ${rule.zona} NO aplica para CP: ${postalCode}, Estado: ${state}`);
          return false;
        });
        
        // Actualizar los grupos de envío con solo los grupos válidos
        if (validGroups.length === 0) {
          console.warn('No hay reglas de envío aplicables para esta dirección');
          setError('No hay opciones de envío disponibles para tu dirección');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        console.log(`✅ ${validGroups.length} de ${shippingGroups.length} grupos aplican para esta dirección`);
        
        // 2. Para cada grupo VÁLIDO, calcular opciones de envío
        const allOptions = [];
        
        for (const group of validGroups) {
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
            for (const [methodIndex, method] of group.rule.opciones_mensajeria.entries()) {
              // Extraer datos del método
              const methodId = `${group.rule.id}-${method.nombre?.replace(/\s+/g, '-')?.toLowerCase() || 'method'}-${methodIndex}`;
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
        
        console.log(`🚚 Opciones calculadas: ${sortedOptions.length}`);
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
    if (option) {
      setSelectedOption(option);
    }
  };
  
  return {
    loading,
    error,
    options,
    selectedOption,
    selectShippingOption,
    // Exponer grupos y reglas para el componente de diagnóstico
    shippingGroups,
    shippingRules,
    excludedProducts
  };
}; 