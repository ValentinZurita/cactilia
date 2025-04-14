// Mock básico de Firebase Auth
export const sendPasswordResetEmail = jest.fn(() => Promise.resolve());
export const FirebaseAuth = {};

// Otros métodos que puedan ser necesarios
export const getAuth = jest.fn(() => ({}));
export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve()); 