import {
  collection,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp
} from 'firebase/firestore';

// Importación correcta de FirebaseDB
import { FirebaseDB } from '../../../../../firebase/firebaseConfig.js';

// Colección de órdenes en Firestore
const ORDERS_COLLECTION = 'orders';

/**
 * Obtiene una lista de pedidos con filtros opcionales y paginación
 * @param {Object} options - Opciones para la consulta
 * @returns {Promise<Object>} - Resultado con datos y estado
 */
export const getOrders = async (options = {}) => {
  try {
    // Extraer opciones con valores por defecto
    const {
      status = 'all',
      startDate = null,
      endDate = null,
      searchTerm = '',
      pageSize = 25,
      lastDoc = null,
      advancedFilters = {}
    } = options;

    // Referencia a la colección
    const ordersRef = collection(FirebaseDB, ORDERS_COLLECTION);

    // Construir la consulta con filtros
    const constraints = [];

    // Filtro por estado
    if (status && status !== 'all') {
      constraints.push(where('status', '==', status));
    }

    // Filtros de fecha
    if (startDate) {
      constraints.push(where('createdAt', '>=', startDate));
    }

    if (endDate) {
      constraints.push(where('createdAt', '<=', endDate));
    }

    // Ordenar por fecha descendente
    constraints.push(orderBy('createdAt', 'desc'));

    // Limitar número de resultados - Aumentamos el límite para compensar
    // el filtrado posterior en memoria (si hay filtros de precio)
    // Solo aumentamos el límite si hay filtros de precio
    let effectivePageSize = pageSize;
    if (advancedFilters.minAmount || advancedFilters.maxAmount) {
      // Aumentamos el límite para compensar el filtrado posterior
      effectivePageSize = pageSize * 3; // Multiplicamos por 3 como medida razonable
    }
    constraints.push(limit(effectivePageSize));

    // Si hay documento anterior para paginación
    let lastVisible = null;
    if (lastDoc) {
      // Si es un objeto con ID, necesitamos obtener el documento real
      if (typeof lastDoc === 'object' && lastDoc.id) {
        try {
          console.log('Obteniendo documento para paginación con ID:', lastDoc.id);
          const docRef = doc(FirebaseDB, ORDERS_COLLECTION, lastDoc.id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            lastVisible = docSnap;
            constraints.push(startAfter(lastVisible));
          } else {
            console.warn('El documento de paginación no existe');
          }
        } catch (err) {
          console.error('Error obteniendo documento para paginación:', err);
        }
      } else if (lastDoc._firestore) {
        // Si es un documento de Firestore directamente
        lastVisible = lastDoc;
        constraints.push(startAfter(lastVisible));
      }
    }

    // Crear la consulta con todas las restricciones
    const ordersQuery = query(ordersRef, ...constraints);
    console.log('Ejecutando consulta de pedidos con lastDoc:', lastDoc ? 'existe' : 'no existe');

    // Ejecutar la consulta
    const querySnapshot = await getDocs(ordersQuery);

    // Procesar los resultados
    const orders = [];
    lastVisible = null;

    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
      // Solo actualizamos lastVisible si ya hemos procesado al menos pageSize elementos
      // que cumplen con todos los filtros
      if (orders.length <= pageSize) {
        lastVisible = doc;
      }
    });

    // ⚠️ Aplicar filtros adicionales en memoria
    let filteredOrders = orders;

    // Filtro por precio mínimo
    if (advancedFilters.minAmount !== undefined && advancedFilters.minAmount !== null) {
      console.log('Aplicando filtro de precio mínimo:', advancedFilters.minAmount);
      const minAmount = Number(advancedFilters.minAmount);
      filteredOrders = filteredOrders.filter(order =>
        order.totals && order.totals.total >= minAmount
      );
    }

    // Filtro por precio máximo
    if (advancedFilters.maxAmount !== undefined && advancedFilters.maxAmount !== null) {
      console.log('Aplicando filtro de precio máximo:', advancedFilters.maxAmount);
      const maxAmount = Number(advancedFilters.maxAmount);
      filteredOrders = filteredOrders.filter(order =>
        order.totals && order.totals.total <= maxAmount
      );
    }

    // Filtrar por término de búsqueda (en memoria)
    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.id.toLowerCase().includes(term) ||
        (order.shipping?.address?.name &&
          order.shipping.address.name.toLowerCase().includes(term))
      );
    }

    // Filtrar por nombre de producto si es necesario
    if (advancedFilters.productName && advancedFilters.productName.trim() !== '') {
      const productTerm = advancedFilters.productName.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
          order.items && order.items.some(item =>
            item.name && item.name.toLowerCase().includes(productTerm)
          )
      );
    }

    // Limitar a pageSize para mantener consistencia en la paginación
    const limitedResults = filteredOrders.slice(0, pageSize);

    // Para la paginación solo necesitamos el ID del último documento
    const lastDocId = lastVisible ? { id: lastVisible.id } : null;

    return {
      ok: true,
      data: limitedResults,
      lastDoc: lastDocId, // Devolvemos solo el ID para evitar problemas de serialización
      // Indicar si hay más resultados para la paginación
      hasMore: filteredOrders.length > pageSize,
      error: null
    };
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return {
      ok: false,
      data: [],
      lastDoc: null,
      error: error.message
    };
  }
};

/**
 * Obtiene un pedido por su ID
 * @param {string} orderId - ID del pedido a obtener
 * @returns {Promise<Object>} - Resultado con datos y estado
 */
export const getOrderById = async (orderId) => {
  try {
    if (!orderId) return { ok: false, error: 'ID de pedido no proporcionado' };

    // Referencia al documento
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);

    // Obtener el documento
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return { ok: false, error: 'Pedido no encontrado' };
    }

    return {
      ok: true,
      data: { id: orderDoc.id, ...orderDoc.data() },
      error: null
    };
  } catch (error) {
    console.error('Error al obtener pedido por ID:', error);
    return {
      ok: false,
      data: null,
      error: error.message
    };
  }
};

/**
 * Actualiza el estado de un pedido y registra el cambio
 * @param {string} orderId - ID del pedido
 * @param {string} newStatus - Nuevo estado
 * @param {string} adminId - ID del administrador
 * @param {string} notes - Notas sobre el cambio (opcional)
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const updateOrderStatus = async (orderId, newStatus, adminId, notes = '') => {
  try {
    if (!orderId || !newStatus || !adminId) {
      return { ok: false, error: 'Faltan datos requeridos' };
    }

    // Obtener el pedido actual
    const result = await getOrderById(orderId);
    if (!result.ok) {
      return result;
    }

    const order = result.data;
    const currentStatus = order.status;

    // Crear registro histórico del cambio
    const statusChange = {
      from: currentStatus,
      to: newStatus,
      changedAt: new Date(),
      changedBy: adminId,
      notes
    };

    // Actualizar el pedido
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      statusHistory: [...(order.statusHistory || []), statusChange],
      updatedAt: serverTimestamp()
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Añade una nota administrativa a un pedido
 * @param {string} orderId - ID del pedido
 * @param {string} noteText - Texto de la nota
 * @param {string} adminId - ID del administrador
 * @returns {Promise<Object>} - Resultado de la operación
 */
export const addOrderNote = async (orderId, noteText, adminId) => {
  try {
    if (!orderId || !noteText || !adminId) {
      return { ok: false, error: 'Faltan datos requeridos' };
    }

    // Obtener el pedido actual
    const result = await getOrderById(orderId);
    if (!result.ok) {
      return result;
    }

    const order = result.data;

    // Crear la nueva nota
    const newNote = {
      text: noteText,
      createdAt: new Date(),
      createdBy: adminId
    };

    // Actualizar el pedido
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      adminNotes: [...(order.adminNotes || []), newNote],
      updatedAt: serverTimestamp()
    });

    return { ok: true, error: null };
  } catch (error) {
    console.error('Error al añadir nota al pedido:', error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene estadísticas de pedidos
 * @returns {Promise<Object>} - Resultado con estadísticas
 */
export const getOrderStatistics = async () => {
  try {
    // Referencia a la colección
    const ordersRef = collection(FirebaseDB, ORDERS_COLLECTION);

    // Obtener todos los pedidos
    const querySnapshot = await getDocs(ordersRef);

    // Fecha de hoy a las 00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Inicializar contadores
    let totalOrders = 0;
    let totalRevenue = 0;
    let todaysOrders = 0;
    let todaysRevenue = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;

    // Procesar resultados
    querySnapshot.forEach((doc) => {
      const order = doc.data();
      totalOrders++;

      // Sumar ingresos
      if (order.totals && order.totals.total) {
        totalRevenue += order.totals.total;
      }

      // Verificar si es de hoy
      if (order.createdAt) {
        const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        if (orderDate >= today) {
          todaysOrders++;
          if (order.totals && order.totals.total) {
            todaysRevenue += order.totals.total;
          }
        }
      }

      // Contar por estado
      switch (order.status) {
        case 'pending':
          pendingOrders++;
          break;
        case 'processing':
          processingOrders++;
          break;
        case 'shipped':
          shippedOrders++;
          break;
        case 'delivered':
          deliveredOrders++;
          break;
        case 'cancelled':
          cancelledOrders++;
          break;
      }
    });

    // Devolver estadísticas
    return {
      ok: true,
      data: {
        totalOrders,
        totalRevenue,
        todaysOrders,
        todaysRevenue,
        pendingOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders
      },
      error: null
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { ok: false, data: null, error: error.message };
  }
};

/**
 * Obtiene información de flujo de trabajo de un pedido
 * @param {string} orderId - ID del pedido
 * @returns {Promise<Object>} - Resultado con información del flujo
 */
export const getOrderWorkflowInfo = async (orderId) => {
  try {
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId);
    const orderDoc = await getDoc(orderRef);

    if (!orderDoc.exists()) {
      return { ok: false, error: 'Pedido no encontrado' };
    }

    const data = orderDoc.data();

    const workflowData = {
      id: orderDoc.id,
      status: data.status,
      statusHistory: data.statusHistory || [],
      shipping: data.shipping || {},
      emailHistory: data.emailHistory || [],
      emailStatus: data.emailStatus || {}
    };

    return {
      ok: true,
      data: workflowData,
      error: null
    };
  } catch (error) {
    console.error('Error al obtener información de flujo:', error);
    return {
      ok: false,
      data: null,
      error: error.message
    };
  }
};