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
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas
const DEFAULT_FEATURED_PRODUCT_LIMIT = 10; // Definir default como constante

// --- Thunk Asíncrono --- 
// Carga todos los datos necesarios para la HomePage (contenido, productos, categorías, imágenes)
export const fetchHomepageData = createAsyncThunk(
  'homepage/fetchData',
  async (_, { getState, rejectWithValue }) => {
    // Declarar fetchedPageData aquí para que esté disponible en todo el scope
    let fetchedPageData = null;

    const { pageData: existingPageData, lastFetchTimestamp } = getState().homepage;
    
    // Comprobación del caché (re-habilitada)
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && existingPageData) {
      console.log('Homepage data is fresh in store (persisted), skipping fetch.');
      return { skipped: true }; 
    }

    try {
      // 1. Obtener SIEMPRE el contenido de la página (configuración)
      const contentResult = await ContentService.getPageContent('home', 'published');
      if (contentResult.ok) {
        fetchedPageData = contentResult.data;
      } else {
        pageDataError = contentResult.error || 'Failed to fetch page content';
        console.error('[fetchHomepageData]', pageDataError);
        // Si falla la carga del pageData esencial, podríamos abortar o continuar con defaults
        // Por ahora, intentaremos continuar para cargar al menos productos/categorías si es posible
      }

      // 2. Comprobar si la caché para el RESTO de los datos es válida (basado en TTL)
      const isCacheValid = lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL);

      if (isCacheValid) {
        console.log('Homepage product/category/image data is fresh based on TTL, using cached data.');
        // Usar pageData fresco, pero el resto cacheado
        return {
          pageData: fetchedPageData, // Siempre actualizado
          products: existingProducts, 
          categories: existingCategories,
          collectionImages: existingCollections, 
          timestamp: lastFetchTimestamp // Mantener el timestamp original de la caché válida
        };
      }

      // 3. Si la caché es inválida (o no existe), obtener el resto de los datos
      console.log('Homepage product/category/image cache expired or missing, fetching fresh data...');

      // Determinar límite de productos (usando el pageData recién obtenido)
      let featuredProductLimit = DEFAULT_FEATURED_PRODUCT_LIMIT;
      if (fetchedPageData) { // Solo si pageData se cargó bien
        const configuredLimit = fetchedPageData.sections?.featuredProducts?.maxItems;
        if (typeof configuredLimit === 'number' && configuredLimit >= 1) {
          featuredProductLimit = configuredLimit;
          console.log(`[fetchHomepageData] Using configured featured product limit: ${featuredProductLimit}`);
        } else {
           console.log(`[fetchHomepageData] Invalid or missing configured product limit, using default: ${featuredProductLimit}`);
        }
      } else {
        console.warn('[fetchHomepageData] Could not read page content, using default featured product limit.');
      }

      // Ejecutar llamadas en paralelo para productos, categorías, colecciones
      const otherResults = await Promise.allSettled([
        getFeaturedProductsForHome(featuredProductLimit).catch(err => ({ ok: false, error: err, data: [] })), 
        getFeaturedCategoriesForHome().catch(err => ({ ok: false, error: err, data: [] })), 
        // Lógica para cargar imágenes de colección basada en fetchedPageData
        (async () => {
          if (!fetchedPageData) return { ok: true, data: {} }; // No hay data para buscar colecciones
          const heroSection = fetchedPageData.sections?.hero;
          const farmCarouselSection = fetchedPageData.sections?.farmCarousel;
          const collectionsToLoad = new Map();
          if (heroSection?.useCollection && heroSection?.collectionId) collectionsToLoad.set(heroSection.collectionId, null);
          if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId) collectionsToLoad.set(farmCarouselSection.collectionId, null);
          
          if (collectionsToLoad.size === 0) return { ok: true, data: {} };

          console.log('Loading collection images for IDs:', [...collectionsToLoad.keys()]);
          const collectionPromises = Array.from(collectionsToLoad.keys()).map(id => 
              getCollectionImages(id).catch(err => ({ ok: false, error: err, data: [] }))
          );
          const collectionResults = await Promise.allSettled(collectionPromises);
          const loadedCollections = {};
          Array.from(collectionsToLoad.keys()).forEach((id, index) => {
            const result = collectionResults[index];
            if (result.status === 'fulfilled' && result.value.ok) {
              loadedCollections[id] = result.value.data;
            } else {
              console.error(`Failed to load collection ${id}:`, result.reason || result.value?.error);
              loadedCollections[id] = [];
            }
          });
          return { ok: true, data: loadedCollections };
        })()
      ]);

      const productsResult = otherResults[0];
      const categoriesResult = otherResults[1];
      const collectionsResult = otherResults[2];

      const fetchedData = {
        pageData: fetchedPageData, // El pageData que obtuvimos al inicio
        products: (productsResult.status === 'fulfilled' && productsResult.value.ok) ? productsResult.value.data : existingProducts, // Fallback a existente si falla
        categories: (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) ? categoriesResult.value.data : existingCategories, // Fallback a existente si falla
        collectionImages: (collectionsResult.status === 'fulfilled' && collectionsResult.value.ok) ? collectionsResult.value.data : existingCollections, // Fallback a existente si falla
        timestamp: Date.now() // Nuevo timestamp porque obtuvimos datos frescos
      };

      return fetchedData; 

    } catch (error) {
      console.error('Unexpected error in fetchHomepageData thunk:', error);
      // Devolver el pageData si se obtuvo (está en el scope externo), aunque el resto falle
      return rejectWithValue({ 
        message: error.message, 
        // Usar el fetchedPageData del scope externo, que será null si falló antes
        partialData: { pageData: fetchedPageData } 
      }); 
    }
  }
);

// --- Definición del Slice --- 
const homepageSlice = createSlice({
  name: 'homepage', // Nombre del slice (usado en las actions types)
  initialState, // Estado inicial definido arriba
  reducers: {
    // Aquí se colocaran reducers síncronos si fueran necesarios
    // Ejemplo: setHomepageTheme: (state, action) => { state.theme = action.payload; }
  },
  // Manejo de las acciones asíncronas del thunk (pending, fulfilled, rejected)
  extraReducers: (builder) => {
    builder
      // Acción pendiente (cuando el thunk empieza)
      .addCase(fetchHomepageData.pending, (state) => { 
          state.isLoading = true;
          state.error = null; // Limpiar errores anteriores
      })
      // Acción completada (cuando el thunk termina exitosamente)
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        const previousTimestamp = state.lastFetchTimestamp; // Guardar timestamp anterior
        const incomingTimestamp = action.payload.timestamp; // Timestamp del payload
        const incomingPageData = action.payload.pageData;

        // Log para saber qué estamos recibiendo
        console.log(`>>> Reducer fulfilled - Prev TS: ${previousTimestamp}, Incoming TS: ${incomingTimestamp}`);
        console.log('>>> Reducer fulfilled - Received productCategories.limit:', incomingPageData?.sections?.productCategories?.limit);

        // Si la caché NO es válida (timestamps diferentes), actualizamos TODO
        if (previousTimestamp !== incomingTimestamp) {
          console.log('>>> Reducer fulfilled - Cache MISS, returning new state with all fresh data.');
          return { // Retornar nuevo objeto de estado
            ...state, // Mantener otras propiedades del slice si las hubiera
            isLoading: false,
            error: null,
            pageData: incomingPageData ? { ...incomingPageData } : null, // Nueva referencia forzada
            featuredProducts: action.payload.products,
            featuredCategories: action.payload.categories,
            collectionImages: action.payload.collectionImages,
            lastFetchTimestamp: incomingTimestamp, // Timestamp nuevo
          };
        } else {
          // Si la caché SÍ es válida (timestamps iguales), SOLO actualizamos pageData
          console.log('>>> Reducer fulfilled - Cache HIT, returning new state with updated pageData only.');
          return { // Retornar nuevo objeto de estado
            ...state, // Mantiene products, categories, images, timestamp anteriores
            isLoading: false,
            error: null,
            pageData: incomingPageData ? { ...incomingPageData } : null, // Nueva referencia forzada
            // lastFetchTimestamp no cambia
          };
        }
        // Nota: Ya no mutamos 'state' directamente, retornamos el nuevo estado completo.
      })
      // Acción rechazada (cuando el thunk falla)
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.isLoading = false; // Termina la carga
        state.error = action.payload?.message || 'Failed to fetch homepage data'; // Guardar mensaje de error

        // Si hubo datos parciales (al menos pageData), actualizarlos
        if (action.payload?.partialData?.pageData) {
          state.pageData = action.payload.partialData.pageData;
        }
      });
  },
});

// --- Exportaciones --- 

// Exportar el reducer generado por createSlice
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