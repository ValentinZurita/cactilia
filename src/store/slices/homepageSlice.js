// src/store/slices/homepageSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// Ajusta las rutas a tus servicios según la ubicación de este slice
import { ContentService } from '../../modules/admin/services/contentService';
import { getFeaturedProductsForHome } from '../../modules/admin/services/productService';
import { getFeaturedCategoriesForHome } from '../../modules/admin/services/categoryService';
// Importa getCollectionImages si decides cachearlas también
// import { getCollectionImages } from '../../modules/admin/services/collectionsService';

// --- Thunk Asíncrono ---
export const fetchHomepageData = createAsyncThunk(
  'homepage/fetchData',
  async (_, { getState, rejectWithValue }) => {
    // Revisar si ya tenemos los datos básicos (ej. pageData)
    const { pageData: existingPageData } = getState().homepage; // Asegúrate que el reducer se llame 'homepage'
    if (existingPageData) {
      console.log('Homepage data already in store, skipping fetch.');
      // Retornar un objeto vacío o específico para indicar que no se hizo fetch
      // Esto evita que el estado fulfilled sobreescriba innecesariamente.
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
  isLoading: false,
  error: null,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    // Reducers síncronos si son necesarios
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomepageData.pending, (state, action) => {
        // Solo poner isLoading si no hay datos previos
        // Evita el flicker si se skipea el fetch porque ya hay datos
        if (!action.meta.arg?.skipped && !state.pageData) {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        // No hacer nada si el fetch fue skipeado
        if (action.payload?.skipped) {
          state.isLoading = false; // Asegurar que loading quede en false
          return;
        }

        // Actualizar estado con los datos recibidos
        state.pageData = action.payload.pageData;
        state.featuredProducts = action.payload.products;
        state.featuredCategories = action.payload.categories;
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