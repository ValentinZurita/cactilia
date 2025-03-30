import { useCallback, useEffect, useState, useRef } from 'react';

export const useAsync = (asyncFn, immediate = false, deps = []) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Usar una referencia para la función asíncrona
  const asyncFnRef = useRef(asyncFn);

  // Actualizar la referencia cuando cambie la función
  useEffect(() => {
    asyncFnRef.current = asyncFn;
  }, [asyncFn]);

  // Usar una referencia para controlar si ya se ejecutó inicialmente
  const hasRunRef = useRef(false);

  // Función para ejecutar la operación asíncrona
  const execute = useCallback(async (...params) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      // Usar la referencia en lugar de la dependencia directa
      const result = await asyncFnRef.current(...params);

      // Comprobar si el resultado tiene un formato específico con propiedad 'ok'
      if (result && typeof result === 'object' && 'ok' in result) {
        if (result.ok) {
          setData(result.data);
          setStatus('success');
          return result;
        } else {
          throw new Error(result.error || 'Error en la operación');
        }
      } else {
        // Resultado estándar
        setData(result);
        setStatus('success');
        return result;
      }
    } catch (err) {
      setError(err);
      setStatus('error');
      console.error('Error en operación async:', err);
      throw err;
    }
  }, []); // Sin dependencias directas para evitar re-renders

  // Ejecutar inmediatamente si se solicita
  useEffect(() => {
    // Control para evitar ejecuciones infinitas
    if (immediate && !hasRunRef.current) {
      hasRunRef.current = true;
      execute().catch(error => {
        console.error('Error en ejecución inmediata:', error);
      });
    }

    // Reset del flag cuando cambien las dependencias reales
    return () => {
      if (deps.length > 0) {
        hasRunRef.current = false;
      }
    };
  }, deps); // Usar deps directamente, no dentro de un spread

  return {
    execute,
    status,
    data,
    error,
    isIdle: status === 'idle',
    isPending: status === 'pending',
    isSuccess: status === 'success',
    isError: status === 'error',
    reset: () => {
      setStatus('idle');
      setData(null);
      setError(null);
      // También resetear el flag de ejecución
      hasRunRef.current = false;
    }
  };
};