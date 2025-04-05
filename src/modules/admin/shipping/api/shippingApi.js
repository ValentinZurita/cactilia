/**
 * API para acceder a las reglas de envío en Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig.js'
import { CacheService } from '../../../../utils/CacheService.js'

// Colección de reglas de envío en Firestore - IMPORTANTE usar zonas_envio
const SHIPPING_RULES_COLLECTION = 'zonas_envio';

/**
 * Obtiene todas las reglas de envío
 * @param {boolean} onlyActive - Si solo se deben obtener reglas activas
 * @returns {Promise<Array>} Lista de reglas de envío
 */
export const fetchShippingRules = async (onlyActive = true) => {
  try {
    // Usar caché para mejorar rendimiento
    return await CacheService.getOrFetch('shipping_rules', async () => {
      let shippingQuery;

      if (onlyActive) {
        shippingQuery = query(
          collection(FirebaseDB, SHIPPING_RULES_COLLECTION),
          where('activo', '==', true)
        );
      } else {
        shippingQuery = collection(FirebaseDB, SHIPPING_RULES_COLLECTION);
      }

      const querySnapshot = await getDocs(shippingQuery);

      const rules = [];
      querySnapshot.forEach(doc => {
        rules.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return rules;
    }, 5); // Caché por 5 minutos
  } catch (error) {
    console.error('Error al cargar reglas de envío:', error);
    throw error;
  }
};

/**
 * Obtiene una regla de envío por su ID
 * @param {string} ruleId - ID de la regla de envío
 * @returns {Promise<Object>} Regla de envío
 */
export const fetchShippingRuleById = async (ruleId) => {
  if (!ruleId) return null;

  try {
    console.log(`🔍 Buscando regla de envío con ID: ${ruleId}`);
    
    // Usar caché para mejorar rendimiento
    return await CacheService.getOrFetch(`shipping_rule_${ruleId}`, async () => {
      // Intentar primero en zonas_envio (la colección principal)
      let docRef = doc(FirebaseDB, 'zonas_envio', ruleId);
      let docSnap = await getDoc(docRef);

      // Si no se encuentra, intentar en reglas_envio (compatibilidad)
      if (!docSnap.exists()) {
        console.log(`Regla no encontrada en zonas_envio, intentando en reglas_envio: ${ruleId}`);
        docRef = doc(FirebaseDB, 'reglas_envio', ruleId);
        docSnap = await getDoc(docRef);
      }

      if (!docSnap.exists()) {
        console.warn(`⚠️ Regla de envío no encontrada: ${ruleId}`);
        return null;
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data()
      };
      
      // Validar que tenga la estructura correcta
      if (!data.opciones_mensajeria || !Array.isArray(data.opciones_mensajeria) || data.opciones_mensajeria.length === 0) {
        console.warn(`⚠️ Regla ${ruleId} no tiene opciones de mensajería válidas`);
        data.opciones_mensajeria = [{
          nombre: "Envío Estándar",
          label: "Envío Estándar",
          precio: "200",
          tiempo_entrega: "3-5 días",
          configuracion_paquetes: {
            peso_maximo_paquete: 20,
            costo_por_kg_extra: 10,
            maximo_productos_por_paquete: 10
          }
        }];
      } else {
        // Asegurar que cada opción tenga configuración de paquetes
        data.opciones_mensajeria = data.opciones_mensajeria.map(option => {
          if (!option.configuracion_paquetes) {
            return {
              ...option,
              configuracion_paquetes: {
                peso_maximo_paquete: 20,
                costo_por_kg_extra: 10,
                maximo_productos_por_paquete: 10
              }
            };
          }
          return option;
        });
      }
      
      console.log(`✅ Regla encontrada: ${data.zona || ruleId}`);
      return data;
    }, 5); // Caché por 5 minutos
  } catch (error) {
    console.error(`Error al cargar regla de envío ${ruleId}:`, error);
    return null;
  }
};

/**
 * Obtiene reglas de envío aplicables para un código postal
 * @param {string} zipCode - Código postal
 * @returns {Promise<Array>} Reglas de envío aplicables
 */
export const fetchShippingRulesByZipCode = async (zipCode) => {
  if (!zipCode) return [];

  try {
    // Para esta implementación simplificada, filtramos en el cliente
    const allRules = await fetchShippingRules(true);

    // Filtrar reglas aplicables al código postal
    return allRules.filter(rule => {
      // Si la regla es nacional (sin códigos específicos)
      if (!rule.zipcodes || rule.zipcodes.length === 0) {
        return true;
      }

      // Si la regla incluye 'nacional'
      if (rule.zipcodes.includes('nacional')) {
        return true;
      }

      // Si la regla incluye el código postal exacto
      if (rule.zipcodes.includes(zipCode)) {
        return true;
      }

      // Si la regla incluye el estado (formato: "estado_X")
      // Nota: En una implementación real, aquí habría una lógica
      // para determinar a qué estado pertenece el código postal

      return false;
    });
  } catch (error) {
    console.error(`Error al buscar reglas para código postal ${zipCode}:`, error);
    return [];
  }
};

/**
 * Obtiene la regla de envío nacional por defecto
 * @returns {Promise<Object>} Regla de envío nacional
 */
export const fetchDefaultNationalRule = async () => {
  try {
    const allRules = await fetchShippingRules(true);

    // Buscar regla nacional (ID conocido - según tu Firestore)
    const knownNationalId = 'fyfkhfITejBjMASFCMZ2';
    const nationalRule = allRules.find(rule =>
      rule.id === knownNationalId ||
      (rule.zipcodes && rule.zipcodes.includes('nacional'))
    );

    if (nationalRule) {
      return nationalRule;
    }

    // Si no hay regla nacional, crear una por defecto
    return {
      id: 'default-national',
      zona: 'Envío Nacional',
      activo: true,
      zipcodes: ['nacional'],
      opciones_mensajeria: [{
        nombre: "Correos de México",
        label: "Básico",
        precio: 200,
        tiempo_entrega: "3-10 días",
        configuracion_paquetes: {
          peso_maximo_paquete: 1,
          costo_por_kg_extra: 100,
          maximo_productos_por_paquete: 1
        }
      }]
    };
  } catch (error) {
    console.error('Error al obtener regla nacional por defecto:', error);
    throw error;
  }
};