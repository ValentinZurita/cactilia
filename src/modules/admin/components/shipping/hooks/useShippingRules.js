import { useState, useEffect, useCallback } from 'react';
import {
  getShippingRules,
  getShippingRuleById,
  createShippingRule,
  updateShippingRule,
  deleteShippingRule,
  importShippingRulesFromCSV
} from '../services/shippingService';

/**
 * Hook personalizado para gestionar las reglas de envío.
 *
 * @returns {Object} - Funciones y estado para gestionar reglas de envío
 */
export const useShippingRules = () => {
  const [shippingRules, setShippingRules] = useState([]);
  const [filteredRules, setFilteredRules] = useState([]);
  const [selectedRule, setSelectedRule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar reglas de envío
  const loadShippingRules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getShippingRules();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar reglas de envío');
      }

      setShippingRules(result.data);
      setFilteredRules(result.data);
    } catch (err) {
      console.error('Error cargando reglas de envío:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadShippingRules();
  }, [loadShippingRules]);

  // Obtener una regla por su ID
  const fetchShippingRuleById = useCallback(async (ruleId) => {
    if (!ruleId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getShippingRuleById(ruleId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar regla de envío');
      }

      setSelectedRule(result.data);
    } catch (err) {
      console.error(`Error cargando regla de envío ${ruleId}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear una nueva regla
  const handleCreateShippingRule = useCallback(async (_, ruleData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await createShippingRule(ruleData);

      if (!result.ok) {
        throw new Error(result.error || 'Error al crear regla de envío');
      }

      // Recargar la lista de reglas
      await loadShippingRules();

      return { ok: true };
    } catch (err) {
      console.error('Error creando regla de envío:', err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadShippingRules]);

  // Actualizar una regla existente
  const handleUpdateShippingRule = useCallback(async (ruleId, ruleData) => {
    if (!ruleId) {
      return { ok: false, error: 'ID de regla no proporcionado' };
    }

    setLoading(true);
    setError(null);

    try {
      const result = await updateShippingRule(ruleId, ruleData);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar regla de envío');
      }

      // Recargar la lista de reglas
      await loadShippingRules();

      return { ok: true };
    } catch (err) {
      console.error(`Error actualizando regla de envío ${ruleId}:`, err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadShippingRules]);

  // Eliminar una regla
  const handleDeleteShippingRule = useCallback(async (ruleId) => {
    if (!ruleId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await deleteShippingRule(ruleId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar regla de envío');
      }

      // Recargar la lista de reglas
      await loadShippingRules();
    } catch (err) {
      console.error(`Error eliminando regla de envío ${ruleId}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [loadShippingRules]);

  // Importar reglas desde CSV
  const handleImportShippingRules = useCallback(async (csvText, strategy = 'skip') => {
    setLoading(true);
    setError(null);

    try {
      const result = await importShippingRulesFromCSV(csvText, strategy);

      if (!result.ok) {
        throw new Error(result.error || 'Error al importar reglas de envío');
      }

      // Recargar la lista de reglas
      await loadShippingRules();

      return { ok: true, data: result.data };
    } catch (err) {
      console.error('Error importando reglas de envío:', err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadShippingRules]);

  // Filtrar reglas por término de búsqueda
  const handleFilterShippingRules = useCallback((searchTerm) => {
    if (!searchTerm) {
      setFilteredRules(shippingRules);
      return;
    }

    const normalizedTerm = searchTerm.toLowerCase().trim();

    const filtered = shippingRules.filter(rule =>
      rule.zipcode.toLowerCase().includes(normalizedTerm) ||
      rule.zona.toLowerCase().includes(normalizedTerm)
    );

    setFilteredRules(filtered);
  }, [shippingRules]);

  return {
    // Estado
    shippingRules: filteredRules,
    allShippingRules: shippingRules,
    selectedRule,
    loading,
    error,

    // Funciones
    loadShippingRules,
    getShippingRuleById: fetchShippingRuleById,
    createShippingRule: handleCreateShippingRule,
    updateShippingRule: handleUpdateShippingRule,
    deleteShippingRule: handleDeleteShippingRule,
    importShippingRules: handleImportShippingRules,
    filterShippingRules: handleFilterShippingRules
  };
};