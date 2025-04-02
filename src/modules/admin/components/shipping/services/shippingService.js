import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { FirebaseDB } from '../../../../../config/firebase/firebaseConfig';

// Colecciones de Firestore
const SHIPPING_ZONES_COLLECTION = 'zonas_envio';
const SHIPPING_SERVICES_COLLECTION = 'servicios_envio';

/**
 * Obtiene todas las reglas de envío.
 * @returns {Promise<{ok: boolean, data: Array, error: string}>}
 */
export const getShippingRules = async () => {
  try {
    const querySnapshot = await getDocs(collection(FirebaseDB, SHIPPING_ZONES_COLLECTION));

    const rules = [];
    querySnapshot.forEach((doc) => {
      rules.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      ok: true,
      data: rules
    };
  } catch (error) {
    console.error('Error obteniendo reglas de envío:', error);
    return {
      ok: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Obtiene una regla de envío por su ID.
 * @param {string} ruleId - ID de la regla
 * @returns {Promise<{ok: boolean, data: Object, error: string}>}
 */
export const getShippingRuleById = async (ruleId) => {
  try {
    const docRef = doc(FirebaseDB, SHIPPING_ZONES_COLLECTION, ruleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        ok: false,
        error: 'Regla de envío no encontrada'
      };
    }

    return {
      ok: true,
      data: {
        id: docSnap.id,
        ...docSnap.data()
      }
    };
  } catch (error) {
    console.error(`Error obteniendo regla de envío ${ruleId}:`, error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Crea una nueva regla de envío.
 * Verifica que no exista otra regla activa con el mismo código postal.
 *
 * @param {Object} ruleData - Datos de la regla de envío
 * @returns {Promise<{ok: boolean, id: string, error: string}>}
 */
export const createShippingRule = async (ruleData) => {
  try {
    // Verificar que el código postal no esté duplicado y activo
    if (ruleData.activo) {
      const duplicateCheck = await checkDuplicatePostalCode(ruleData.zipcode);

      if (duplicateCheck.exists) {
        return {
          ok: false,
          error: `Ya existe una regla activa para el código postal ${ruleData.zipcode}`
        };
      }
    }

    // Preparar datos con timestamps
    const dataToSave = {
      ...ruleData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Crear documento en Firestore
    const docRef = await addDoc(collection(FirebaseDB, SHIPPING_ZONES_COLLECTION), dataToSave);

    return {
      ok: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('Error creando regla de envío:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Actualiza una regla de envío existente.
 * Verifica que no exista otra regla activa con el mismo código postal.
 *
 * @param {string} ruleId - ID de la regla a actualizar
 * @param {Object} ruleData - Nuevos datos de la regla
 * @returns {Promise<{ok: boolean, error: string}>}
 */
export const updateShippingRule = async (ruleId, ruleData) => {
  try {
    // Verificar que el código postal no esté duplicado y activo
    if (ruleData.activo) {
      const duplicateCheck = await checkDuplicatePostalCode(ruleData.zipcode, ruleId);

      if (duplicateCheck.exists) {
        return {
          ok: false,
          error: `Ya existe una regla activa para el código postal ${ruleData.zipcode}`
        };
      }
    }

    // Preparar datos con timestamp de actualización
    const dataToUpdate = {
      ...ruleData,
      updatedAt: serverTimestamp()
    };

    // Actualizar documento en Firestore
    await updateDoc(doc(FirebaseDB, SHIPPING_ZONES_COLLECTION, ruleId), dataToUpdate);

    return {
      ok: true
    };
  } catch (error) {
    console.error(`Error actualizando regla de envío ${ruleId}:`, error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Elimina una regla de envío.
 * @param {string} ruleId - ID de la regla a eliminar
 * @returns {Promise<{ok: boolean, error: string}>}
 */
export const deleteShippingRule = async (ruleId) => {
  try {
    await deleteDoc(doc(FirebaseDB, SHIPPING_ZONES_COLLECTION, ruleId));

    return {
      ok: true
    };
  } catch (error) {
    console.error(`Error eliminando regla de envío ${ruleId}:`, error);
    return {
      ok: false,
      error: error.message
    };
  }
};

/**
 * Verifica si existe una regla activa con el mismo código postal.
 * @param {string} zipcode - Código postal a verificar
 * @param {string} excludeRuleId - ID de regla a excluir de la verificación (para actualizaciones)
 * @returns {Promise<{exists: boolean, rule: Object|null}>}
 */
const checkDuplicatePostalCode = async (zipcode, excludeRuleId = null) => {
  try {
    const q = query(
      collection(FirebaseDB, SHIPPING_ZONES_COLLECTION),
      where('zipcode', '==', zipcode),
      where('activo', '==', true)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { exists: false, rule: null };
    }

    // Revisar si alguno de los documentos no es el que estamos excluyendo
    let duplicateExists = false;
    let duplicateRule = null;

    querySnapshot.forEach((docSnap) => {
      if (!excludeRuleId || docSnap.id !== excludeRuleId) {
        duplicateExists = true;
        duplicateRule = {
          id: docSnap.id,
          ...docSnap.data()
        };
      }
    });

    return {
      exists: duplicateExists,
      rule: duplicateRule
    };
  } catch (error) {
    console.error(`Error verificando duplicados para ${zipcode}:`, error);
    // Si hay error, asumimos que no existe para permitir continuar
    return { exists: false, rule: null };
  }
};

/**
 * Obtiene todos los servicios de envío disponibles.
 * @returns {Promise<{ok: boolean, data: Array, error: string}>}
 */
export const getShippingServices = async () => {
  try {
    const querySnapshot = await getDocs(collection(FirebaseDB, SHIPPING_SERVICES_COLLECTION));

    const services = [];
    querySnapshot.forEach((doc) => {
      services.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return {
      ok: true,
      data: services
    };
  } catch (error) {
    console.error('Error obteniendo servicios de envío:', error);
    return {
      ok: false,
      error: error.message,
      data: []
    };
  }
};


/**
 * Crea servicios de envío predeterminados.
 * Se ejecuta cuando no hay servicios de envío configurados.
 * @returns {Promise<{ok: boolean, error: string}>}
 */
export const createDefaultShippingServices = async () => {
  try {
    // Definir servicios predeterminados
    const defaultServices = [
      {
        id: 'estandar',
        nombre: 'Estándar',
        descripcion: 'Entrega en 3-5 días',
        precio_base: 50
      },
      {
        id: 'express',
        nombre: 'Express',
        descripcion: 'Entrega en 1-2 días',
        precio_base: 90
      },
      {
        id: 'local',
        nombre: 'Entrega Local',
        descripcion: 'Entrega el mismo día',
        precio_base: 30
      }
    ];

    // Crear cada servicio en Firestore
    const batch = [];
    for (const service of defaultServices) {
      const servicesRef = collection(FirebaseDB, SHIPPING_SERVICES_COLLECTION);
      batch.push(addDoc(servicesRef, {
        ...service,
        createdAt: serverTimestamp()
      }));
    }

    // Esperar a que se completen todas las operaciones
    await Promise.all(batch);

    console.log('Servicios de envío predeterminados creados exitosamente');
    return { ok: true };
  } catch (error) {
    console.error('Error creando servicios de envío predeterminados:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};



/**
 * Importa reglas de envío desde un texto CSV.
 * @param {string} csvText - Texto del CSV
 * @param {string} strategy - Estrategia para manejar duplicados ('skip' o 'overwrite')
 * @returns {Promise<{ok: boolean, data: Object, error: string}>}
 */
export const importShippingRulesFromCSV = async (csvText, strategy = 'skip') => {
  try {
    // Parsear el CSV
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    // Validar cabeceras mínimas
    const requiredHeaders = ['zipcode', 'zona', 'precio_envio'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return {
        ok: false,
        error: `El archivo CSV no contiene las columnas requeridas: ${missingHeaders.join(', ')}`
      };
    }

    // Variables para el resultado
    const result = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    };

    // Procesar cada línea
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      result.total++;

      try {
        const values = line.split(',');
        const rowData = {};

        // Mapear valores a nombres de columnas
        headers.forEach((header, index) => {
          if (index < values.length) {
            rowData[header] = values[index] ? values[index].trim() : '';
          }
        });

        // Validar datos mínimos
        if (!rowData.zipcode || !rowData.zona || !rowData.precio_envio) {
          result.errors.push(`Fila ${i}: Faltan datos obligatorios (código postal, zona o precio)`);
          continue;
        }

        // Formatear campos
        const ruleData = {
          zipcode: rowData.zipcode,
          zona: rowData.zona,
          precio_base: parseFloat(rowData.precio_envio) || 0,
          activo: rowData.envio_gratis === 'true',
          envio_gratis: rowData.envio_gratis === 'true',
          opciones_mensajeria: [],
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        };

        // Procesar servicios si existen
        if (rowData.servicios) {
          const serviceNames = rowData.servicios.split('|');
          const servicesResult = await getShippingServices();

          if (servicesResult.ok) {
            const availableServices = servicesResult.data;

            for (const serviceName of serviceNames) {
              const service = availableServices.find(s =>
                s.nombre.toLowerCase() === serviceName.trim().toLowerCase()
              );

              if (service) {
                ruleData.opciones_mensajeria.push({
                  nombre: service.nombre,
                  precio: service.precio_base,
                  tiempo: service.descripcion
                });
              }
            }
          }
        }

        // Verificar si existe un código postal activo
        const duplicateCheck = await checkDuplicatePostalCode(ruleData.zipcode);

        if (duplicateCheck.exists) {
          if (strategy === 'skip') {
            result.skipped++;
            continue;
          } else if (strategy === 'overwrite') {
            // Actualizar el existente
            await updateDoc(
              doc(FirebaseDB, SHIPPING_ZONES_COLLECTION, duplicateCheck.rule.id),
              ruleData
            );
            result.updated++;
          }
        } else {
          // Crear nueva regla
          await addDoc(collection(FirebaseDB, SHIPPING_ZONES_COLLECTION), ruleData);
          result.created++;
        }
      } catch (err) {
        console.error(`Error procesando línea ${i}:`, err);
        result.errors.push(`Fila ${i}: ${err.message}`);
      }
    }

    return {
      ok: true,
      data: result
    };
  } catch (error) {
    console.error('Error importando reglas de envío:', error);
    return {
      ok: false,
      error: error.message
    };
  }
};