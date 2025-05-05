import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit'; 
import { ContentService } from '../../modules/admin/services/contentService';
import { getFeaturedProductsForHome } from '../../modules/admin/services/productService';
import { getFeaturedCategoriesForHome } from '../../modules/admin/services/categoryService';
import { getCollectionImages } from '../../modules/admin/services/collectionsService.js';

// --- Estado Inicial --- 
const initialState = {
  pageData: null, // Contenido específico de la página (configuración de secciones, textos, etc.)
  featuredProducts: [], // Productos destacados
  featuredCategories: [], // Categorías destacadas
  collectionImages: {}, // Mapa de { collectionId: [array de imágenes] } para colecciones usadas en la página
  isLoading: false, // Estado de carga para las peticiones del thunk
  error: null, // Mensaje de error si algo falla
  lastFetchTimestamp: null, // Timestamp de la última carga exitosa para el caché TTL
};

// Tiempo de vida del caché (Time-To-Live) en milisegundos
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos (ajustado)
const DEFAULT_FEATURED_PRODUCT_LIMIT = 10; // Definir default como constante

// --- Thunk Asíncrono --- 
// Carga todos los datos necesarios para la HomePage (contenido, productos, categorías, imágenes)
export const fetchHomepageData = createAsyncThunk(
  'homepage/fetchData',
  async (_, { getState, rejectWithValue }) => {
    const { pageData, featuredProducts, featuredCategories, collectionImages, lastFetchTimestamp } = getState().homepage;

    // --- Lógica de Caché Simplificada ---
    // 1. Comprobar si tenemos datos cacheados y si el caché aún es válido
    if (pageData && lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL)) {
      // Cache HIT: No necesitamos hacer nada más, los datos ya están en el store.
      // Retornamos un indicador para el reducer.
      return { cacheHit: true };
    }

    // Cache MISS: Procedemos a buscar datos frescos.

    // --- Obtención de Datos Frescos ---
    try {
      let fetchedPageData = null;
      let pageDataError = null;

      // 1. Obtener SIEMPRE el contenido de la página (configuración)
      const contentResult = await ContentService.getPageContent('home', 'published');
      if (contentResult.ok) {
        fetchedPageData = contentResult.data;
      } else {
        pageDataError = contentResult.error || 'Failed to fetch page content';
        console.error('[fetchHomepageData] Error fetching page content:', pageDataError);
        // Dejamos fetchedPageData como null y seguimos para intentar cargar el resto
      }

      // 2. Obtener el resto de los datos (productos, categorías, imágenes)
      let featuredProductLimit = DEFAULT_FEATURED_PRODUCT_LIMIT;
      if (fetchedPageData?.sections?.featuredProducts?.maxItems) {
         const configuredLimit = parseInt(fetchedPageData.sections.featuredProducts.maxItems, 10);
         if (!isNaN(configuredLimit) && configuredLimit > 0) {
           featuredProductLimit = configuredLimit;
         }
      }

      // Ejecutar llamadas en paralelo
      const [productsResult, categoriesResult, collectionsDataResult] = await Promise.allSettled([
        getFeaturedProductsForHome(featuredProductLimit), // Asume que esta función devuelve un objeto { ok, data, error } o lanza error
        getFeaturedCategoriesForHome(), // Asume lo mismo
        // Lógica para cargar imágenes de colección basada en fetchedPageData
        (async () => {
          if (!fetchedPageData) return { ok: true, data: {} };
          const collectionsToLoad = new Map();
          const heroSection = fetchedPageData.sections?.hero;
          const farmCarouselSection = fetchedPageData.sections?.farmCarousel;
          if (heroSection?.useCollection && heroSection?.collectionId) collectionsToLoad.set(heroSection.collectionId, null);
          if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId) collectionsToLoad.set(farmCarouselSection.collectionId, null);

          if (collectionsToLoad.size === 0) return { ok: true, data: {} };

          const collectionPromises = Array.from(collectionsToLoad.keys()).map(id => 
            getCollectionImages(id).catch(err => {
              console.error(`Error loading collection ${id}:`, err);
              return { ok: false, data: [], error: err }; // Devolver un resultado consistente en caso de error
            })
          );
          const collectionResults = await Promise.allSettled(collectionPromises);
          const loadedCollections = {};
          Array.from(collectionsToLoad.keys()).forEach((id, index) => {
            const result = collectionResults[index];
            if (result.status === 'fulfilled' && result.value.ok) {
              loadedCollections[id] = result.value.data;
            } else {
              // Error ya logueado en el catch de getCollectionImages
              loadedCollections[id] = []; // Usar array vacío como fallback
            }
          });
          return { ok: true, data: loadedCollections };
        })()
      ]);

      // Procesar resultados y usar datos cacheados como fallback si una petición falla
      const fetchedProducts = (productsResult.status === 'fulfilled' && productsResult.value.ok) 
                              ? productsResult.value.data 
                              : featuredProducts; // Fallback a datos del store
      const fetchedCategories = (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) 
                                ? categoriesResult.value.data 
                                : featuredCategories; // Fallback a datos del store
      const fetchedCollectionImages = (collectionsDataResult.status === 'fulfilled' && collectionsDataResult.value.ok) 
                                       ? collectionsDataResult.value.data 
                                       : collectionImages; // Fallback a datos del store

      // 3. Retornar el conjunto completo de datos con el nuevo timestamp
      return {
        pageData: fetchedPageData,
        products: fetchedProducts,
        categories: fetchedCategories,
        collectionImages: fetchedCollectionImages,
        timestamp: Date.now(), // Nuevo timestamp
        cacheHit: false // Indicar que no fue un cache hit
      };

    } catch (error) {
      console.error('Unexpected error in fetchHomepageData thunk:', error);
      return rejectWithValue({ message: error.message || 'Unknown error occurred' });
    }
  }
);

// --- Definición del Slice --- 
const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    // Limpiar cache inmediatamente - util para mostrar cambios después de actualizaciones en el admin panel
    clearHomepageCache: (state) => {
      state.pageData = null;
      state.featuredProducts = [];
      state.featuredCategories = [];
      state.collectionImages = {};
      state.lastFetchTimestamp = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageData.pending, (state) => {
        // Siempre ponemos isLoading=true y que la UI maneje un posible flash rápido.
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Si el thunk retornó { cacheHit: true }, no hacemos nada al estado
        if (action.payload.cacheHit === true) {
           return; // No modificar el estado
        }
        
        // Si no fue cache hit, actualizamos el estado con los datos frescos del payload
        state.pageData = action.payload.pageData;
        state.featuredProducts = action.payload.products;
        state.featuredCategories = action.payload.categories;
        state.collectionImages = action.payload.collectionImages;
        state.lastFetchTimestamp = action.payload.timestamp;
      })
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch homepage data';
        // Opcional: podrías querer limpiar el timestamp si la carga falla
        // state.lastFetchTimestamp = null; 
      });
  },
});

// --- Exportaciones --- 

// Exportar el reducer generado por createSlice
export const { clearHomepageCache } = homepageSlice.actions;
export default homepageSlice.reducer;

// Exportar selectores para acceder fácilmente al estado desde los componentes
export const selectHomepageData = (state) => state.homepage; // Selector general para todo el estado del slice
export const selectHomepagePageData = (state) => state.homepage.pageData;
export const selectHomepageFeaturedProducts = (state) => state.homepage.featuredProducts;
export const selectHomepageFeaturedCategories = (state) => state.homepage.featuredCategories;
export const selectHomepageCollectionImages = (state) => state.homepage.collectionImages;
export const selectHomepageIsLoading = (state) => state.homepage.isLoading;
export const selectHomepageError = (state) => state.homepage.error; 
export const selectHomepageLastFetchTimestamp = (state) => state.homepage.lastFetchTimestamp; 