import { useState, useEffect, useRef } from 'react';
import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi';
import { groupProductsIntoPackages, calculateTotalShippingCost } from '../../../../checkout/utils/shippingCalculator';

/**
 * Hook para gestionar las opciones de envío en el checkout
 * Obtiene las reglas de envío desde Firestore y calcula las opciones disponibles
 * @param {Array} cartItems - Ítems del carrito
 * @param {Object} selectedAddressId - Objeto de dirección seleccionada (guardada)
 * @param {Object} newAddressData - Datos de una nueva dirección (en proceso)
 * @param {string} selectedAddressType - Tipo de dirección seleccionada ('saved' o 'new')
 */
export const useShippingOptions = (cartItems, selectedAddressId, newAddressData, selectedAddressType) => {
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
  
  // Usar useRef para controlar la inicialización y evitar loops
  const optionsLoadedRef = useRef(false);
  const shippingUpdateRef = useRef(null);
  
  // Estados para manejar combinaciones de shippingGroupService
  const [shippingCombinations, setShippingCombinations] = useState([]);
  
  // Obtener dirección del usuario cuando cambia la dirección seleccionada
  useEffect(() => {
    const getUserAddress = async () => {
      // Resetear selección, opciones y combinaciones cuando cambia la dirección
      setSelectedOption(null);
      shippingUpdateRef.current = null;
      optionsLoadedRef.current = false;
      setShippingCombinations([]);
      setOptions([]);
      
      // Verificar qué tipo de dirección está seleccionada
      if (selectedAddressType === 'saved') {
        // Dirección guardada
        if (!selectedAddressId) {
          setUserAddress(null);
          return;
        }
        
        // Aquí normalmente obtendríamos la dirección de Firestore
        // Pero para simplificar, asumimos que ya tenemos la dirección en el componente padre
        // y que selectedAddressId es en realidad el objeto dirección completo
        setUserAddress(selectedAddressId);
        console.log('🏠 Dirección guardada seleccionada:', selectedAddressId);
      } 
      else if (selectedAddressType === 'new') {
        // Nueva dirección - verificar si está completa
        if (!newAddressData) {
          setUserAddress(null);
          return;
        }
        
        // Validar que los campos obligatorios estén completos
        const requiredFields = ['street', 'city', 'state', 'zip'];
        const isComplete = requiredFields.every(field => 
          newAddressData[field] && newAddressData[field].trim() !== ''
        );
        
        if (isComplete) {
          // La dirección nueva está completa
          console.log('🏠 Nueva dirección completa:', newAddressData);
          setUserAddress(newAddressData);
        } else {
          // La dirección nueva no está completa
          console.log('⚠️ Nueva dirección incompleta - datos actuales:', newAddressData);
          setUserAddress(null);
          
          // Limpiar opciones y establecer mensaje
          setOptions([]);
          setSelectedOption(null);
          setError('Complete su dirección para ver opciones de envío');
        }
      }
      else {
        // No hay tipo de dirección seleccionado
        setUserAddress(null);
      }
      
      // Al cambiar la dirección, reiniciamos la opción seleccionada
      // para forzar una nueva evaluación basada en la nueva dirección
      setSelectedOption(null);
    };
    
    getUserAddress();
  }, [selectedAddressId, newAddressData, selectedAddressType]);
  
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
          
          // Si la regla tiene configuración de códigos postales incluidos
          if (rule.codigos_postales_incluidos && Array.isArray(rule.codigos_postales_incluidos)) {
            // Verificar si el código postal del usuario está en la lista
            const postalCodeMatch = rule.codigos_postales_incluidos.includes(postalCode);
            console.log(`✅ Regla ${rule.zona}: Código postal ${postalCode} está ${postalCodeMatch ? 'incluido' : 'no incluido'} en la lista`);
            
            if (postalCodeMatch) {
              return true;
            }
          }
          
          // Si la regla es "Nacional", aplica a todos los códigos postales
          if (rule.zona === "Nacional" || rule.es_nacional === true) {
            console.log(`✅ Regla ${rule.zona} aplica porque es nacional`);
            return true;
          }
          
          // Si llegamos aquí, verificar si hay otras condiciones que puedan aplicar
          // Por ejemplo, si no hay restricciones de código postal en la regla
          if (!rule.codigos_postales_incluidos || rule.codigos_postales_incluidos.length === 0) {
            console.log(`✅ Regla ${rule.zona} aplica porque no tiene restricciones de código postal`);
            return true;
          }
          
          // Si llegamos aquí, la regla no aplica para esta dirección
          console.log(`❌ Regla ${rule.zona} NO aplica para CP: ${postalCode}`);
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
        
        // Marcar que las opciones han sido cargadas
        optionsLoadedRef.current = true;
        
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
  
  // Manejar la selección automática de la primera opción una sola vez cuando las opciones estén disponibles
  useEffect(() => {
    // Solo ejecutar esto una vez cuando las opciones estén disponibles y no haya ninguna seleccionada
    if (options.length > 0 && !selectedOption && !loading && optionsLoadedRef.current) {
      // Usar una referencia para evitar llamar esto múltiples veces
      if (!shippingUpdateRef.current) {
        console.log('🔄 Seleccionando automáticamente la opción más económica (ejecución única)');
        
        // Marcar que ya hemos hecho una selección automática para este conjunto de opciones
        shippingUpdateRef.current = 'autoselected';
        
        // Seleccionar la opción más económica
        const cheapestOption = [...options].sort((a, b) => 
          (a.totalCost || a.calculatedCost || 9999) - (b.totalCost || b.calculatedCost || 9999)
        )[0];
        
        if (cheapestOption) {
          setSelectedOption(cheapestOption);
        }
      }
    } else if ((options.length === 0 || loading) && shippingUpdateRef.current) {
      // Resetear la referencia si no hay opciones o se está cargando
      shippingUpdateRef.current = null;
    }
  }, [options, selectedOption, loading]);
  
  // Cuando cambie la dirección, reiniciar completamente las opciones
  useEffect(() => {
    if (userAddress) {
      console.log('📮 Dirección cambiada:', userAddress);
      // Al cambiar de dirección, limpiar opciones seleccionadas
      setSelectedOption(null);
      setShippingCombinations([]);
      setLoading(true);
      
      // Reiniciar referencias para manejar la selección inicial
      optionsLoadedRef.current = false;
    }
  }, [userAddress]);
  
  /**
   * Procesa las combinaciones de envío para estandarizarlas
   * @param {Array} combinations - Combinaciones de envío
   * @returns {Array} Opciones de envío procesadas
   */
  const processShippingOptions = (combinations) => {
    console.log('🔄 Procesando', combinations.length, 'combinaciones de envío');
    
    if (!combinations || !Array.isArray(combinations) || combinations.length === 0) {
      console.warn('⚠️ No hay combinaciones para procesar');
      return [];
    }
    
    return combinations.map(combination => {
      // Crear formato estándar para cada combinación
      return {
        id: combination.id,
        label: combination.description || 'Opción de envío',
        totalCost: combination.totalPrice || 0,
        calculatedCost: combination.totalPrice || 0,
        isFreeShipping: combination.isAllFree || false,
        selections: combination.selections || [],
        carrier: (combination.selections && combination.selections.length > 1) 
          ? 'Combinado' 
          : (combination.selections?.[0]?.option?.carrier || 'Servicio de envío'),
        details: `${combination.selections?.length || 1} grupo(s) de envío`
      };
    });
  };

  // Cuando calculamos nuevas combinaciones, reemplazar completamente las anteriores
  const updateShippingCombinations = (combinations) => {
    console.log('🔄 Actualizando combinaciones de envío:', combinations.length);
    
    // Para diagnóstico: guardar IDs actuales
    const currentIds = shippingCombinations.map(c => c.id);
    console.log('🔑 IDs de combinaciones actuales:', currentIds);
    
    // Asegurar que las combinaciones tengan IDs consistentes basados en su contenido
    const processedCombinations = combinations.map(combination => {
      // Crear un ID consistente basado en el contenido de la combinación
      // Esto ayuda a que el mismo grupo y opción mantengan el mismo ID
      if (!combination.stableId) {
        const groupsSignature = combination.selections?.map(s => 
          `${s.groupId}-${s.option?.carrier || 'carrier'}`
        ).join('_') || 'single';
        
        // Usar parte del ID original pero añadir una firma estable
        const stableId = `${combination.id.split('-')[0]}-${groupsSignature}`;
        combination.stableId = stableId;
        
        console.log(`🔑 ID estable generado: ${stableId} para combinación ${combination.id}`);
      }
      
      return {
        ...combination,
        // Sobrescribir el ID con uno estable
        id: combination.stableId
      };
    });
    
    // Mostrar nuevos IDs
    console.log('🔑 IDs de combinaciones nuevas:', processedCombinations.map(c => c.id));
    
    // Limpiar opciones anteriores completamente - esto evita que persistan opciones
    // que ya no son válidas para la dirección actual
    setShippingCombinations(processedCombinations);
    setOptions([]);
    
    if (processedCombinations.length === 0) {
      console.warn('⚠️ No se encontraron opciones de envío disponibles');
      setError('No hay opciones de envío disponibles para esta dirección');
      setLoading(false);
      return;
    }

    // Procesar las nuevas combinaciones
    const processedOptions = processShippingOptions(processedCombinations);
    setOptions(processedOptions);
    
    // Limpiar la selección anterior, ya que las opciones han cambiado
    setSelectedOption(null);
    
    setLoading(false);
    
    console.log('✅ Opciones de envío actualizadas:', processedOptions.length);
  };
  
  // Función para seleccionar una opción
  const selectShippingOption = (option) => {
    // Si recibimos un objeto en lugar de ID, extraer el ID
    const optionId = option?.id || option;
    
    if (!optionId) {
      console.warn('⚠️ Intento de seleccionar una opción de envío sin ID');
      return;
    }
    
    console.log('🔄 Opción de envío seleccionada:', optionId);
    
    // Imprimir opciones disponibles para diagnóstico
    console.log('📋 Opciones estándar disponibles:', options.map(o => ({ id: o.id, price: o.totalCost })));
    console.log('📋 Combinaciones disponibles:', shippingCombinations.map(c => ({ id: c.id, price: c.totalPrice })));
    
    // Primero verificar si la opción sigue siendo válida con la dirección actual
    const isInCurrentOptions = options.some(opt => opt.id === optionId);
    const isInCombinations = shippingCombinations.some(combo => combo.id === optionId);
    
    // Verificación más flexible para opciones entre direcciones - buscar por nombre/descripción
    let matchingCombination = null;
    if (!isInCurrentOptions && !isInCombinations) {
      // Buscar coincidencia aproximada por descripción si tenemos el objeto completo
      if (option.description || option.name) {
        const searchText = (option.description || option.name || '').toLowerCase();
        console.log('🔎 Buscando coincidencia por descripción:', searchText);
        
        // Extraer palabras clave de la descripción
        const keywords = searchText
          .replace(/\([^)]*\)/g, '') // Eliminar contenido entre paréntesis
          .split(/[^a-zA-ZáéíóúÁÉÍÓÚ]+/) // Dividir por no-letras
          .filter(word => word.length > 3) // Filtrar palabras significativas
          .map(word => word.toLowerCase());
        
        console.log('🔑 Palabras clave:', keywords);
        
        // Primera búsqueda: coincidencia exacta
        matchingCombination = shippingCombinations.find(combo => 
          combo.description && searchText && 
          combo.description.toLowerCase() === searchText
        );
        
        // Segunda búsqueda: coincidencia parcial
        if (!matchingCombination) {
          matchingCombination = shippingCombinations.find(combo => {
            if (!combo.description) return false;
            const comboText = combo.description.toLowerCase();
            // Buscar si el texto de búsqueda contiene la descripción o viceversa
            return comboText.includes(searchText) || searchText.includes(comboText);
          });
        }
        
        // Tercera búsqueda: coincidencia por palabras clave
        if (!matchingCombination && keywords.length > 0) {
          matchingCombination = shippingCombinations.find(combo => {
            if (!combo.description) return false;
            const comboText = combo.description.toLowerCase();
            // Verificar si al menos 2 palabras clave coinciden
            return keywords.filter(keyword => comboText.includes(keyword)).length >= 1;
          });
        }
        
        if (matchingCombination) {
          console.log('✅ Encontrada combinación similar:', matchingCombination.id);
        }
      }
      
      // Si no encontramos coincidencia, mantener la selección del usuario en lugar de reemplazarla
      if (!matchingCombination) {
        // Solo registrar un mensaje, pero no cambiar la selección
        if (shippingCombinations.length > 0) {
          console.log('⚠️ No se encontró coincidencia exacta, pero mantenemos la selección del usuario');
          // Crear un objeto de opción basado en la selección del usuario
          const userSelection = {
            id: optionId,
            label: option.description || option.name || 'Opción de envío seleccionada',
            totalCost: option.totalPrice || option.totalCost || option.calculatedCost || 0,
            calculatedCost: option.totalPrice || option.totalCost || option.calculatedCost || 0,
            isFreeShipping: option.isAllFree || option.isFreeShipping || false,
            selections: option.selections || [],
            carrier: option.carrier || 'Servicio de envío',
            details: option.details || `Opción seleccionada por el usuario`
          };
          
          setSelectedOption(userSelection);
          return;
        } else if (options.length > 0) {
          console.log('⚠️ No hay combinaciones disponibles, pero mantenemos la selección si es posible');
          // Si tenemos opciones estándar pero no combinaciones, podemos usar esas
          if (option && (option.id || option.description)) {
            const userSelection = {
              id: optionId,
              label: option.description || option.name || 'Opción de envío',
              totalCost: option.totalPrice || option.totalCost || 0,
              calculatedCost: option.calculatedCost || option.totalCost || 0,
              isFreeShipping: option.isAllFree || option.isFreeShipping || false,
              carrier: option.carrier || 'Servicio de envío'
            };
            setSelectedOption(userSelection);
          } else {
            // Solo como último recurso usar la primera opción
            const firstOption = options[0];
            setSelectedOption(firstOption);
          }
          return;
        } else {
          console.error('❌ Error: No hay opciones disponibles para esta dirección');
          return;
        }
      }
    }
    
    // Si encontramos una combinación por coincidencia aproximada, usarla
    if (matchingCombination) {
      console.log(`💰 Usando combinación similar: $${matchingCombination.totalPrice || 0}`);
      
      // Adaptar la combinación al formato esperado
      const adaptedOption = {
        id: matchingCombination.id,
        label: matchingCombination.description || 'Opción de envío',
        totalCost: matchingCombination.totalPrice || 0,
        calculatedCost: matchingCombination.totalPrice || 0,
        isFreeShipping: matchingCombination.isAllFree,
        selections: matchingCombination.selections || [],
        carrier: 'Combinado',
        details: `Opción de envío (${matchingCombination.selections?.length || 1} grupos)`
      };
      
      setSelectedOption(adaptedOption);
      return;
    }
    
    // Seguir con el flujo normal si la opción existe
    // Primero intentar encontrar la opción en las combinaciones externas
    if (shippingCombinations.length > 0) {
      const selectedCombination = shippingCombinations.find(combo => combo.id === optionId);
      
      if (selectedCombination) {
        console.log(`💰 Costo de envío (combinación): $${selectedCombination.totalPrice || 0}`);
        
        // Adaptar la combinación al formato esperado por el resto del sistema
        const adaptedOption = {
          id: selectedCombination.id,
          label: selectedCombination.description || 'Opción de envío',
          totalCost: selectedCombination.totalPrice || 0,
          calculatedCost: selectedCombination.totalPrice || 0,
          isFreeShipping: selectedCombination.isAllFree,
          selections: selectedCombination.selections || [],
          // Añadir campos necesarios para el resto del sistema
          carrier: 'Combinado',
          details: `Opción de envío (${selectedCombination.selections?.length || 1} grupos)`
        };
        
        setSelectedOption(adaptedOption);
        return;
      }
    }
    
    // Si no está en las combinaciones, buscar en las opciones tradicionales
    const selectedOpt = options.find(opt => opt.id === optionId);
    
    if (selectedOpt) {
      console.log(`💰 Costo de envío: $${selectedOpt.totalCost || selectedOpt.calculatedCost || 0}`);
      setSelectedOption(selectedOpt);
    } else {
      console.warn(`⚠️ No se encontró la opción con ID: ${optionId}`);
      console.log('Opciones disponibles:', options.map(o => ({ id: o.id, price: o.totalCost })));
      console.log('Combinaciones disponibles:', shippingCombinations.map(c => ({ id: c.id, price: c.totalPrice })));
    }
  };
  
  return {
    loading,
    error,
    options,
    selectedOption,
    selectShippingOption,
    updateShippingCombinations,
    shippingCombinations,
    // Exponer grupos y reglas para el componente de diagnóstico
    shippingGroups,
    shippingRules,
    excludedProducts
  };
}; 