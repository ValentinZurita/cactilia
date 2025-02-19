import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    status: 'not-authenticated',
    uid: null,
    email: null,
    displayName: null,
    photoURL: null,
    errorMessage: null,
    registrationSuccess: false,
    emailSent: false,
    role: 'user'
  },
  reducers: {
    login: (state, {payload}) => {
      state.status = 'authenticated';
      state.uid = payload.uid;
      state.email = payload.email;
      state.displayName = payload.displayName;
      state.photoURL = payload.photoURL;
      state.errorMessage = null;
      state.role = payload.role || 'user';
    },
    logout: (state, {payload}) => {
      state.status = 'not-authenticated';
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.photoURL = null;
      state.errorMessage = payload?.errorMessage || null;
      state.registrationSuccess = false;
      state.emailSent = false;
      state.role = 'user';
    },
    checkingCredentials: (state, action) => {
      state.status = 'checking';
    },
    setErrorMessage: (state, { payload }) => {
      state.errorMessage = payload;
    },
    setEmailSent: (state, { payload }) => {
      state.emailSent = payload;
    },
    clearRegistrationMessage: (state) => {
      state.emailSent = false;
      state.registrationSuccess = false;
      state.errorMessage = null;
    }
  }

})

export const { login,
               logout,
               checkingCredentials,
               setEmailSent,
               setErrorMessage,
               clearRegistrationMessage
             } = authSlice.actions