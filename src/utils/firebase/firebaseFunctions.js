// src/utils/firebase/firebaseFunctions.js
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Get a configured Firebase Functions instance.
 * NOTE: Emulator connection should be handled during Firebase initialization (e.g., in src/config/firebase/index.js)
 *
 * @returns {Object} Firebase Functions instance
 */
export const getFirebaseFunctions = () => {
  const functions = getFunctions();

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