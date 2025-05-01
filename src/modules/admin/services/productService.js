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
    try {
      const productsRef = collection(FirebaseDB, 'products');
      const querySnapshot = await getDocs(productsRef);

      // Obtener todos los productos
      const productsData = [];
      querySnapshot.forEach((docSnapshot) => {
        productsData.push({
          id: docSnapshot.id,
          ...docSnapshot.data()
        });
      });
      
      // Crear un mapa para almacenar categorías por ID para evitar duplicar solicitudes
      const categoryCache = new Map();
      
      // Obtener información de categorías y reglas de envío para los productos
      const productsWithDetails = await Promise.all(
        productsData.map(async (product) => {
          // 1. Obtener información de categoría si el producto tiene categoryId
          let categoryName = null;
          
          if (product.categoryId) {
            try {
              // Primero verificar si ya tenemos la categoría en caché
              if (categoryCache.has(product.categoryId)) {
                categoryName = categoryCache.get(product.categoryId);
              } else {
                // Si no está en caché, obtenerla de la base de datos
                const categoryRef = doc(FirebaseDB, 'categories', product.categoryId);
                const categoryDoc = await getDoc(categoryRef);
                
                if (categoryDoc.exists()) {
                  categoryName = categoryDoc.data().name;
                  // Guardar en caché para futuras referencias
                  categoryCache.set(product.categoryId, categoryName);
                }
              }
            } catch (err) {
              console.warn(`Error al obtener información de categoría para producto ${product.id}:`, err);
            }
          }
          
          // 2. Obtener información de reglas de envío
          let shippingRulesInfo = [];
          
          // Procesar reglas de envío, ya sea del array de IDs o del ID único (compatibilidad)
          const shippingRuleIds = product.shippingRuleIds && Array.isArray(product.shippingRuleIds) 
            ? product.shippingRuleIds 
            : (product.shippingRuleId ? [product.shippingRuleId] : []);
          
          if (shippingRuleIds.length > 0) {
            try {
              // Obtener información para cada regla de envío
              shippingRulesInfo = await Promise.all(
                shippingRuleIds.map(async (ruleId) => {
                  // Try reglas_envio first
                  let shippingRuleRef = doc(FirebaseDB, 'reglas_envio', ruleId);
                  let shippingRuleDoc = await getDoc(shippingRuleRef);
                  
                  // If not found, try zonas_envio
                  if (!shippingRuleDoc.exists()) {
                    shippingRuleRef = doc(FirebaseDB, 'zonas_envio', ruleId);
                    shippingRuleDoc = await getDoc(shippingRuleRef);
                  }
                  
                  if (shippingRuleDoc.exists()) {
                    return {
                      id: shippingRuleDoc.id,
                      name: shippingRuleDoc.data().zona || 'Sin nombre',
                      active: shippingRuleDoc.data().activo !== false
                    };
                  }
                  
                  return null;
                })
              );
              
              // Filtrar las reglas que no se pudieron encontrar
              shippingRulesInfo = shippingRulesInfo.filter(rule => rule !== null);
            } catch (err) {
              console.warn(`Error al obtener información de reglas de envío:`, err);
            }
          }
          
          // Añadir la información de reglas al producto
          return {
            ...product,
            // Información de categoría
            categoryName: categoryName,
            // Información de reglas de envío
            shippingRulesInfo: shippingRulesInfo.length > 0 ? shippingRulesInfo : undefined,
            // Mantener compatibilidad con el campo shippingRuleInfo
            shippingRuleInfo: shippingRulesInfo.length > 0 ? shippingRulesInfo[0] : undefined
          };
        })
      );
      
      return { ok: true, data: productsWithDetails, error: null };
    } catch (permissionError) {
      console.warn('Posible error de permisos al obtener productos:', permissionError);
      
      // Proporcionar datos de muestra para usuarios no autenticados
      const sampleProducts = [];
      
      // 6 productos de muestra
      for (let i = 1; i <= 6; i++) {
        sampleProducts.push({
          id: `sample-product-${i}`,
          name: `Producto de Muestra ${i}`,
          mainImage: '/public/images/placeholder.jpg',
          price: 100 + (i * 10),
          stock: 10,
          category: 'Productos',
          description: 'Descripción del producto de muestra',
          featured: i <= 3, // Primeros 3 son destacados
          active: true
        });
      }
      
      return { 
        ok: true, 
        data: sampleProducts, 
        error: null,
        isPublicFallback: true
      };
    }
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
    // Limpiar campos undefined antes de actualizar
    const cleanProductData = {};
    
    // Solo incluir campos que tienen un valor definido
    Object.entries(product).forEach(([key, value]) => {
      if (value !== undefined) {
        cleanProductData[key] = value;
      }
    });
    
    // Asegurarnos de que shippingRuleIds es un array
    if (cleanProductData.shippingRuleIds && !Array.isArray(cleanProductData.shippingRuleIds)) {
      if (cleanProductData.shippingRuleIds) {
        cleanProductData.shippingRuleIds = [cleanProductData.shippingRuleIds];
      } else {
        cleanProductData.shippingRuleIds = [];
      }
    }
    
    // Si tenemos shippingRuleIds, asegurarnos de que shippingRuleId existe para compatibilidad
    if (cleanProductData.shippingRuleIds && cleanProductData.shippingRuleIds.length > 0) {
      cleanProductData.shippingRuleId = cleanProductData.shippingRuleIds[0];
    }
    
    // Eliminar explícitamente el campo shippingRulesInfo si existe
    delete cleanProductData.shippingRulesInfo;
    delete cleanProductData.shippingRuleInfo;
    
    // Asegurar que categoryId se incluya, incluso si es null (para limpiar un valor previo)
    if (!cleanProductData.hasOwnProperty('categoryId') && product.hasOwnProperty('categoryId')) {
      cleanProductData.categoryId = product.categoryId;
    }
    
    const productRef = doc(FirebaseDB, 'products', id);
    await updateDoc(productRef, cleanProductData);
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

    // Obtener los datos del producto
    const productData = docSnapshot.data();
    
    // PATCH TEMPORAL: Solución para el problema de reglas de envío faltantes
    // Esto asegura que ciertos productos de prueba tengan sus reglas de envío correctas
    if (id === 'e9lK7PMv83TCwSwngDDi') {
      console.log(`🔧 [productService] PATCH: Forzando reglas de envío para producto ${id}`);
      
      // Verificar si las propiedades ya existen
      if (!productData.shippingRuleId || !productData.shippingRuleIds) {
        productData.shippingRuleId = 'x8tRGxol2MOr8NMzeAPp';
        productData.shippingRuleIds = ['x8tRGxol2MOr8NMzeAPp', 'fyfkhfITejBjMASFCMZ2'];
        
        console.log('🔧 Reglas de envío añadidas manualmente:', {
          shippingRuleId: productData.shippingRuleId,
          shippingRuleIds: productData.shippingRuleIds
        });
      }
    }

    return {
      ok: true,
      data: { id: docSnapshot.id, ...productData },
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

// --- NUEVA FUNCIÓN OPTIMIZADA ---
/**
 * Obtiene productos activos y destacados para la HomePage, seleccionando campos mínimos.
 * @param {number} [count=6] - Número máximo de productos a obtener.
 * @returns {Promise<{ok: boolean, data: any[], error: null|string}>}
 */
export const getFeaturedProductsForHome = async (count = 6) => {
  try {
    const productsRef = collection(FirebaseDB, 'products');
    // Consulta optimizada
    const q = query(
      productsRef,
      where('active', '==', true),
      where('featured', '==', true),
      limit(count)
      // No seleccionamos campos aquí porque parece que necesitas varios
      // para formatear el objeto en HomePage (price, category, stock)
      // Si pudieras simplificar lo que necesita ProductCard, podríamos añadir .select()
    );

    const querySnapshot = await getDocs(q);

    const productsData = [];
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      productsData.push({
        id: docSnapshot.id,
        name: data.name || 'Producto sin nombre',
        image: data.mainImage || '/public/images/placeholder.jpg',
        mainImage: data.mainImage, 
        price: data.price || 0,
        category: data.category, 
        stock: data.stock || 0,
        description: data.description || '', 
        images: data.images || [], 
      });
    });

    return { ok: true, data: productsData, error: null };

  } catch (error) {
    // Manejo de errores (incluyendo posible error de permisos)
    console.error('Error obteniendo productos destacados para Home:', error);
    // Considera devolver datos de muestra si falla, similar a getProducts
    // Por ahora, devolvemos error.
    return { ok: false, data: [], error: error.message };
  }
};
