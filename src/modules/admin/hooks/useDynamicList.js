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
        console.log('useDynamicList: Calling fetchFunction');
        const result = await fetchFunction();
        console.log('useDynamicList: Got result', result);

        // Handle different possible return formats
        if (result) {
          if (result.ok && Array.isArray(result.data)) {
            // Standard format: { ok: true, data: [...] }
            setItems(result.data);
          } else if (Array.isArray(result)) {
            // Direct array format
            setItems(result);
          } else {
            console.error('useDynamicList: Unexpected data format', result);
            setItems([]);
          }
        } else {
          console.error('useDynamicList: No result returned');
          setItems([]);
        }
      } catch (error) {
        console.error('useDynamicList: Error loading data:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }

    };

    loadItems();

  }, [fetchFunction]);

  return { items, loading };

};