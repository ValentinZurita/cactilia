/**
 * API para gestionar las operaciones CRUD de reglas de envío
 * Centraliza todas las operaciones con Firebase Firestore
 */

import { db } from '../../../../config/firebase/firebaseConfig';
import { 
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc, 
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';

/**
 * Referencia a la colección de reglas de envío en Firestore
 */
const shippingRulesCollection = collection(db, 'reglas_envio');

/**
 * Obtiene todas las reglas de envío
 * @returns {Promise<Array>} Lista de reglas de envío
 */
export const fetchShippingRules = async () => {
  try {
    const q = query(shippingRulesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error);
    throw new Error(`Error al obtener reglas de envío: ${error.message}`);
  }
};

/**
 * Obtiene una regla de envío específica por su ID
 * @param {string} id - Identificador de la regla
 * @returns {Promise<Object>} Regla de envío
 */
export const fetchShippingRuleById = async (id) => {
  try {
    const docRef = doc(shippingRulesCollection, id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`La regla de envío con ID ${id} no existe`);
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error(`Error al obtener regla de envío ${id}:`, error);
    throw new Error(`Error al obtener regla de envío: ${error.message}`);
  }
};

/**
 * Crea una nueva regla de envío
 * @param {Object} rule - Datos de la regla de envío
 * @returns {Promise<Object>} Regla creada con su ID
 */
export const createShippingRule = async (rule) => {
  try {
    // Validar que la regla tenga los campos requeridos
    if (!rule.zona) {
      throw new Error('El nombre de la zona es obligatorio');
    }
    
    if (!rule.zipcodes || rule.zipcodes.length === 0) {
      throw new Error('Debe seleccionar al menos un área de cobertura');
    }
    
    // Agregar timestamps
    const ruleWithTimestamps = {
      ...rule,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(shippingRulesCollection, ruleWithTimestamps);
    
    return {
      id: docRef.id,
      ...rule
    };
  } catch (error) {
    console.error('Error al crear regla de envío:', error);
    throw new Error(`Error al crear regla de envío: ${error.message}`);
  }
};

/**
 * Actualiza una regla de envío existente
 * @param {string} id - Identificador de la regla
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise<Object>} Regla actualizada
 */
export const updateShippingRule = async (id, updates) => {
  try {
    const docRef = doc(shippingRulesCollection, id);
    
    // Verificar que la regla existe
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`La regla de envío con ID ${id} no existe`);
    }
    
    // Agregar timestamp de actualización
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, updatesWithTimestamp);
    
    return {
      id,
      ...docSnap.data(),
      ...updates
    };
  } catch (error) {
    console.error(`Error al actualizar regla de envío ${id}:`, error);
    throw new Error(`Error al actualizar regla de envío: ${error.message}`);
  }
};

/**
 * Elimina una regla de envío
 * @param {string} id - Identificador de la regla
 * @returns {Promise<void>}
 */
export const deleteShippingRule = async (id) => {
  try {
    const docRef = doc(shippingRulesCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error al eliminar regla de envío ${id}:`, error);
    throw new Error(`Error al eliminar regla de envío: ${error.message}`);
  }
};

/**
 * Cambia el estado (activo/inactivo) de una regla de envío
 * @param {string} id - Identificador de la regla
 * @param {boolean} active - Nuevo estado
 * @returns {Promise<Object>} Regla actualizada
 */
export const toggleShippingRuleStatus = async (id, active) => {
  try {
    const docRef = doc(shippingRulesCollection, id);
    
    await updateDoc(docRef, { 
      activo: active,
      updatedAt: serverTimestamp() 
    });
    
    return {
      id,
      activo: active
    };
  } catch (error) {
    console.error(`Error al cambiar estado de regla ${id}:`, error);
    throw new Error(`Error al cambiar estado de regla: ${error.message}`);
  }
}; 