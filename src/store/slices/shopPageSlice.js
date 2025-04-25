import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createSelector } from '@reduxjs/toolkit';
// Import product and category services
import { getProducts } from '../../modules/admin/services/productService.js'; 
import { getCategories } from '../../modules/admin/services/categoryService.js';
import { getShopPageContent } from '../../modules/admin/components/content/shop/shopPageService.js'; // Import service for banner content
import { getCollectionImages } from '../../modules/admin/services/collectionsService.js'; // Import service for collection images

// --- Initial State ---
const initialState = {
  // Store all active products fetched initially
  allProducts: [], 
  // Store categories map {id: name}
  categoriesMap: {},
  filters: {
    searchTerm: '',
    selectedCategory: null, // Use null for 'all'
    priceOrder: '', // 'asc', 'desc', ''
  },
  // Store raw categories array
  categories: [], 
  pagination: {
    currentPage: 1,
    pageSize: 12, 
    // totalPages & totalProducts will be derived in selectors or updated after filtering
    // totalPages: 1, 
    // totalProducts: 0,
  },
  isLoading: false,
  error: null,
  lastFetchTimestamp: null, // For simple time-based cache validation
  // Add state for banner
  bannerConfig: null,
  bannerCollectionImages: [], 
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Thunks ---

// Thunk to fetch initial products and categories if not cached or cache expired
export const fetchInitialShopData = createAsyncThunk(
  'shopPage/fetchInitialData',
  async (_, { getState, rejectWithValue }) => {
    const { lastFetchTimestamp, allProducts, categories, bannerConfig } = getState().shopPage;

    // Basic time-based cache check (include bannerConfig check)
    if (lastFetchTimestamp && (Date.now() - lastFetchTimestamp < CACHE_TTL) && allProducts.length > 0 && categories.length > 0 && bannerConfig) {
      console.log('Shop data is fresh in store, skipping fetch.');
      return { skipped: true };
    }

    console.log('Fetching initial shop data (products, categories, banner)...');
    try {
      // Fetch products, categories, and banner config in parallel
      const results = await Promise.allSettled([
        getProducts(),
        getCategories(),
        getShopPageContent('published') // Fetch banner config
      ]);

      const productsResult = results[0];
      const categoriesResult = results[1];
      const bannerConfigResult = results[2];

      // --- Process Products ---
      if (productsResult.status === 'rejected' || !productsResult.value?.ok) {
        throw new Error(productsResult.reason?.message || productsResult.value?.error || 'Failed to fetch products');
      }
      const productsData = productsResult.value.data;

      // --- Process Categories ---
      if (categoriesResult.status === 'rejected' || !categoriesResult.value?.ok) {
        throw new Error(categoriesResult.reason?.message || categoriesResult.value?.error || 'Failed to fetch categories');
      }
      const categoriesData = categoriesResult.value.data;
      const categoriesMap = categoriesData.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {});

      // Filter active products and add category name
      const activeProducts = productsData
        .filter(prod => prod.active)
        .map(prod => ({
          ...prod,
          category: prod.categoryId ? categoriesMap[prod.categoryId] : 'Sin categoría',
        }));

      // --- Process Banner Config ---
      let fetchedBannerConfig = null;
      let fetchedBannerImages = [];
      if (bannerConfigResult.status === 'fulfilled' && bannerConfigResult.value?.ok && bannerConfigResult.value?.data?.sections?.banner) {
        fetchedBannerConfig = bannerConfigResult.value.data.sections.banner;
        // Fetch collection images if needed for the banner
        if (fetchedBannerConfig.useCollection && fetchedBannerConfig.collectionId) {
          try {
            const imageResult = await getCollectionImages(fetchedBannerConfig.collectionId);
            if (imageResult.ok && Array.isArray(imageResult.data)) {
              fetchedBannerImages = imageResult.data;
            } else {
               console.warn(`Failed to fetch banner collection images: ${imageResult.error || 'Unknown error'}`);
            }
          } catch (imgError) {
             console.warn(`Error fetching banner collection images: ${imgError.message}`);
          }
        }
      } else {
          console.warn('Failed to fetch banner configuration or banner section not found.');
          // Handle error or missing banner config if needed (e.g., set a default)
      }
      
      // TODO: Image caching

      return {
        allProducts: activeProducts,
        categories: categoriesData,
        categoriesMap: categoriesMap,
        bannerConfig: fetchedBannerConfig,
        bannerCollectionImages: fetchedBannerImages,
        timestamp: Date.now(),
      };

    } catch (error) {
      console.error('Error in fetchInitialShopData:', error);
      return rejectWithValue(error.message);
    }
  }
);

// --- Slice Definition ---
const shopPageSlice = createSlice({
  name: 'shopPage',
  initialState,
  reducers: {
    // Actions to update filters and pagination directly
    setSearchTerm: (state, action) => {
      state.filters.searchTerm = action.payload;
      state.pagination.currentPage = 1;
    },
    setSelectedCategory: (state, action) => {
      state.filters.selectedCategory = action.payload;
      state.pagination.currentPage = 1;
    },
    setPriceOrder: (state, action) => {
      state.filters.priceOrder = action.payload;
      state.pagination.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination.currentPage = 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initial Data Fetching
      .addCase(fetchInitialShopData.pending, (state, action) => {
        // Only set loading if fetch wasn't skipped
        if (!action.meta.arg?.skipped) {
            state.isLoading = true;
            state.error = null;
        }
      })
      .addCase(fetchInitialShopData.fulfilled, (state, action) => {
        // Always set isLoading to false when fulfilled, regardless of skipped
        state.isLoading = false; 
        if (!action.payload?.skipped) {
            state.allProducts = action.payload.allProducts;
            state.categories = action.payload.categories;
            state.categoriesMap = action.payload.categoriesMap;
            // Store banner data
            state.bannerConfig = action.payload.bannerConfig; 
            state.bannerCollectionImages = action.payload.bannerCollectionImages;
            state.lastFetchTimestamp = action.payload.timestamp;
        }
      })
      .addCase(fetchInitialShopData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch initial shop data';
        state.allProducts = []; // Clear data on error
        state.categories = [];
        state.categoriesMap = {};
        // Reset banner data on error too
        state.bannerConfig = null;
        state.bannerCollectionImages = []; 
      });
      // Note: We removed the separate fetchShopProducts and fetchShopCategories thunks
      // as the initial fetch gets everything. Filtering/pagination happens in selectors.
  },
});

// --- Export Actions and Reducer ---
export const {
    setSearchTerm,
    setSelectedCategory,
    setPriceOrder,
    setCurrentPage,
    resetFilters
} = shopPageSlice.actions;

export default shopPageSlice.reducer;

// --- Selectors ---

// Basic selectors
export const selectShopState = (state) => state.shopPage;
export const selectAllShopProducts = (state) => state.shopPage.allProducts;
export const selectShopCategories = (state) => state.shopPage.categories; // Returns array of category objects
export const selectShopCategoriesMap = (state) => state.shopPage.categoriesMap;
export const selectShopFilters = (state) => state.shopPage.filters;
export const selectShopPagination = (state) => state.shopPage.pagination;
export const selectShopIsLoading = (state) => state.shopPage.isLoading;
export const selectShopError = (state) => state.shopPage.error;
// Add selectors for banner data
export const selectShopBannerConfig = (state) => state.shopPage.bannerConfig;
export const selectShopBannerCollectionImages = (state) => state.shopPage.bannerCollectionImages;

// Derived selectors for filtered and paginated products
export const selectFilteredProducts = createSelector(
  [selectAllShopProducts, selectShopFilters],
  (allProducts, filters) => {
    let filtered = [...allProducts];

    // Filter by search term
    if (filters.searchTerm?.trim()) {
      const normalizedSearch = filters.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(prod =>
        prod.name?.toLowerCase().includes(normalizedSearch) ||
        prod.category?.toLowerCase().includes(normalizedSearch) // Assumes category name is added
      );
    }

    // Filter by category (use ID from filter state)
    if (filters.selectedCategory) { // Assuming selectedCategory holds the category ID
      filtered = filtered.filter(prod => prod.categoryId === filters.selectedCategory);
    }

    // Sort by price
    if (filters.priceOrder === 'asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (filters.priceOrder === 'desc') {
      filtered.sort((a, b) => b.price - a.price);
    }
    
    return filtered;
  }
);

export const selectPaginatedProducts = createSelector(
  [selectFilteredProducts, selectShopPagination],
  (filteredProducts, pagination) => {
    const { currentPage, pageSize } = pagination;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }
);

// Selector for total pages, derived from filtered products
export const selectShopTotalPages = createSelector(
    [selectFilteredProducts, selectShopPagination],
    (filteredProducts, pagination) => {
        return Math.ceil(filteredProducts.length / pagination.pageSize);
    }
);

// Selector for total number of filtered products
export const selectTotalFilteredProducts = createSelector(
    [selectFilteredProducts],
    (filteredProducts) => filteredProducts.length
);

// Selector to get category names for the filter bar
// Returns an array of { id: string, name: string }
export const selectCategoryFilterOptions = createSelector(
    [selectShopCategories],
    (categories) => {
        // Add an "All Categories" option
        return [{ id: null, name: 'Todas las categorías' }, ...categories];
    }
); 