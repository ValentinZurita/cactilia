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
    const { pageData: existingPageData, lastFetchTimestamp } = getState().homepage;
    
    // Comprobación del caché (re-habilitada)
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && existingPageData) {
      console.log('Homepage data is fresh in store (persisted), skipping fetch.');
      return { skipped: true }; 
    }

    console.log('Fetching homepage data from Firestore...');
    try {
      // 1. Obtener el contenido de la página PRIMERO (para leer la configuración)
      const contentResult = await ContentService.getPageContent('home', 'published')
                                   .catch(err => ({ ok: false, error: err, data: null }));
      
      // 2. Determinar el límite de productos destacados a partir de la configuración
      let featuredProductLimit = DEFAULT_FEATURED_PRODUCT_LIMIT; // Empezar con el default
      if (contentResult.status === 'fulfilled' && contentResult.value?.ok && contentResult.value?.data) {
        const configuredLimit = contentResult.value.data.sections?.featuredProducts?.maxItems;
        // Usar el límite configurado si es un número válido >= 1, sino mantener el default
        if (typeof configuredLimit === 'number' && configuredLimit >= 1) {
            featuredProductLimit = configuredLimit;
            console.log(`[fetchHomepageData] Using configured featured product limit: ${featuredProductLimit}`);
        } else if (configuredLimit === null) {
            // Si es null (campo vacío en admin), podríamos interpretarlo como sin límite.
            // Por ahora, lo mantendremos usando el default. Podríamos cambiarlo a un número muy alto (e.g., 999) 
            // o quitar el limit() en getFeaturedProductsForHome si el valor es null.
            // De momento, usamos el default si es null.
             console.log(`[fetchHomepageData] Configured limit is null, using default: ${featuredProductLimit}`);
        } else {
            console.log(`[fetchHomepageData] Invalid or missing configured limit (${configuredLimit}), using default: ${featuredProductLimit}`);
        }
      } else {
        console.warn('[fetchHomepageData] Could not fetch page content, using default featured product limit.');
      }

      // 3. Ejecutar las otras llamadas (productos, categorías, colecciones) en paralelo
      const otherResults = await Promise.allSettled([
        // Pasar el límite determinado a la función
        getFeaturedProductsForHome(featuredProductLimit).catch(err => ({ ok: false, error: err, data: [] })), 
        getFeaturedCategoriesForHome().catch(err => ({ ok: false, error: err, data: [] })), 
        // Ya no necesitamos obtener pageContent aquí de nuevo
      ]);

      const productsResult = otherResults[0];
      const categoriesResult = otherResults[1];
      // El resultado del contenido ya lo tenemos en contentResult

      const fetchedData = {
        products: [],
        categories: [],
        pageData: contentResult.value?.data || null, // Usar el pageData ya obtenido
        collectionImages: {},
        timestamp: null, 
      };

      // Procesar productos (sin cambios)
      if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
        fetchedData.products = productsResult.value.data;
      } else {
         console.error('Error fetching featured products:', productsResult.reason || productsResult.value?.error);
      }

      // Procesar categorías (sin cambios)
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
        fetchedData.categories = categoriesResult.value.data;
      } else {
         console.error('Error fetching featured categories:', categoriesResult.reason || categoriesResult.value?.error);
      }

      // Procesar imágenes de colección (usando el pageData ya obtenido en fetchedData.pageData)
      if (fetchedData.pageData) {
        const heroSection = fetchedData.pageData.sections?.hero;
        const farmCarouselSection = fetchedData.pageData.sections?.farmCarousel;
        const collectionsToLoad = new Map(); 

        if (heroSection?.useCollection && heroSection?.collectionId) {
          collectionsToLoad.set(heroSection.collectionId, null);
        }
        if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId) {
          collectionsToLoad.set(farmCarouselSection.collectionId, null);
        }
        
        if (collectionsToLoad.size > 0) {
            console.log('Loading collection images for IDs:', [...collectionsToLoad.keys()]);
            const collectionPromises = Array.from(collectionsToLoad.keys()).map(id => 
                getCollectionImages(id).catch(err => ({ ok: false, error: err, data: [] })) 
            );
            const collectionResults = await Promise.allSettled(collectionPromises);

            Array.from(collectionsToLoad.keys()).forEach((id, index) => {
                const result = collectionResults[index];
                if (result.status === 'fulfilled' && result.value.ok) {
                    fetchedData.collectionImages[id] = result.value.data; 
                } else {
                    console.error(`Failed to load collection ${id}:`, result.reason || result.value?.error);
                    fetchedData.collectionImages[id] = []; 
                }
            });
        }
        fetchedData.timestamp = Date.now(); // Poner timestamp si pageData existe
      } else {
         // Si no hay pageData, no podemos cargar colecciones ni poner timestamp válido
         console.warn('Page content failed to load, skipping collection image loading.');
      }

      return fetchedData; 

    } catch (error) {
      console.error('Unexpected error in fetchHomepageData thunk:', error);
      return rejectWithValue(error.message); 
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
      .addCase(fetchHomepageData.pending, (state, action) => {
        // Poner isLoading a true solo si el fetch no se saltó (optimización)
        if (!action.meta.arg?.skipped) {
          state.isLoading = true;
          state.error = null; // Limpiar errores anteriores
        }
      })
      // Acción completada (cuando el thunk termina exitosamente)
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        state.isLoading = false; 
        if (action.payload?.skipped) {
          return;
        }
        // Actualizar estado
        state.pageData = action.payload.pageData;
        state.featuredProducts = action.payload.products;
        state.featuredCategories = action.payload.categories;
        state.collectionImages = action.payload.collectionImages;
        state.lastFetchTimestamp = action.payload.timestamp;
        state.error = null;
      })
      // Acción rechazada (cuando el thunk falla)
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.isLoading = false; // Termina la carga
        state.error = action.payload || 'Failed to fetch homepage data'; // Guardar mensaje de error
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