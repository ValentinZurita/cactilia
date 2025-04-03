/**
 * Hook personalizado para gestionar las reglas de envío
 * Proporciona métodos para obtener, crear, actualizar y eliminar reglas
 */

import { useState, useEffect, useCallback } from 'react';
import * as shippingApi from '../api/shippingApi';

/**
 * Hook para gestionar las reglas de envío
 * @returns {Object} Métodos y estados para interactuar con las reglas
 */
export const useShippingRules = () => {
  // Estado principal
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRules, setFilteredRules] = useState([]);
  
  /**
   * Cargar todas las reglas de envío
   */
  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await shippingApi.fetchShippingRules();
      setRules(data);
      
      // Aplicar filtro si hay un término de búsqueda activo
      if (searchTerm) {
        applySearchFilter(data, searchTerm);
      } else {
        setFilteredRules(data);
      }
    } catch (err) {
      setError(err.message || 'Error al cargar reglas de envío');
      console.error('Error al cargar reglas de envío:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);
  
  /**
   * Obtener una regla específica por su ID
   * @param {string} id - ID de la regla a obtener
   * @returns {Promise<Object>} La regla solicitada
   */
  const getRuleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const rule = await shippingApi.fetchShippingRuleById(id);
      return rule;
    } catch (err) {
      setError(err.message || `Error al obtener la regla ${id}`);
      console.error(`Error al obtener regla ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Crear una nueva regla de envío
   * @param {Object} rule - Datos de la nueva regla
   * @returns {Promise<Object>} La regla creada
   */
  const createRule = useCallback(async (rule) => {
    setLoading(true);
    setError(null);
    
    try {
      const createdRule = await shippingApi.createShippingRule(rule);
      
      // Actualizar el estado local con la nueva regla
      setRules(prevRules => [createdRule, ...prevRules]);
      applySearchFilter([createdRule, ...rules], searchTerm);
      
      return createdRule;
    } catch (err) {
      setError(err.message || 'Error al crear regla de envío');
      console.error('Error al crear regla de envío:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [rules, searchTerm]);
  
  /**
   * Actualizar una regla existente
   * @param {string} id - ID de la regla a actualizar
   * @param {Object} updates - Campos a actualizar
   * @returns {Promise<Object>} La regla actualizada
   */
  const updateRule = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedRule = await shippingApi.updateShippingRule(id, updates);
      
      // Actualizar el estado local
      setRules(prevRules => 
        prevRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
      );
      
      // Actualizar también las reglas filtradas
      setFilteredRules(prevRules => 
        prevRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
      );
      
      return updatedRule;
    } catch (err) {
      setError(err.message || `Error al actualizar regla ${id}`);
      console.error(`Error al actualizar regla ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Eliminar una regla
   * @param {string} id - ID de la regla a eliminar
   * @returns {Promise<void>}
   */
  const deleteRule = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await shippingApi.deleteShippingRule(id);
      
      // Actualizar el estado local
      setRules(prevRules => prevRules.filter(rule => rule.id !== id));
      setFilteredRules(prevRules => prevRules.filter(rule => rule.id !== id));
    } catch (err) {
      setError(err.message || `Error al eliminar regla ${id}`);
      console.error(`Error al eliminar regla ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Cambiar el estado (activo/inactivo) de una regla
   * @param {string} id - ID de la regla
   * @param {boolean} active - Nuevo estado
   * @returns {Promise<Object>} La regla actualizada
   */
  const toggleRuleStatus = useCallback(async (id, active) => {
    setLoading(true);
    setError(null);
    
    try {
      await shippingApi.toggleShippingRuleStatus(id, active);
      
      // Actualizar el estado local
      setRules(prevRules => 
        prevRules.map(rule => rule.id === id ? { ...rule, activo: active } : rule)
      );
      
      setFilteredRules(prevRules => 
        prevRules.map(rule => rule.id === id ? { ...rule, activo: active } : rule)
      );
      
      return { id, activo: active };
    } catch (err) {
      setError(err.message || `Error al cambiar estado de regla ${id}`);
      console.error(`Error al cambiar estado de regla ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Aplicar filtro de búsqueda a las reglas
   * @param {Array} rulesArray - Arreglo de reglas a filtrar
   * @param {string} term - Término de búsqueda
   */
  const applySearchFilter = (rulesArray, term) => {
    if (!term.trim()) {
      setFilteredRules(rulesArray);
      return;
    }
    
    const normalizedTerm = term.toLowerCase().trim();
    
    const filtered = rulesArray.filter(rule => {
      // Buscar en el nombre de la zona
      if (rule.zona && rule.zona.toLowerCase().includes(normalizedTerm)) {
        return true;
      }
      
      // Buscar en códigos postales
      if (rule.zipcodes && rule.zipcodes.some(zip => 
        typeof zip === 'string' && zip.toLowerCase().includes(normalizedTerm)
      )) {
        return true;
      }
      
      // Buscar en mensajerías
      if (rule.opciones_mensajeria && rule.opciones_mensajeria.some(
        option => option.mensajeria && option.mensajeria.toLowerCase().includes(normalizedTerm)
      )) {
        return true;
      }
      
      return false;
    });
    
    setFilteredRules(filtered);
  };
  
  /**
   * Actualizar término de búsqueda
   * @param {string} term - Nuevo término de búsqueda
   */
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    applySearchFilter(rules, term);
  }, [rules]);
  
  // Cargar reglas al montar el componente
  useEffect(() => {
    fetchRules();
  }, [fetchRules]);
  
  return {
    // Estado
    rules: filteredRules,
    loading,
    error,
    searchTerm,
    
    // Métodos
    fetchRules,
    getRuleById,
    createRule,
    updateRule,
    deleteRule,
    toggleRuleStatus,
    handleSearchChange,
  };
};

export default useShippingRules; 