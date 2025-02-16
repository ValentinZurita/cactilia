import { useEffect, useState } from 'react';


/**
 * Hook that returns a list of items and a loading state.
 *
 * @param {Function} fetchFunction - The function that fetches the items
 *
 * @returns {{items: *[], loading: boolean}}
 *
 * @constructor
 *
 * @example
 * const { items, loading } = useDynamicList(getCategories);
 * const { items, loading } = useDynamicList(getProducts);
 */


export const useDynamicList = (fetchFunction) => {

  // States
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load items
  useEffect(() => {

    const loadItems = async () => {

      try {

        const { ok, data } = await fetchFunction();

        if (ok) {
          setItems(data);
        }

        else {
          alert('Error al cargar los datos');
        }

      } catch (error) {
        console.error('Error cargando datos:', error);
        alert('Error al cargar datos');

      } finally {
        setLoading(false);
      }

    };

    loadItems();

  }, [fetchFunction]);

  return { items, loading };

};