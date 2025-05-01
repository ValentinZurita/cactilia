import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isProductModalOpen: false,
  currentModalProduct: null,
  // Podríamos añadir isLoading/error aquí si la apertura requiere fetch asíncrono
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openProductModal: (state, action) => {
      // action.payload debería ser el objeto completo del producto
      if (action.payload && action.payload.id) { // Verificar que payload sea válido
        state.isProductModalOpen = true;
        state.currentModalProduct = action.payload;
        console.log('Redux: Opening modal for product:', action.payload.name);
      } else {
        console.error('openProductModal action dispatched without a valid product payload:', action.payload);
      }
    },
    closeProductModal: (state) => {
      state.isProductModalOpen = false;
      // Opcionalmente, limpiar producto después de un delay para animación
      // Pero para simplificar, lo limpiamos inmediatamente. El modal se oculta por isOpen.
      state.currentModalProduct = null;
      console.log('Redux: Closing modal');
    },
    // Aquí podrían ir reducers para isLoading/error si se implementa fetch asíncrono
  },
  // No extraReducers por ahora, a menos que creemos un thunk para abrir
});

// Exportar acciones
export const { openProductModal, closeProductModal } = uiSlice.actions;

// Exportar selectores
export const selectIsProductModalOpen = (state) => state.ui.isProductModalOpen;
export const selectCurrentModalProduct = (state) => state.ui.currentModalProduct;

// Exportar el reducer
export default uiSlice.reducer; 