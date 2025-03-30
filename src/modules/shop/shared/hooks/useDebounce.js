import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores (útil para búsquedas, etc.)
 *
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Tiempo de espera en ms
 * @returns {any} Valor con debounce
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};