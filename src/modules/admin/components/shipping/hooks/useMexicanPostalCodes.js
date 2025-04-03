import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  limit,
  orderBy
} from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig';

// Constantes para colecciones
const ESTADOS_COLLECTION = 'estados_mx';
const CODIGOS_POSTALES_COLLECTION = 'codigos_postales_mx';
const SHIPPING_ZONES_COLLECTION = 'zonas_envio';

/**
 * Hook personalizado para manejar códigos postales mexicanos.
 * Proporciona funciones para validar, buscar y agrupar códigos postales.
 */
export const useMexicanPostalCodes = () => {
  const [states, setStates] = useState([]);
  const [zipsByState, setZipsByState] = useState({});
  const [zipDetails, setZipDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar estados de México
  const loadStates = useCallback(async () => {
    if (states.length > 0) return; // Ya están cargados

    setLoading(true);
    setError(null);

    try {
      const estadosRef = collection(FirebaseDB, ESTADOS_COLLECTION);
      const querySnapshot = await getDocs(query(estadosRef, orderBy('nombre')));

      const loadedStates = [];
      querySnapshot.forEach((doc) => {
        loadedStates.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setStates(loadedStates);
    } catch (err) {
      console.error('Error cargando estados:', err);
      setError('Error al cargar los estados de México');
    } finally {
      setLoading(false);
    }
  }, [states.length]);

  // Obtener códigos postales de un estado específico
  const getZipsByState = useCallback(async (stateName) => {
    setLoading(true);
    setError(null);

    try {
      // Verificar si ya tenemos los códigos de este estado
      if (zipsByState[stateName]) {
        return { ok: true, data: zipsByState[stateName] };
      }

      // Buscar códigos postales de este estado
      const cpRef = collection(FirebaseDB, CODIGOS_POSTALES_COLLECTION);
      const q = query(
        cpRef,
        where('estado', '==', stateName),
        limit(1000) // Limitar para evitar sobrecarga
      );

      const querySnapshot = await getDocs(q);

      const zips = [];
      querySnapshot.forEach((doc) => {
        zips.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Guardar en estado local
      setZipsByState(prev => ({
        ...prev,
        [stateName]: zips
      }));

      return { ok: true, data: zips };
    } catch (err) {
      console.error(`Error obteniendo códigos de ${stateName}:`, err);
      setError(`Error al obtener códigos postales de ${stateName}`);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [zipsByState]);

  // Validar un código postal
  const validateZipCode = useCallback(async (zipCode) => {
    // Verificar formato
    if (!zipCode.match(/^\d{5}$/)) {
      return { valid: false, error: 'El código postal debe tener 5 dígitos' };
    }

    try {
      // Verificar si ya tenemos los detalles
      if (zipDetails[zipCode]) {
        return { valid: true, data: zipDetails[zipCode] };
      }

      // Buscar en Firebase
      const cpRef = doc(FirebaseDB, CODIGOS_POSTALES_COLLECTION, zipCode);
      const docSnap = await getDoc(cpRef);

      if (!docSnap.exists()) {
        return { valid: false, error: 'Código postal no encontrado' };
      }

      const data = docSnap.data();

      // Guardar en estado local
      setZipDetails(prev => ({
        ...prev,
        [zipCode]: data
      }));

      return { valid: true, data };
    } catch (err) {
      console.error(`Error validando código postal ${zipCode}:`, err);
      return { valid: false, error: err.message };
    }
  }, [zipDetails]);

  // Verificar si un código postal ya existe en alguna regla de envío
  const checkZipExists = useCallback(async (zipCode, excludeRuleId = null) => {
    try {
      const zonesRef = collection(FirebaseDB, SHIPPING_ZONES_COLLECTION);
      const q = query(
        zonesRef,
        where('codigos_postales', 'array-contains', zipCode),
        where('activo', '==', true)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { exists: false, rule: null };
      }

      // Revisar si alguno de los documentos no es el que estamos excluyendo
      let exists = false;
      let existingRule = null;

      querySnapshot.forEach((docSnap) => {
        if (!excludeRuleId || docSnap.id !== excludeRuleId) {
          exists = true;
          existingRule = {
            id: docSnap.id,
            ...docSnap.data()
          };
        }
      });

      return { exists, rule: existingRule };
    } catch (err) {
      console.error(`Error verificando existencia de ${zipCode}:`, err);
      // Si hay error, asumimos que no existe para permitir continuar
      return { exists: false, rule: null };
    }
  }, []);

  // Cargar estados al montar el componente
  useEffect(() => {
    loadStates();
  }, [loadStates]);

  return {
    states,
    zipsByState,
    zipDetails,
    loading,
    error,
    loadStates,
    getZipsByState,
    validateZipCode,
    checkZipExists
  };
};