/**
 * Hook para manejar el algoritmo de empaquetado greedy
 */
import { useState, useCallback, useMemo } from 'react';
import { groupIntoPackages, calculateTotalShippingCost } from '../utils/packagingUtils';

/**
 * Hook para empaquetar productos utilizando el algoritmo greedy
 * @param {Array} initialItems - Ítems iniciales (opcional)
 * @param {Object} initialRule - Regla inicial (opcional)
 * @returns {Object} Estado y funciones para empaquetado
 */
export const useGreedyPackaging = (initialItems = [], initialRule = null) => {
  const [items, setItems] = useState(initialItems);
  const [rule, setRule] = useState(initialRule);
  
  /**
   * Calcula los paquetes basados en los ítems y regla actuales
   * @returns {Array} - Paquetes calculados
   */
  const packages = useMemo(() => {
    if (!items.length || !rule) return [];
    
    return groupIntoPackages(items, rule);
  }, [items, rule]);
  
  /**
   * Calcula el costo total de envío para los paquetes
   * @returns {Object} - Detalles del costo total
   */
  const costDetails = useMemo(() => {
    if (!packages.length) {
      return { totalCost: 0, freePackages: 0, paidPackages: 0, packageCosts: [] };
    }
    
    return calculateTotalShippingCost(packages);
  }, [packages]);
  
  /**
   * Actualiza los ítems a empaquetar
   * @param {Array} newItems - Nuevos ítems
   */
  const updateItems = useCallback((newItems) => {
    if (!newItems || !Array.isArray(newItems)) return;
    
    setItems(newItems);
  }, []);
  
  /**
   * Actualiza la regla de envío
   * @param {Object} newRule - Nueva regla
   */
  const updateRule = useCallback((newRule) => {
    if (!newRule) return;
    
    setRule(newRule);
  }, []);
  
  /**
   * Actualiza tanto los ítems como la regla
   * @param {Array} newItems - Nuevos ítems
   * @param {Object} newRule - Nueva regla
   */
  const updatePackagingData = useCallback((newItems, newRule) => {
    if (newItems && Array.isArray(newItems)) {
      setItems(newItems);
    }
    
    if (newRule) {
      setRule(newRule);
    }
  }, []);
  
  return {
    items,
    rule,
    packages,
    costDetails,
    updateItems,
    updateRule,
    updatePackagingData,
  };
}; 