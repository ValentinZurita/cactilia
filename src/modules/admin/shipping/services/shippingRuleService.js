import firebase from 'firebase/app';
import 'firebase/firestore';

/**
 * Obtiene todas las reglas de envío desde Firestore
 * @returns {Promise<Object>} Resultado con reglas de envío
 */
export const getAllShippingRules = async () => {
  try {
    try {
      const rulesSnapshot = await firebase.firestore()
        .collection('shipping_rules')
        .where('activo', '==', true)
        .get();
      
      const rules = rulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return { ok: true, data: rules };
    } catch (permissionError) {
      console.warn('Error de permisos al obtener reglas de envío:', permissionError);
      
      // Proporcionar reglas de envío para usuarios no autenticados
      const sampleRules = [
        {
          id: 'sample-rule-1',
          zona: 'Nacional',
          activo: true,
          envio_gratis: false,
          opciones_mensajeria: [
            {
              nombre: "Envío Estándar",
              label: "Estándar",
              precio: 150,
              tiempo_entrega: "3-5 días",
              configuracion_paquetes: {
                peso_maximo_paquete: 5,
                costo_por_kg_extra: 50,
                maximo_productos_por_paquete: 3
              }
            }
          ]
        }
      ];
      
      return { 
        ok: true, 
        data: sampleRules,
        isPublicFallback: true 
      };
    }
  } catch (error) {
    console.error('Error al obtener reglas de envío:', error);
    return { ok: false, error };
  }
};

/**
 * Obtiene una regla de envío por su ID
 * @param {string} ruleId - ID de la regla a obtener
 * @returns {Promise<Object>} Resultado con la regla de envío
 */
export const getShippingRuleById = async (ruleId) => {
  try {
    const ruleDoc = await firebase.firestore()
      .collection('shipping_rules')
      .doc(ruleId)
      .get();
    
    if (!ruleDoc.exists) {
      return { ok: false, error: 'Regla no encontrada' };
    }
    
    return { 
      ok: true, 
      data: {
        id: ruleDoc.id,
        ...ruleDoc.data()
      }
    };
  } catch (error) {
    console.error(`Error al obtener regla ${ruleId}:`, error);
    return { ok: false, error };
  }
};

/**
 * Obtiene la regla de envío nacional (por defecto)
 * @returns {Promise<Object>} Resultado con la regla nacional
 */
export const getNationalShippingRule = async () => {
  try {
    // Primero intentamos buscar por el ID conocido
    const knownNationalId = 'fyfkhfITejBjMASFCMZ2';
    const byIdResult = await getShippingRuleById(knownNationalId);
    
    if (byIdResult.ok) {
      return byIdResult;
    }
    
    // Si no encontramos por ID, buscamos por zona "Nacional"
    const rulesSnapshot = await firebase.firestore()
      .collection('shipping_rules')
      .where('zona', '==', 'Nacional')
      .where('activo', '==', true)
      .limit(1)
      .get();
    
    if (rulesSnapshot.empty) {
      // Si no hay regla nacional, retornar una regla por defecto
      const defaultRule = {
        id: 'default-national',
        zona: 'Nacional',
        activo: true,
        envio_gratis: false,
        envio_variable: {
          aplica: true,
          costo_por_producto_extra: 0,
          envio_gratis_monto_minimo: "500"
        },
        opciones_mensajeria: [
          {
            nombre: "Correos de México",
            label: "Básico",
            precio: 200,
            tiempo_entrega: "3-10 días",
            minDays: 3,
            maxDays: 10,
            configuracion_paquetes: {
              maximo_productos_por_paquete: 1,
              peso_maximo_paquete: 1,
              costo_por_kg_extra: 100
            }
          },
          {
            nombre: "Correos de México",
            label: "Express",
            precio: 350,
            tiempo_entrega: "1-3 días",
            minDays: 1,
            maxDays: 3,
            configuracion_paquetes: {
              maximo_productos_por_paquete: 1,
              peso_maximo_paquete: 1,
              costo_por_kg_extra: 100
            }
          }
        ]
      };
      
      return { ok: true, data: defaultRule };
    }
    
    const rule = {
      id: rulesSnapshot.docs[0].id,
      ...rulesSnapshot.docs[0].data()
    };
    
    return { ok: true, data: rule };
  } catch (error) {
    console.error('Error al obtener regla nacional:', error);
    return { ok: false, error };
  }
}; 