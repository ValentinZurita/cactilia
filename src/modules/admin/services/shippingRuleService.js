/**
 * Servicio para integrar las reglas de envío con otros módulos.
 * Este servicio proporciona métodos para obtener reglas de envío que pueden
 * ser utilizadas por el formulario de productos y otras partes de la aplicación.
 */

import { FirebaseDB } from '../../../config/firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * Obtiene todas las reglas de envío activas
 * @returns {Promise<{ok: boolean, data: Array, error: null|string}>}
 */
export const fetchShippingRules = async () => {
  try {
    console.log('fetchShippingRules: Checking collections');
    
    // Try reglas_envio first
    const rulesCollection = collection(FirebaseDB, 'reglas_envio');
    let snapshot = await getDocs(rulesCollection);
    
    // If no rules found, try zonas_envio as fallback
    if (snapshot.empty) {
      console.log('fetchShippingRules: No rules found in reglas_envio, trying zonas_envio');
      const zonasCollection = collection(FirebaseDB, 'zonas_envio');
      snapshot = await getDocs(zonasCollection);
    }
    
    // Convertir documentos a objetos con id
    const rules = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('fetchShippingRules: Found rules', rules);
    
    // Filtrar solo reglas activas y ordenarlas por nombre de zona
    const activeRules = rules
      .filter(rule => rule.activo !== false)
      .sort((a, b) => (a.zona || '').localeCompare(b.zona || ''));
    
    return { 
      ok: true, 
      data: activeRules, 
      error: null 
    };
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error);
    return { 
      ok: false, 
      data: [], 
      error: error.message || 'Error al obtener reglas de envío' 
    };
  }
};

/**
 * Obtiene una regla de envío específica por su ID
 * @param {string} id - ID de la regla de envío
 * @returns {Promise<{ok: boolean, data: Object|null, error: null|string}>}
 */
export const fetchShippingRuleById = async (id) => {
  try {
    if (!id) {
      return { ok: false, data: null, error: 'ID de regla no proporcionado' };
    }
    
    // Try reglas_envio first
    let ruleRef = doc(FirebaseDB, 'reglas_envio', id);
    let ruleDoc = await getDoc(ruleRef);
    
    // If not found in reglas_envio, try zonas_envio
    if (!ruleDoc.exists()) {
      console.log(`Shipping rule not found in reglas_envio, trying zonas_envio for ID: ${id}`);
      ruleRef = doc(FirebaseDB, 'zonas_envio', id);
      ruleDoc = await getDoc(ruleRef);
    }
    
    if (!ruleDoc.exists()) {
      return { ok: false, data: null, error: 'Regla de envío no encontrada' };
    }
    
    return {
      ok: true,
      data: {
        id: ruleDoc.id,
        ...ruleDoc.data()
      },
      error: null
    };
  } catch (error) {
    console.error(`Error al obtener regla de envío ${id}:`, error);
    return {
      ok: false,
      data: null,
      error: error.message || `Error al obtener regla de envío ${id}`
    };
  }
};
