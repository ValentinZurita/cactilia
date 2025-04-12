import { useState, useEffect, useRef } from 'react';
import { fetchShippingRuleById } from '../../../../admin/shipping/api/shippingApi';
import { groupProductsIntoPackages, calculateTotalShippingCost } from '../../../../checkout/utils/shippingCalculator';

/**
 * Calcula el total de un grupo de productos
 * @param {Array} items - Items del carrito en el grupo
 * @returns {number} - Total del grupo
 */
const calculateGroupTotal = (items) => {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    const product = item.product || item;
    const price = parseFloat(product.price || 0);
    const quantity = parseInt(item.quantity || 1, 10);
    return total + (price * quantity);
  }, 0);
};

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
        const nationalRuleId = "fyfkhfITejBjMASFCMZ2"; // ID de la regla nacional
        
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
          
          // Verificar si el producto tiene asignada específicamente la regla nacional
          const hasNationalRule = ruleIds.includes(nationalRuleId);
          
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
          
          // Mostrar información de la regla para diagnóstico
          console.log(`⚠️ Validando regla: ${rule.id}`, {
            zona: rule.zona,
            zipcodes: zipcodes.slice(0, 5), // Mostrar solo los primeros 5 para no saturar la consola
            totalZipcodes: zipcodes.length,
            userState: state,
            userZip: postalCode,
            ruleId: rule.id
          });
          
          // Verificar si la regla es la nacional y conservarla solo si está asignada específicamente
          if (rule.id === nationalRuleId) {
            // Si es la regla nacional específica, permitirla siempre
            console.log('📍 Regla nacional específica aplicada (ID explícito)');
            return true;
          }
          
          // 1. Verificar si hay coincidencia exacta con el CP
          if (zipcodes.includes(postalCode)) {
            console.log(`📍 Match exacto de CP ${postalCode} para regla ${rule.id}`);
            return true;
          }
          
          // 2. Verificar si la regla incluye el término "nacional"
          const isNationalRule = 
            zipcodes.some(z => z && z.toLowerCase() === 'nacional') || 
            (rule.zipcode && rule.zipcode.toLowerCase() === 'nacional') ||
            (rule.zona && rule.zona.toLowerCase() === 'nacional');
          
          // Si es regla nacional, permitirla
          if (isNationalRule) {
            console.log('📍 Regla nacional aplicada');
            return true;
          }
          
          // 3. Verificar coincidencia por estado (más casos de coincidencia)
          // Primero verificar en campo estados si existe
          const stateMatches = rule.estados && Array.isArray(rule.estados) && 
            rule.estados.some(ruleState => 
              ruleState && state && ruleState.toLowerCase() === state.toLowerCase()
            );
          
          if (stateMatches) {
            console.log(`📍 Match de estado ${state} para regla ${rule.id}`);
            return true;
          }

          // También verificar si el estado coincide con la zona (para compatibilidad con formatos antiguos)
          if (rule.zona && state && rule.zona.toLowerCase().includes(state.toLowerCase())) {
            console.log(`📍 Match de estado con zona: ${state} incluido en zona ${rule.zona}`);
            return true;
          }
          
          // También verificar si la zona está incluida en el estado (caso inverso)
          if (rule.zona && state && state.toLowerCase().includes(rule.zona.toLowerCase())) {
            console.log(`📍 Match de zona incluida en estado: ${rule.zona} incluido en ${state}`);
            return true;
          }
          
          // También verificar si el estado está incluido en los zipcodes como una opción
          if (state && zipcodes.some(zip => zip && zip.toLowerCase() === state.toLowerCase())) {
            console.log(`📍 Match de estado incluido en zipcodes: ${state}`);
            return true;
          }
          
          // 4. Verificar coincidencia por primera sección del código postal (primeros 2 dígitos)
          if (postalCode && postalCode.length >= 2) {
            const postalPrefix = postalCode.substring(0, 2);
            const prefixMatches = zipcodes.some(zip => 
              zip && zip.length >= 2 && zip.substring(0, 2) === postalPrefix
            );
            
            if (prefixMatches) {
              console.log(`📍 Match de prefijo postal ${postalPrefix} para regla ${rule.id}`);
              return true;
            }
          }
          
          // 5. Verificar si la regla incluye rangos de códigos postales
          const hasPostalRanges = rule.rangosCP && Array.isArray(rule.rangosCP) && rule.rangosCP.length > 0;
          
          if (hasPostalRanges && postalCode) {
            const numericPostal = parseInt(postalCode, 10);
            
            if (!isNaN(numericPostal)) {
              const rangeMatch = rule.rangosCP.some(range => {
                const min = parseInt(range.min, 10);
                const max = parseInt(range.max, 10);
                
                return !isNaN(min) && !isNaN(max) && 
                  numericPostal >= min && numericPostal <= max;
              });
              
              if (rangeMatch) {
                console.log(`📍 Match de rango postal para CP ${postalCode} en regla ${rule.id}`);
                return true;
              }
            }
          }
          
          // Si llegamos aquí, la regla no aplica para esta dirección
          console.log(`❌ No hay match para CP ${postalCode} con regla ${rule.id}`);
          return false;
        });
        
        // Si no hay grupos válidos después de filtrar, mostrar mensaje
        if (validGroups.length === 0) {
          console.warn('⚠️ No hay grupos de envío disponibles para la dirección seleccionada');
          setError('No hay opciones de envío disponibles para tu dirección');
          setOptions([]);
          setLoading(false);
          return;
        }
        
        console.log(`📦 Grupos de envío válidos para CP ${postalCode}: ${validGroups.length}`);
        
        // Crear opciones de envío a partir de los grupos válidos
        const allOptions = [];
        
        // Recorrer cada grupo válido y generar opciones
        for (const group of validGroups) {
          // Verificar si es una regla nacional
          const rule = group.rule;
          const isNationalRule = rule.id === nationalRuleId || 
            (rule.zipcodes && rule.zipcodes.some(z => z && z.toLowerCase() === 'nacional')) || 
            (rule.zipcode && rule.zipcode.toLowerCase() === 'nacional');
          
          // Para reglas nacionales, verificar que el producto tenga esta regla específicamente asignada
          if (isNationalRule) {
            // Solo crear opciones para grupos que tienen asignada esta regla específicamente
            console.log(`🌎 Aplicando regla nacional para grupo: ${group.id}`);
          }
          
          // Obtener opciones del grupo
          const opciones = rule.opciones_mensajeria || [];
          
          if (opciones.length === 0) {
            console.warn(`⚠️ Grupo ${group.id} no tiene opciones de mensajería configuradas`);
            continue;
          }
          
          // Recorrer cada opción del grupo
          opciones.forEach(opcion => {
            // Verificar si la opción es válida
            if (!opcion || !opcion.precio) return;
            
            // Crear datos de opción
            const optionId = `${group.id}-${opcion.nombre || 'default'}`;
            
            // Calcular si el envío es gratis según condiciones
            const isFreeShipping = rule.envio_gratis === true || 
              (rule.envio_gratis_monto_minimo && 
               parseInt(rule.envio_gratis_monto_minimo) > 0 && 
               calculateGroupTotal(group.items) >= parseInt(rule.envio_gratis_monto_minimo));
            
            // Calcular costo total del grupo
            const groupTotal = calculateGroupTotal(group.items);
            
            // Crear objeto de opción
            const option = {
              id: optionId,
              groupId: group.id,
              label: `${rule.zona || 'Envío'} - ${opcion.nombre || 'Estándar'}`,
              carrier: opcion.nombre || 'Mensajería',
              minDays: opcion.minDays || 1,
              maxDays: opcion.maxDays || 5,
              calculatedCost: isFreeShipping ? 0 : parseFloat(opcion.precio || 0),
              totalCost: isFreeShipping ? 0 : parseFloat(opcion.precio || 0),
              price: isFreeShipping ? 0 : parseFloat(opcion.precio || 0),
              isFreeShipping,
              tiempoEntrega: opcion.tiempo_entrega || `${opcion.minDays || 1}-${opcion.maxDays || 5} días`,
              details: rule.zona ? `Envío a ${rule.zona}` : 'Opción de envío',
              isNationalRule
            };
            
            // Si el envío es gratuito, modificar la etiqueta
            if (isFreeShipping) {
              option.label = `${option.label} (Gratis)`;
            }
            
            allOptions.push(option);
          });
        }
        
        // Si no hay opciones disponibles después de todo el proceso
        if (allOptions.length === 0) {
          setError('Los productos en tu carrito no tienen opciones de envío disponibles para tu dirección. Por favor, contacta a servicio al cliente o selecciona otra dirección de entrega.');
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
    } else if (options.length === 0 || loading) {
      // Reset the ref when options change or are loading
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
      // Obtener el precio para asegurar que siempre exista
      const optionPrice = combination.totalPrice || 0;
      
      // Crear formato estándar para cada combinación
      return {
        id: combination.id,
        label: combination.description || 'Opción de envío',
        totalCost: optionPrice,
        calculatedCost: optionPrice,
        price: optionPrice, // Añadir campo price para compatibilidad
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
            price: option.totalPrice || option.totalCost || option.calculatedCost || option.price || 0,
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
              price: option.totalPrice || option.totalCost || option.calculatedCost || option.price || 0,
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
        price: matchingCombination.totalPrice || 0,
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
          price: selectedCombination.totalPrice || 0,
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