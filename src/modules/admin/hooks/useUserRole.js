import { useState, useEffect } from 'react';
import { getUserRole } from '../../../firebase/authUtils';
import { FirebaseAuth } from '../../../firebase/firebaseConfig';

/**
 * Hook personalizado para obtener y observar el rol del usuario actual
 * @returns {Object} { role, loading, error }
 *
 * @example
 * const { role, loading } = useUserRole();
 * if (loading) return <Spinner />;
 * if (role === 'superadmin') { ... }
 */
export const useUserRole = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Función para obtener el rol
    const fetchRole = async () => {
      try {
        setLoading(true);
        const userRole = await getUserRole();
        setRole(userRole);
        setError(null);
      } catch (err) {
        console.error('Error obteniendo rol:', err);
        setError(err.message);
        setRole('visitor'); // Por defecto, si hay error, asumimos visitante
      } finally {
        setLoading(false);
      }
    };

    // Obtener rol inicial
    fetchRole();

    // Configurar listener para cambios de autenticación
    const unsubscribe = FirebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        fetchRole();
      } else {
        setRole('visitor');
        setLoading(false);
      }
    });

    // Limpiar listener
    return () => unsubscribe();
  }, []);

  return { role, loading, error };
};