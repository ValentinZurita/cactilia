// src/utils/firebaseFunctions.js
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Track if we've already connected to avoid "already connected" errors
let isConnectedToEmulator = false;

/**
 * Get a configured Firebase Functions instance
 * Automatically connects to emulator in development
 *
 * @returns {Object} Firebase Functions instance
 */
export const getFirebaseFunctions = () => {
  const functions = getFunctions();

  // Only connect to emulator in development and only once
  if (process.env.NODE_ENV !== 'production' && !isConnectedToEmulator) {
    try {
      connectFunctionsEmulator(functions, "localhost", 5001);
      console.log("Connected to Firebase Functions emulator");
      isConnectedToEmulator = true;
    } catch (e) {
      // Already connected or other error
      console.log("Firebase Functions emulator connection note:", e.message);
    }
  }

  return functions;
};

/**
 * Call a Firebase function with properly configured instance
 *
 * @param {string} functionName - Name of the function to call
 * @param {any} data - Data to pass to the function
 * @returns {Promise<Object>} - Function result
 */
export const callFirebaseFunction = async (functionName, data = {}) => {
  const functions = getFirebaseFunctions();
  const functionCall = httpsCallable(functions, functionName);
  return functionCall(data);
};