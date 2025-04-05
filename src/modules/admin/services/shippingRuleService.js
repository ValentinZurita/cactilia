/**
 * Servicio para integrar las reglas de envío con otros módulos.
 * Este servicio proporciona métodos para obtener reglas de envío que pueden
 * ser utilizadas por el formulario de productos y otras partes de la aplicación.
 */

import { FirebaseDB } from '../../../config/firebase/firebaseConfig';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

// Regla de envío por defecto para fallback
const DEFAULT_SHIPPING_RULE = {
  id: 'default-rule',
  zona: 'Envío estándar',
  activo: true,
  opciones_mensajeria: [
    {
      nombre: 'Envío Estándar',
      label: 'Envío Estándar (3-5 días)',
      precio: '50',
      tiempo_entrega: '3-5 días',
      configuracion_paquetes: {
        peso_maximo_paquete: 20,
        costo_por_kg_extra: 10,
        maximo_productos_por_paquete: 10
      }
    }
  ]
};

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
    
    // Si no hay reglas, devolver una por defecto
    if (rules.length === 0) {
      console.log('fetchShippingRules: No rules found, returning default rule');
      return { 
        ok: true, 
        data: [DEFAULT_SHIPPING_RULE], 
        error: null 
      };
    }
    
    // Filtrar solo reglas activas y ordenarlas por nombre de zona
    const activeRules = rules
      .filter(rule => rule.activo !== false)
      .sort((a, b) => (a.zona || '').localeCompare(b.zona || ''));
    
    // Si después de filtrar no hay reglas activas, devolver una por defecto
    if (activeRules.length === 0) {
      console.log('fetchShippingRules: No active rules found, returning default rule');
      return { 
        ok: true, 
        data: [DEFAULT_SHIPPING_RULE], 
        error: null 
      };
    }
    
    return { 
      ok: true, 
      data: activeRules, 
      error: null 
    };
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error);
    return { 
      ok: false, 
      data: [DEFAULT_SHIPPING_RULE], 
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
    console.log(`🔍 fetchShippingRuleById: Buscando regla con ID "${id}"`);
    
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.warn('⚠️ fetchShippingRuleById: ID de regla no válido, devolviendo regla por defecto');
      return { 
        ok: true, 
        data: {
          ...DEFAULT_SHIPPING_RULE,
          id: 'default-rule'
        }, 
        error: null 
      };
    }
    
    // Try reglas_envio first
    console.log(`🔍 Buscando en colección reglas_envio con ID: ${id}`);
    let ruleRef = doc(FirebaseDB, 'reglas_envio', id);
    let ruleDoc = await getDoc(ruleRef);
    
    // If not found in reglas_envio, try zonas_envio
    if (!ruleDoc.exists()) {
      console.log(`🔍 Regla no encontrada en reglas_envio, intentando en zonas_envio con ID: ${id}`);
      ruleRef = doc(FirebaseDB, 'zonas_envio', id);
      ruleDoc = await getDoc(ruleRef);
    }
    
    if (!ruleDoc.exists()) {
      console.warn(`❌ Regla de envío ${id} no encontrada en ninguna colección, devolviendo regla por defecto`);
      
      // Log específico para reglas no encontradas
      console.log(`=== ⚠️ REGLA NO ENCONTRADA ===`, {
        id,
        colecciones_buscadas: ['reglas_envio', 'zonas_envio'],
        usando_regla_por_defecto: true
      });
      
      return { 
        ok: true, 
        data: {
          ...DEFAULT_SHIPPING_RULE,
          id: id // Mantener el ID original para referencia
        }, 
        error: null 
      };
    }
    
    const ruleData = {
      id: ruleDoc.id,
      ...ruleDoc.data()
    };
    
    // Log específico para reglas encontradas
    console.log(`=== ✅ REGLA ENCONTRADA ===`, {
      id: ruleData.id,
      zona: ruleData.zona,
      opciones: ruleData.opciones_mensajeria?.length || 0,
      precios: ruleData.opciones_mensajeria?.map(o => o.precio) || [],
      configuracion: ruleData.opciones_mensajeria?.map(o => o.configuracion_paquetes) || [],
      activo: ruleData.activo !== false ? 'Sí' : 'No',
      zipcodes: ruleData.zipcodes?.length ? `${ruleData.zipcodes.length} códigos` : 'Sin códigos postales'
    });
    
    // Verificar que la regla tenga opciones de mensajería
    if (!ruleData.opciones_mensajeria || ruleData.opciones_mensajeria.length === 0) {
      console.warn(`⚠️ Regla de envío ${id} no tiene opciones de mensajería, añadiendo opciones por defecto`);
      ruleData.opciones_mensajeria = DEFAULT_SHIPPING_RULE.opciones_mensajeria;
    }
    
    // Verificar que cada opción tenga configuración de paquetes
    ruleData.opciones_mensajeria = ruleData.opciones_mensajeria.map(opcion => {
      if (!opcion.configuracion_paquetes) {
        console.warn(`⚠️ Opción de mensajería "${opcion.nombre}" no tiene configuración de paquetes, añadiendo por defecto`);
        return {
          ...opcion,
          configuracion_paquetes: DEFAULT_SHIPPING_RULE.opciones_mensajeria[0].configuracion_paquetes
        };
      }
      return opcion;
    });
    
    // Actualizar estatus en caso de no existir
    if (ruleData.activo === undefined) {
      console.warn(`⚠️ Regla de envío ${id} no tiene campo activo, estableciendo por defecto como activa`);
      ruleData.activo = true;
    }
    
    return {
      ok: true,
      data: ruleData,
      error: null
    };
  } catch (error) {
    console.error(`❌ Error al obtener regla de envío ${id}:`, error);
    return {
      ok: true, // Cambiado a true para siempre devolver una regla aunque sea por defecto
      data: {
        ...DEFAULT_SHIPPING_RULE,
        id: id // Mantener el ID original para referencia
      },
      error: error.message || `Error al obtener regla de envío ${id}`
    };
  }
};
