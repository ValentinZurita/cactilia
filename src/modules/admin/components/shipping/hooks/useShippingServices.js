import { useState, useEffect, useCallback } from 'react';
import { getShippingServices, createDefaultShippingServices } from '../services/shippingService';

/**
 * Hook personalizado para gestionar servicios de envío disponibles.
 * Crea servicios predeterminados si no existen.
 *
 * @returns {Object} - Estado y funciones para gestionar servicios de envío
 */
export const useShippingServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar servicios
  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener servicios existentes
      const result = await getShippingServices();

      if (!result.ok) {
        throw new Error(result.error || 'Error al cargar servicios de envío');
      }

      // Si no hay servicios, crear los predeterminados
      if (result.data.length === 0) {
        console.log('No se encontraron servicios de envío, creando servicios predeterminados...');
        const defaultServicesResult = await createDefaultShippingServices();

        if (defaultServicesResult.ok) {
          // Volver a cargar los servicios después de crear los predeterminados
          const refreshResult = await getShippingServices();
          if (refreshResult.ok) {
            setServices(refreshResult.data);
          } else {
            throw new Error(refreshResult.error);
          }
        } else {
          throw new Error(defaultServicesResult.error);
        }
      } else {
        // Usar los servicios existentes
        setServices(result.data);
      }
    } catch (err) {
      console.error('Error cargando servicios de envío:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar servicios al montar el componente
  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    error,
    refreshServices: loadServices
  };
};