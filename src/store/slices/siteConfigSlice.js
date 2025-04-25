import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { companyInfoService } from '../../modules/admin/companyInfo/services/companyInfoService';
import { getSocialMediaLinks } from '../../services/firebase/companyInfoService.js';

// Thunk para obtener la información principal de la empresa
export const fetchCompanyInfo = createAsyncThunk(
  'siteConfig/fetchCompanyInfo',
  async (_, { rejectWithValue }) => {
    try {
      const data = await companyInfoService.getCompanyInfo();
      // Excluimos explícitamente socialMedia si viene del servicio principal
      // Asumimos que socialMedia se maneja por separado
      const { socialMedia, ...companyInfoData } = data || {}; 
      return { data: companyInfoData, timestamp: Date.now() };
    } catch (error) {
      console.error('Error fetching company info:', error);
      return rejectWithValue(error.message || 'Failed to fetch company info');
    }
  }
);

// Thunk para obtener los enlaces de redes sociales
export const fetchSocialLinks = createAsyncThunk(
  'siteConfig/fetchSocialLinks',
  async (_, { rejectWithValue }) => {
    try {
      const links = await getSocialMediaLinks();
      // Devolvemos el array de links directamente
      return links || [];
    } catch (error) {
      console.error('Error fetching social links:', error);
      return rejectWithValue(error.message || 'Failed to fetch social links');
    }
  }
);

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours TTL

const initialState = {
  companyInfo: null,
  socialLinks: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  lastFetchTimestamp: null, // Add timestamp for cache validation
};

const siteConfigSlice = createSlice({
  name: 'siteConfig',
  initialState,
  reducers: {
    // Podríamos añadir reducers síncronos si fueran necesarios en el futuro
    resetSiteConfigStatus: (state) => {
        state.status = 'idle';
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Company Info ---
      .addCase(fetchCompanyInfo.pending, (state, action) => {
        // Only set loading if fetch isn't skipped (though skipped logic is in the thunk)
        // We rely on the fulfilled/rejected cases to set final status correctly.
        state.status = 'loading';
        state.error = null; // Reset error on new request
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action) => {
        // Always set final status, even if skipped
        state.status = 'succeeded'; 
        state.error = null;
        if (!action.payload?.skipped) {
          state.companyInfo = action.payload.data; // Access the actual data
          state.lastFetchTimestamp = action.payload.timestamp; // Update timestamp
        }
      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Error message from rejectWithValue
      })
      // --- Fetch Social Links ---
      .addCase(fetchSocialLinks.pending, (state) => {
        // Podríamos tener estados de carga separados si fuera necesario,
        // pero por ahora usamos uno global para el slice.
        state.status = 'loading'; 
        state.error = null;
      })
      .addCase(fetchSocialLinks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.socialLinks = action.payload;
      })
      .addCase(fetchSocialLinks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; 
      });
  },
});

// Exportar actions síncronas si las hubiera
export const { resetSiteConfigStatus } = siteConfigSlice.actions;

// Exportar el reducer
export default siteConfigSlice.reducer;

// Selectors básicos (puedes moverlos a src/store/selectors/ si prefieres)
export const selectSiteConfig = (state) => state.siteConfig;
export const selectCompanyInfo = (state) => state.siteConfig.companyInfo;
export const selectSocialLinks = (state) => state.siteConfig.socialLinks;
export const selectSiteConfigStatus = (state) => state.siteConfig.status;
export const selectSiteConfigError = (state) => state.siteConfig.error; 