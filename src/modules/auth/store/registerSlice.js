import { createSlice } from "@reduxjs/toolkit";

// Estado inicial del formulario de registro
const initialState = {
  fullName: "",
  email: "",
  birthdate: "",
  phoneNumber: "",
  password: "",
};

export const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    updateField: (state, { payload }) => {
      return { ...state, ...payload };
    },
    resetForm: () => initialState, // Reinicia el formulario a su estado inicial
  },
});

export const { updateField, resetForm } = registerSlice.actions;

export default registerSlice.reducer;