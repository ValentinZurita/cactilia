/**
 * Hook para obtener y gestionar reglas de envío
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchAllShippingRules } from '../services/shippingRulesService';

/**
 * Hook para obtener y gestionar reglas de envío
 * @returns {Object} Estado y funciones para reglas de envío
 */
export const useShippingRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  /**
   * Carga todas las reglas de envío activas
   */
  const loadRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const rulesData = await fetchAllShippingRules();
      
      // Filtrar reglas activas
      const activeRules = rulesData.filter(rule => rule.activo !== false);
      
      setRules(activeRules);
    } catch (err) {
      console.error('Error al cargar reglas de envío:', err);
      setError(err.message || 'Error al cargar reglas de envío');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Cargar reglas al montar el componente
  useEffect(() => {
    loadRules();
  }, [loadRules]);
  
  /**
   * Refresca las reglas de envío
   */
  const refreshRules = useCallback(() => {
    loadRules();
  }, [loadRules]);
  
  /**
   * Filtra reglas por un criterio personalizado
   * @param {Function} filterFn - Función de filtrado
   * @returns {Array} - Reglas filtradas
   */
  const filterRules = useCallback((filterFn) => {
    if (typeof filterFn !== 'function') {
      return rules;
    }
    
    return rules.filter(filterFn);
  }, [rules]);
  
  return {
    rules,
    loading,
    error,
    refreshRules,
    filterRules
  };
}; 