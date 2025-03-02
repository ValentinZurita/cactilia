import { useState, useEffect, useCallback } from 'react';

/**
 * Hook genérico para manejar colecciones de elementos (direcciones, métodos de pago, etc.)
 *
 * @param {Object} options - Opciones de configuración
 * @param {Array} options.initialItems - Elementos iniciales
 * @param {Function} options.fetchItems - Función para obtener elementos (puede ser null)
 * @param {string} options.itemType - Tipo de elemento (para mensajes)
 * @param {Function} options.validateItem - Función para validar un elemento antes de agregarlo/editarlo
 * @returns {Object} - Métodos y estado para manejar la colección
 */
export const useItemsCollection = ({
                                     initialItems = [],
                                     fetchItems = null,
                                     itemType = 'elemento',
                                     validateItem = () => ({ valid: true })
                                   }) => {
  // Estados
  const [items, setItems] = useState(initialItems);
  const [loading, setLoading] = useState(!!fetchItems);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Cargar elementos si se proporciona una función para ello
  useEffect(() => {
    if (fetchItems) {
      loadItems();
    }
  }, []);

  // Cargar elementos desde la fuente de datos
  const loadItems = useCallback(async () => {
    if (!fetchItems) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchItems();
      if (result.ok) {
        setItems(result.data || []);
      } else {
        throw new Error(result.error || `Error al cargar ${itemType}s`);
      }
    } catch (err) {
      console.error(`Error cargando ${itemType}s:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchItems, itemType]);

  // Establecer un elemento como predeterminado
  const setDefaultItem = useCallback((itemId) => {
    if (window.confirm(`¿Establecer este ${itemType} como predeterminado?`)) {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          isDefault: item.id === itemId
        }))
      );
      return true;
    }
    return false;
  }, [itemType]);

  // Eliminar un elemento
  const deleteItem = useCallback((itemId) => {
    if (window.confirm(`¿Estás seguro de eliminar este ${itemType}?`)) {
      setItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return true;
    }
    return false;
  }, [itemType]);

  // Editar un elemento existente
  const editItem = useCallback((itemId, newData) => {
    const validation = validateItem(newData);
    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, ...newData } : item
      )
    );
    return { ok: true };
  }, [validateItem]);

  // Agregar un nuevo elemento
  const addItem = useCallback((newItem) => {
    const validation = validateItem(newItem);
    if (!validation.valid) {
      return { ok: false, error: validation.error };
    }

    // Generar un ID único si no se proporciona
    const itemWithId = {
      ...newItem,
      id: newItem.id || `item-${Date.now()}`
    };

    setItems(prevItems => [...prevItems, itemWithId]);
    return { ok: true, id: itemWithId.id };
  }, [validateItem]);

  // Seleccionar un elemento para editar
  const selectItem = useCallback((itemId) => {
    const item = items.find(item => item.id === itemId);
    setSelectedItem(item || null);
    return item;
  }, [items]);

  // Retornar todos los métodos y estados
  return {
    items,
    loading,
    error,
    selectedItem,
    setDefaultItem,
    deleteItem,
    editItem,
    addItem,
    selectItem,
    loadItems,
    setItems,
    setLoading,
    setError
  };
};