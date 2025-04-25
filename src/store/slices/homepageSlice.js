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

// --- Thunk Asíncrono --- 
// Carga todos los datos necesarios para la HomePage (contenido, productos, categorías, imágenes)
export const fetchHomepageData = createAsyncThunk(
  'homepage/fetchData', // Nombre de la acción
  async (_, { getState, rejectWithValue }) => {
    // Obtener estado actual para verificar el caché
    const { pageData: existingPageData, lastFetchTimestamp } = getState().homepage;
    
    // Verificar validez del caché basado en tiempo
    // Si tenemos un timestamp, no ha pasado el TTL y ya tenemos pageData, saltamos el fetch.
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && existingPageData) {
      console.log('Homepage data is fresh in store (persisted), skipping fetch.');
      return { skipped: true }; // Devolvemos un objeto indicando que se saltó
    }

    console.log('Fetching homepage data from Firestore...');
    try {
       // Ejecutar todas las promesas de carga de datos en paralelo para eficiencia
       const results = await Promise.allSettled([
        getFeaturedProductsForHome().catch(err => ({ ok: false, error: err, data: [] })), // Productos destacados
        getFeaturedCategoriesForHome().catch(err => ({ ok: false, error: err, data: [] })), // Categorías destacadas
        ContentService.getPageContent('home', 'published').catch(err => ({ ok: false, error: err, data: null })), // Contenido/configuración de la página
      ]);

      // Procesar resultados individuales
      const productsResult = results[0];
      const categoriesResult = results[1];
      const contentResult = results[2];

      // Objeto para acumular los datos fetcheados
      const fetchedData = {
        products: [],
        categories: [],
        pageData: null,
        collectionImages: {},
        timestamp: null, // Se añadirá si el fetch es exitoso
      };

      // Guardar productos si el fetch fue exitoso
      if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
        fetchedData.products = productsResult.value.data;
      } else {
         console.error('Error fetching featured products:', productsResult.reason || productsResult.value?.error);
      }

      // Guardar categorías si el fetch fue exitoso
      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
        fetchedData.categories = categoriesResult.value.data;
      } else {
         console.error('Error fetching featured categories:', categoriesResult.reason || categoriesResult.value?.error);
      }

      // Procesar contenido de la página y cargar imágenes de colección si es necesario
      if (contentResult.status === 'fulfilled' && contentResult.value?.ok && contentResult.value?.data) {
        fetchedData.pageData = contentResult.value.data;

        // --- Cargar Imágenes de Colecciones Dinámicamente ---
        // Identificar qué colecciones se necesitan según la configuración de pageData
        const heroSection = fetchedData.pageData.sections?.hero;
        const farmCarouselSection = fetchedData.pageData.sections?.farmCarousel;
        const collectionsToLoad = new Map(); // Usar un Map para evitar IDs duplicados

        if (heroSection?.useCollection && heroSection?.collectionId) {
          collectionsToLoad.set(heroSection.collectionId, null);
        }
        if (farmCarouselSection?.useCollection && farmCarouselSection?.collectionId) {
          collectionsToLoad.set(farmCarouselSection.collectionId, null);
        }
        
        // Si hay colecciones por cargar, hacer las llamadas en paralelo
        if (collectionsToLoad.size > 0) {
            console.log('Loading collection images for IDs:', [...collectionsToLoad.keys()]);
            const collectionPromises = Array.from(collectionsToLoad.keys()).map(id => 
                getCollectionImages(id).catch(err => ({ ok: false, error: err, data: [] })) // Capturar errores individuales
            );
            const collectionResults = await Promise.allSettled(collectionPromises);

            // Procesar resultados de las imágenes de colección
            Array.from(collectionsToLoad.keys()).forEach((id, index) => {
                const result = collectionResults[index];
                if (result.status === 'fulfilled' && result.value.ok) {
                    fetchedData.collectionImages[id] = result.value.data; // Guardar array de datos de imagen
                } else {
                    console.error(`Failed to load collection ${id}:`, result.reason || result.value?.error);
                    fetchedData.collectionImages[id] = []; // Guardar array vacío en caso de error
                }
            });
        }
        // --- Fin Carga Imágenes ---

        // Añadir timestamp al payload si el contenido principal (pageData) se cargó correctamente
        fetchedData.timestamp = Date.now();
      } else {
         console.warn('Error fetching page content:', contentResult.reason || contentResult.value?.error);
         // Considerar si se debe devolver error aquí o permitir carga parcial
      }

      // Devolver todos los datos recopilados para la acción 'fulfilled'
      return fetchedData; 

    } catch (error) {
      // Manejar errores inesperados en el thunk
      console.error('Unexpected error in fetchHomepageData thunk:', error);
      return rejectWithValue(error.message); // Rechazar la promesa con mensaje de error
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
        // Poner isLoading a false siempre que el thunk termine (éxito o skipped)
        state.isLoading = false; 
        // Si el fetch se saltó (payload tiene skipped: true), no hacemos nada más
        if (action.payload?.skipped) {
          return;
        }
        // Si el fetch se ejecutó, actualizamos el estado con los datos del payload
        state.pageData = action.payload.pageData;
        state.featuredProducts = action.payload.products;
        state.featuredCategories = action.payload.categories;
        state.collectionImages = action.payload.collectionImages;
        state.lastFetchTimestamp = action.payload.timestamp; // Actualizar el timestamp del caché
        state.error = null; // Limpiar error en caso de éxito
      })
      // Acción rechazada (cuando el thunk falla)
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.isLoading = false; // Termina la carga
        state.error = action.payload || 'Failed to fetch homepage data'; // Guardar mensaje de error
        // Opcional: resetear datos en caso de error?
        // state.pageData = null;
        // state.featuredProducts = [];
        // etc...
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