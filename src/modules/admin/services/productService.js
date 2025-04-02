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
  limit,
  orderBy,
  startAt,
  endAt
} from 'firebase/firestore';
import { FirebaseDB } from '../../../config/firebase/firebaseConfig';

/**
 * Obtiene todos los productos
 * @returns {Promise<{ok: boolean, data: any[], error: null|string}>}
 */
export const getProducts = async () => {
  try {
    const productsRef = collection(FirebaseDB, 'products');
    const querySnapshot = await getDocs(productsRef);

    const products = [];
    querySnapshot.forEach((docSnapshot) => {
      products.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });

    return { ok: true, data: products, error: null };
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return { ok: false, data: [], error: error.message };
  }
};

/**
 * Añade un nuevo producto
 * @param {Object} product - Datos del producto
 * @returns {Promise<{ok: boolean, id: string|null, error: null|string}>}
 */
export const addProduct = async (product) => {
  try {
    const productsRef = collection(FirebaseDB, 'products');
    const docRef = await addDoc(productsRef, product);
    return { ok: true, id: docRef.id, error: null };
  } catch (error) {
    console.error('Error añadiendo producto:', error);
    return { ok: false, id: null, error: error.message };
  }
};

/**
 * Actualiza un producto existente
 * @param {string} id - ID del producto
 * @param {Object} product - Datos actualizados del producto
 * @returns {Promise<{ok: boolean, error: null|string}>}
 */
export const updateProduct = async (id, product) => {
  try {
    const productRef = doc(FirebaseDB, 'products', id);
    await updateDoc(productRef, product);
    return { ok: true, error: null };
  } catch (error) {
    console.error(`Error actualizando producto ${id}:`, error);
    return { ok: false, error: error.message };
  }
};

/**
 * Elimina un producto
 * @param {string} id - ID del producto a eliminar
 * @returns {Promise<{ok: boolean, error: null|string}>}
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(FirebaseDB, 'products', id);
    await deleteDoc(productRef);
    return { ok: true, error: null };
  } catch (error) {
    console.error(`Error eliminando producto ${id}:`, error);
    return { ok: false, error: error.message };
  }
};

/**
 * Obtiene un producto por su ID
 * @param {string} id - ID del producto
 * @returns {Promise<{ok: boolean, data: Object|null, error: null|string}>}
 */
export const getProductById = async (id) => {
  try {
    const productRef = doc(FirebaseDB, 'products', id);
    const docSnapshot = await getDoc(productRef);

    if (!docSnapshot.exists()) {
      return { ok: false, data: null, error: 'Producto no encontrado' };
    }

    return {
      ok: true,
      data: { id: docSnapshot.id, ...docSnapshot.data() },
      error: null
    };
  } catch (error) {
    console.error(`Error obteniendo producto ${id}:`, error);
    return { ok: false, data: null, error: error.message };
  }
};

/**
 * Busca productos por texto (nombre o SKU)
 * @param {string} searchTerm - Término de búsqueda
 * @param {number} maxResults - Número máximo de resultados (por defecto 10)
 * @returns {Promise<{ok: boolean, data: Array, error: string|null}>}
 */
export const searchProducts = async (searchTerm, maxResults = 10) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return { ok: true, data: [], error: null };
    }

    const trimmedTerm = searchTerm.trim().toLowerCase();
    const productsRef = collection(FirebaseDB, 'products');

    // Buscar por nombre
    const nameQueryRef = query(
      productsRef,
      orderBy('name'),
      startAt(trimmedTerm),
      endAt(trimmedTerm + '\uf8ff'),
      limit(maxResults)
    );

    // Buscar por SKU exacto
    const skuQueryRef = query(
      productsRef,
      where('sku', '==', searchTerm.trim()),
      limit(maxResults)
    );

    // Ejecutar ambas consultas
    const [nameQuerySnapshot, skuQuerySnapshot] = await Promise.all([
      getDocs(nameQueryRef),
      getDocs(skuQueryRef)
    ]);

    // Combinar resultados sin duplicados
    const resultMap = new Map();

    // Procesar resultados por nombre
    nameQuerySnapshot.forEach((docSnapshot) => {
      resultMap.set(docSnapshot.id, {
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });

    // Procesar resultados por SKU
    skuQuerySnapshot.forEach((docSnapshot) => {
      resultMap.set(docSnapshot.id, {
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });

    // Convertir Map a Array
    const results = Array.from(resultMap.values());

    return { ok: true, data: results, error: null };
  } catch (error) {
    console.error('Error buscando productos:', error);
    return { ok: false, data: [], error: error.message };
  }
};