import { useMemo, useEffect, useState } from 'react';
import { groupProductsByShippingRules } from '../../../../checkout/services/shippingGroupingService';
import { calculateTotalShippingCost } from '../../../../checkout/utils/shippingCalculator';

/**
 * Constantes para cálculos del carrito
 */
const CART_CONFIG = {
  TAX_RATE: 0.16, // 16%
  MIN_FREE_SHIPPING: 225 // Envío gratis a partir de $225
};

/**
 * Hook especializado en cálculos de totales del carrito
 *
 * Se encarga de:
 * - Cálculo de subtotales
 * - Cálculo de impuestos
 * - Cálculo de envío basado en reglas de productos
 * - Cálculo de total final
 *
 * @param {Array} items - Productos en el carrito
 * @returns {Object} Totales calculados
 */
export const useCartTotals = (items) => {
  // Estado para almacenar grupos de envío
  const [shippingGroups, setShippingGroups] = useState([]);
  const [shippingRules, setShippingRules] = useState([]);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);

  // Obtener reglas de envío cuando cambian los items
  useEffect(() => {
    const fetchShippingRules = async () => {
      if (!Array.isArray(items) || items.length === 0) return;
      
      setIsLoadingShipping(true);
      try {
        // Obtener grupos de productos según reglas de envío
        const groups = await groupProductsByShippingRules(items);
        setShippingGroups(groups);
        
        // Extraer todas las reglas únicas
        const allRules = [];
        groups.forEach(group => {
          if (group.rules && Array.isArray(group.rules)) {
            group.rules.forEach(rule => {
              if (!allRules.some(r => r.id === rule.id)) {
                allRules.push(rule);
              }
            });
          }
        });
        
        setShippingRules(allRules);
      } catch (error) {
        console.error('Error al obtener reglas de envío:', error);
      } finally {
        setIsLoadingShipping(false);
      }
    };
    
    fetchShippingRules();
  }, [items]);

  /**
   * Calcula todos los totales del carrito
   * Con modelo fiscal mexicano (IVA incluido en el precio)
   */
  const calculatedValues = useMemo(() => {
    // Validar que items sea un array
    if (!Array.isArray(items) || items.length === 0) {
      return {
        subtotal: 0,
        taxes: 0,
        shipping: 0,
        total: 0,
        finalTotal: 0,
        isFreeShipping: true,
        shippingGroups: [],
        shippingRules: [],
        shippingDetails: { baseCost: 0, extraWeightCost: 0, totalCost: 0 }
      };
    }

    // Calcular subtotal (con validación de datos)
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);

    // Calcular impuestos (IVA incluido en el precio en México)
    const taxes = +(subtotal * CART_CONFIG.TAX_RATE / (1 + CART_CONFIG.TAX_RATE)).toFixed(2);
    
    // Calcular costo de envío agregado de todos los grupos
    let totalShippingCost = 0;
    const shippingDetails = {
      baseCost: 0,
      extraWeightCost: 0,
      totalCost: 0,
      groupDetails: []
    };
    
    // Procesar cada grupo y sus costos
    shippingGroups.forEach(group => {
      if (!group.rules || !Array.isArray(group.rules) || group.rules.length === 0) return;
      
      // Usar la primera regla de cada grupo (podríamos implementar lógica más compleja)
      const rule = group.rules[0];
      if (!rule || !rule.opciones_mensajeria || !Array.isArray(rule.opciones_mensajeria)) return;
      
      // Usar la primera opción de mensajería
      const shippingOption = rule.opciones_mensajeria[0];
      if (!shippingOption) return;
      
      // Configuración de paquetes
      const configPaquetes = shippingOption.configuracion_paquetes || {
        peso_maximo_paquete: 20,
        costo_por_kg_extra: 10,
        maximo_productos_por_paquete: 10
      };
      
      // Obtener precio base
      const price = shippingOption.precio || '200';
      const baseCost = typeof price === 'string' ? parseFloat(price) : price;
      
      // Calcular peso y cantidad total del grupo
      const totalWeight = group.totalWeight || 
        group.items.reduce((sum, item) => {
          const quantity = item.quantity || 1;
          const weight = (item.weight || 1) * quantity;
          return sum + weight;
        }, 0);
      
      const totalQuantity = group.totalQuantity || 
        group.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      
      // Calcular paquetes necesarios
      const maxWeight = parseFloat(configPaquetes.peso_maximo_paquete) || 20;
      const maxProducts = parseInt(configPaquetes.maximo_productos_por_paquete) || 10;
      const extraCostPerKg = parseFloat(configPaquetes.costo_por_kg_extra) || 10;
      
      const packagesByWeight = Math.ceil(totalWeight / maxWeight);
      const packagesByQuantity = Math.ceil(totalQuantity / maxProducts);
      const totalPackages = Math.max(packagesByWeight, packagesByQuantity);
      
      // Calcular costo
      let groupShippingCost = baseCost;
      let extraWeightCost = 0;
      
      // Si solo necesitamos un paquete pero excede el peso
      if (totalPackages === 1 && totalWeight > maxWeight) {
        const extraWeight = Math.ceil(totalWeight - maxWeight);
        extraWeightCost = extraWeight * extraCostPerKg;
        groupShippingCost += extraWeightCost;
      } 
      // Si necesitamos múltiples paquetes
      else if (totalPackages > 1) {
        groupShippingCost = baseCost * totalPackages;
      }
      
      // Acumular costos
      shippingDetails.baseCost += baseCost;
      shippingDetails.extraWeightCost += extraWeightCost;
      shippingDetails.totalCost += groupShippingCost;
      
      // Detalles específicos de este grupo
      shippingDetails.groupDetails.push({
        groupId: group.id,
        groupName: group.name,
        ruleName: rule.zona,
        ruleId: rule.id,
        shippingName: shippingOption.nombre,
        baseCost,
        extraWeightCost,
        totalCost: groupShippingCost,
        totalWeight,
        totalQuantity,
        totalPackages,
        items: group.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      totalShippingCost += groupShippingCost;
    });

    // Determinar si el envío es gratuito por monto mínimo
    const isFreeShipping = subtotal >= CART_CONFIG.MIN_FREE_SHIPPING;
    const shipping = isFreeShipping ? 0 : totalShippingCost;

    // Calcular total sin envío
    const total = subtotal;

    // Calcular total final con envío
    const finalTotal = +(total + shipping).toFixed(2);

    // Extraer todas las reglas únicas de todos los grupos para retornarlas
    const allRules = [];
    shippingGroups.forEach(group => {
      if (group.rules && Array.isArray(group.rules)) {
        group.rules.forEach(rule => {
          if (!allRules.some(r => r.id === rule.id)) {
            allRules.push(rule);
          }
        });
      }
    });

    return {
      subtotal,
      taxes,
      shipping,
      total,
      finalTotal,
      isFreeShipping,
      isLoadingShipping,
      shippingGroups,
      shippingRules: allRules,
      shippingDetails
    };
  }, [items, shippingGroups, shippingRules, isLoadingShipping]);

  return calculatedValues;
};