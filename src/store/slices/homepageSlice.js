// src/store/slices/homepageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Ajusta las rutas a tus servicios según la ubicación de este slice
import { ContentService } from '../../modules/admin/services/contentService';
import { getFeaturedProductsForHome } from '../../modules/admin/services/productService';
import { getFeaturedCategoriesForHome } from '../../modules/admin/services/categoryService';
import { getCollectionImages } from '../../modules/admin/services/collectionsService.js';

// --- Thunk Asíncrono ---
export const fetchHomepageData = createAsyncThunk(
  'homepage/fetchData',
  async (_, { getState, rejectWithValue }) => {
    // Revisar si ya tenemos los datos básicos y si el caché es reciente
    const { pageData: existingPageData, collectionImages: existingCollections, lastFetchTimestamp } = getState().homepage;
    
    // Check cache validity
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && existingPageData) {
      console.log('Homepage data is fresh in store (persisted), skipping fetch.');
      // We might need to ensure collectionImages are also loaded if they weren't persisted or loaded correctly initially
      // For simplicity now, we assume if pageData exists and is fresh, the rest is okay.
      return { skipped: true }; 
    }

    console.log('Fetching homepage data from Firestore...');
    try {
       // Ejecutar promesas en paralelo
       const results = await Promise.allSettled([
        getFeaturedProductsForHome().catch(err => ({ ok: false, error: err, data: [] })),
        getFeaturedCategoriesForHome().catch(err => ({ ok: false, error: err, data: [] })),
        ContentService.getPageContent('home', 'published').catch(err => ({ ok: false, error: err, data: null })),
      ]);

      // Procesar resultados
      const productsResult = results[0];
      const categoriesResult = results[1];
      const contentResult = results[2];

      const fetchedData = {
        products: [],
        categories: [],
        pageData: null,
        collectionImages: {}, // Initialize collectionImages
        timestamp: null, // Add timestamp for cache validation
      };

      if (productsResult.status === 'fulfilled' && productsResult.value.ok) {
        fetchedData.products = productsResult.value.data;
      } else {
         console.error('Error fetching featured products:', productsResult.reason || productsResult.value?.error);
      }

      if (categoriesResult.status === 'fulfilled' && categoriesResult.value.ok) {
        fetchedData.categories = categoriesResult.value.data;
      } else {
         console.error('Error fetching featured categories:', categoriesResult.reason || categoriesResult.value?.error);
      }

      if (contentResult.status === 'fulfilled' && contentResult.value?.ok && contentResult.value?.data) {
        fetchedData.pageData = contentResult.value.data;

        // --- Cargar Imágenes de Colecciones --- 
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
                    fetchedData.collectionImages[id] = result.value.data; // Store the array of image data
                } else {
                    console.error(`Failed to load collection ${id}:`, result.reason || result.value?.error);
                    fetchedData.collectionImages[id] = []; // Store empty array on failure
                }
            });
        }
        // --- Fin Carga Imágenes ---

        // Add timestamp to successful payload
        fetchedData.timestamp = Date.now();
      } else {
         console.warn('Error fetching page content:', contentResult.reason || contentResult.value?.error);
      }

      return fetchedData; // Datos para la acción 'fulfilled'

    } catch (error) {
      console.error('Unexpected error in fetchHomepageData thunk:', error);
      return rejectWithValue(error.message);
    }
  }
);

// --- Slice Definition ---
const initialState = {
  pageData: null,
  featuredProducts: [],
  featuredCategories: [],
  collectionImages: {}, // Add collectionImages state
  isLoading: false, // Changed to isLoading to match common patterns
  error: null,
  lastFetchTimestamp: null, // Add timestamp for cache validation
};

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours TTL

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    // Reducers síncronos si son necesarios
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageData.pending, (state, action) => {
        // Reset status only if not skipped
        if (!action.meta.arg?.skipped) {
          state.isLoading = true;
          state.error = null;
        }
      })
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        if (action.payload?.skipped) {
          state.isLoading = false;
          return;
        }
        // Update state with all fetched data
        state.pageData = action.payload.pageData;
        state.featuredProducts = action.payload.products;
        state.featuredCategories = action.payload.categories;
        state.collectionImages = action.payload.collectionImages; // Store collection images
        state.lastFetchTimestamp = action.payload.timestamp; // Update timestamp
        state.isLoading = false;
      })
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch homepage data';
      });
  },
});

// Exportar el reducer
export default homepageSlice.reducer;

// Add selector for collectionImages
export const selectHomepageData = (state) => state.homepage;
export const selectHomepagePageData = (state) => state.homepage.pageData;
export const selectHomepageFeaturedProducts = (state) => state.homepage.featuredProducts;
export const selectHomepageFeaturedCategories = (state) => state.homepage.featuredCategories;
export const selectHomepageCollectionImages = (state) => state.homepage.collectionImages;
export const selectHomepageIsLoading = (state) => state.homepage.isLoading;
export const selectHomepageError = (state) => state.homepage.error; 