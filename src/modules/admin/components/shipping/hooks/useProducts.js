import { useState, useCallback } from 'react';
import { searchProducts as searchProductsService } from '../../../services/productService';

/**
 * Hook personalizado para buscar y gestionar productos.
 * Orientado principalmente a la selección de productos para restricciones
 * en las reglas de envío.
 *
 * @returns {Object} - Estado y funciones para gestionar productos
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar productos por término
  const searchProducts = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await searchProductsService(searchTerm);

      if (!result.ok) {
        throw new Error(result.error || 'Error al buscar productos');
      }

      setProducts(result.data);
    } catch (err) {
      console.error('Error buscando productos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    searchProducts
  };
};