import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
// Servicios para obtener datos de Firestore
import { getProducts } from '../../modules/admin/services/productService.js'; 
import { getCategories } from '../../modules/admin/services/categoryService.js';
import { getShopPageContent } from '../../modules/admin/components/content/shop/shopPageService.js'; // Contenido de la página de tienda (ej. banner)
import { getCollectionImages } from '../../modules/admin/services/collectionsService.js'; // Imágenes de colecciones (para banner)

// --- Estado Inicial del Slice ---
const initialState = {
  // Almacena TODOS los productos activos obtenidos inicialmente
  allProducts: [], 
  // Mapa de categorías { id: nombre } para referencia rápida
  categoriesMap: {},
  // Filtros aplicados actualmente
  filters: {
    searchTerm: '',
    selectedCategory: null, // null o string vacío significa 'todas'
    priceOrder: '', // Valores posibles: 'Destacados', 'Menor a Mayor', 'Mayor a Menor', ''
  },
  // Almacena el array original de objetos de categoría
  categories: [], 
  // Estado de la paginación
  pagination: {
    currentPage: 1,
    pageSize: 12, 
  },
  // Estado de carga para las peticiones asíncronas
  isLoading: false,
  // Posible error durante la carga
  error: null,
  // Timestamp de la última carga exitosa para caché simple
  lastFetchTimestamp: null,
  // Estado específico para el banner de la tienda
  bannerConfig: null,
  bannerCollectionImages: [], 
};

// Tiempo de vida del caché (5 minutos)
const CACHE_TTL = 5 * 60 * 1000; 

// --- Thunks (Acciones Asíncronas) ---

/**
 * Thunk para cargar los datos iniciales de la tienda (productos, categorías, banner).
 * Usa un caché simple basado en tiempo para evitar cargas innecesarias.
 */
export const fetchInitialShopData = createAsyncThunk(
  'shopPage/fetchInitialData',
  async (_, { getState, rejectWithValue }) => {
    const { lastFetchTimestamp, allProducts, categories, bannerConfig } = getState().shopPage;

    // Comprobación del caché simple basado en tiempo y existencia de datos clave
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && allProducts.length > 0 && categories.length > 0 && bannerConfig) {
      console.log('Datos de tienda frescos en el store, omitiendo fetch.');
      return { skipped: true }; // Indica que se omitió el fetch
    }

    console.log('Obteniendo datos iniciales de la tienda (productos, categorías, banner)...');
    try {
      // Ejecutar peticiones en paralelo para eficiencia
      const results = await Promise.allSettled([
        getProducts(),
        getCategories(),
        getShopPageContent('published') // Obtener configuración del banner publicado
      ]);

      const productsResult = results[0];
      const categoriesResult = results[1];
      const bannerConfigResult = results[2];

      // --- Procesar Productos ---
      if (productsResult.status === 'rejected' || !productsResult.value?.ok) {
        throw new Error(productsResult.reason?.message || productsResult.value?.error || 'Error al obtener productos');
      }
      const productsData = productsResult.value.data;

      // --- Procesar Categorías ---
      if (categoriesResult.status === 'rejected' || !categoriesResult.value?.ok) {
        throw new Error(categoriesResult.reason?.message || categoriesResult.value?.error || 'Error al obtener categorías');
      }
      const categoriesData = categoriesResult.value.data;
      // Crear mapa ID -> Nombre para facilitar la asignación a productos
      const categoriesMap = categoriesData.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {});

      // Filtrar productos activos y añadirles el nombre de su categoría
      const activeProducts = productsData
        .filter(prod => prod.active)
        .map(prod => ({
          ...prod,
          category: prod.categoryId ? categoriesMap[prod.categoryId] : 'Sin categoría',
        }));

      // --- Procesar Configuración del Banner ---
      let fetchedBannerConfig = null;
      let fetchedBannerImages = [];
      if (bannerConfigResult.status === 'fulfilled' && bannerConfigResult.value?.ok && bannerConfigResult.value?.data?.sections?.banner) {
        fetchedBannerConfig = bannerConfigResult.value.data.sections.banner;
        // Si el banner usa una colección de imágenes, obtenerlas
        if (fetchedBannerConfig.useCollection && fetchedBannerConfig.collectionId) {
          try {
            const imageResult = await getCollectionImages(fetchedBannerConfig.collectionId);
            if (imageResult.ok && Array.isArray(imageResult.data)) {
              fetchedBannerImages = imageResult.data;
            } else {
               console.warn(`Error al obtener imágenes de la colección del banner: ${imageResult.error || 'Error desconocido'}`);
            }
          } catch (imgError) {
             console.warn(`Error obteniendo imágenes de colección del banner: ${imgError.message}`);
          }
        }
      } else {
          console.warn('Error al obtener configuración del banner o sección no encontrada.');
      }
      
      // TODO: Implementar caché de imágenes si es necesario

      // Devolver todos los datos obtenidos
      return {
        allProducts: activeProducts,
        categories: categoriesData,
        categoriesMap: categoriesMap,
        bannerConfig: fetchedBannerConfig,
        bannerCollectionImages: fetchedBannerImages,
        timestamp: Date.now(), // Guardar timestamp para el caché
      };

    } catch (error) {
      console.error('Error en fetchInitialShopData:', error);
      return rejectWithValue(error.message); // Rechazar promesa en caso de error
    }
  }
);

// --- Definición del Slice con Reducers Síncronos y ExtraReducers para Thunks ---
const shopPageSlice = createSlice({
  name: 'shopPage',
  initialState,
  // Reducers: Modifican el estado de forma síncrona en respuesta a acciones
  reducers: {
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1; // Resetear a página 1 al buscar
    },
    setSelectedCategory: (state, action) => {
      state.filters.selectedCategory = action.payload;
      state.pagination.currentPage = 1; // Resetear a página 1 al cambiar categoría
    },
    setPriceOrder: (state, action) => {
      state.filters.priceOrder = action.payload;
      state.pagination.currentPage = 1; // Resetear a página 1 al cambiar orden
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    },
    decrementShopProductStock: (state, action) => {
      const { productId, quantityToDecrement } = action.payload;
      const productIndex = state.allProducts.findIndex(p => p.id === productId);

      if (productIndex !== -1) {
        const currentStock = state.allProducts[productIndex].stock;
        // Asegurarse de no bajar el stock de 0
        state.allProducts[productIndex].stock = Math.max(0, currentStock - quantityToDecrement);
        console.log(`Stock optimista actualizado para ${productId} en shopPageSlice. Nuevo stock: ${state.allProducts[productIndex].stock}`);
      } else {
        console.warn(`Producto ${productId} no encontrado en shopPageSlice para actualizar stock optimista.`);
      }
    },
    incrementShopProductStock: (state, action) => {
      const { productId, quantityToAddBack } = action.payload;
      const productIndex = state.allProducts.findIndex(p => p.id === productId);

      if (productIndex !== -1) {
        state.allProducts[productIndex].stock += quantityToAddBack;
        console.log(`Stock optimista RE-incrementado para ${productId} en shopPageSlice. Nuevo stock: ${state.allProducts[productIndex].stock}`);
      } else {
        console.warn(`Producto ${productId} no encontrado en shopPageSlice para re-incrementar stock optimista.`);
      }
    }
  },
  // ExtraReducers: Manejan acciones de otros slices o acciones de createAsyncThunk
  extraReducers: (builder) => {
    builder
      // Manejo del ciclo de vida del thunk fetchInitialShopData
      .addCase(fetchInitialShopData.pending, (state, action) => {
        // Poner isLoading a true solo si el fetch no se omitió por caché
        if (!action.meta.arg?.skipped) {
            state.isLoading = true;
            state.error = null;
        }
      })
      .addCase(fetchInitialShopData.fulfilled, (state, action) => {
        state.isLoading = false; // Siempre quitar isLoading al finalizar
        // Si el fetch no se omitió, actualizar el estado con los nuevos datos
        if (!action.payload?.skipped) {
            state.allProducts = action.payload.allProducts;
            state.categories = action.payload.categories;
            state.categoriesMap = action.payload.categoriesMap;
            state.bannerConfig = action.payload.bannerConfig; 
            state.bannerCollectionImages = action.payload.bannerCollectionImages;
            state.lastFetchTimestamp = action.payload.timestamp;
        }
      })
      .addCase(fetchInitialShopData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Error al cargar datos iniciales de la tienda';
        // Limpiar datos en caso de error
        state.allProducts = []; 
        state.categories = [];
        state.categoriesMap = {};
        state.bannerConfig = null;
        state.bannerCollectionImages = []; 
      });
  },
});

// --- Exportar Acciones Síncronas y el Reducer Principal ---
export const {
    setSearchTerm,
    setSelectedCategory,
    setPriceOrder,
    setCurrentPage,
    resetFilters,
    decrementShopProductStock,
    incrementShopProductStock
} = shopPageSlice.actions;

export default shopPageSlice.reducer;

// --- Selectores (Funciones para obtener datos específicos del estado) ---

// Selectores básicos
export const selectShopState = (state) => state.shopPage;
export const selectAllShopProducts = (state) => state.shopPage.allProducts;
export const selectShopCategories = (state) => state.shopPage.categories; // Devuelve array de objetos categoría {id, name, ...}
export const selectShopCategoriesMap = (state) => state.shopPage.categoriesMap;
export const selectShopFilters = (state) => state.shopPage.filters;
export const selectShopPagination = (state) => state.shopPage.pagination;
export const selectShopIsLoading = (state) => state.shopPage.isLoading;
export const selectShopError = (state) => state.shopPage.error;
// Selectores para el banner
export const selectShopBannerConfig = (state) => state.shopPage.bannerConfig;
export const selectShopBannerCollectionImages = (state) => state.shopPage.bannerCollectionImages;

/**
 * Selector derivado que aplica los filtros (búsqueda, categoría)
 * y ordenación por precio al listado completo de productos.
 * Utiliza `createSelector` para memoización (solo recalcula si los inputs cambian).
 */
export const selectFilteredProducts = createSelector(
  [selectAllShopProducts, selectShopFilters], // Inputs: lista completa y filtros
  (allProducts, filters) => {
    let filtered = [...allProducts]; // Copiar para no mutar el estado original

    // Filtrar por término de búsqueda (nombre o categoría)
    if (filters.searchTerm?.trim()) {
      const normalizedSearch = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(prod =>
        prod.name?.toLowerCase().includes(normalizedSearch) ||
        prod.category?.toLowerCase().includes(normalizedSearch)
      );
    }

    // Filtrar por nombre de categoría
    if (filters.selectedCategory) { // Comprueba si selectedCategory es truthy
      const selectedCategoryName = filters.selectedCategory.toLowerCase();
      filtered = filtered.filter(prod => 
        prod.category?.toLowerCase() === selectedCategoryName
      );
    }

    // --- Filtrado/Ordenación por Precio/Destacados ---

    // Filtrar por destacados si está seleccionado
    if (filters.priceOrder === 'Destacados') {
      filtered = filtered.filter((prod) => {
        return prod.featured === true;
      });
    }

    // Ordenar por precio si está seleccionado (aplicado a los productos restantes)
    if (filters.priceOrder === 'Menor a Mayor') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.priceOrder === 'Mayor a Menor') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered; // Devuelve la lista filtrada y ordenada
  }
);

/**
 * Selector que formatea las opciones de categoría para el Dropdown de FilterBar.
 * Devuelve un array de nombres de categoría.
 */
export const selectCategoryFilterOptions = createSelector(
  [selectShopCategories], // Input: array de objetos categoría
  (categories) => {
    // Transforma a un array de nombres
    return categories.map(cat => cat.name);
  }
);

/**
 * Selector que calcula el número total de páginas basado en los productos filtrados.
 */
export const selectShopTotalPages = createSelector(
  [selectFilteredProducts, selectShopPagination],
  (filteredProducts, pagination) => {
    return Math.ceil(filteredProducts.length / pagination.pageSize);
  }
);

/**
 * Selector que obtiene la porción de productos filtrados correspondiente a la página actual.
 */
export const selectPaginatedProducts = createSelector(
  [selectFilteredProducts, selectShopPagination],
  (filteredProducts, pagination) => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return filteredProducts.slice(start, end);
  }
);

/**
 * Selector que devuelve el número total de productos después de aplicar filtros.
 */
export const selectTotalFilteredProducts = createSelector(
    [selectFilteredProducts],
    (filteredProducts) => filteredProducts.length
); 