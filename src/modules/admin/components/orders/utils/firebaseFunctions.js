/**
 * Utilidades para trabajar con Cloud Functions
 */
import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Obtiene una instancia configurada de Firebase Functions
 * Usa Firebase real (producción) directamente
 * @returns {Object} Instancia de Firebase Functions
 */
export const getConfiguredFunctions = () => {
  const functions = getFunctions();
  
  // No conectamos al emulador, usamos Firebase real
  // if (window.location.hostname === 'localhost') {
  //   try {
  //     connectFunctionsEmulator(functions, 'localhost', 5002);
  //     console.log('Conectado a emulador de Firebase Functions en puerto 5002');
  //   } catch (error) {
  //     console.warn('Error al conectar al emulador:', error);
  //   }
  // }
  
  console.log('Usando Firebase Functions real (producción)');
  return functions;
};

/**
 * Envuelve una llamada a una Cloud Function para manejar errores
 * @param {string} functionName - Nombre de la Cloud Function
 * @param {Object} data - Datos a enviar a la función
 * @returns {Promise} Resultado de la función
 */
export const callFunction = async (functionName, data) => {
  try {
    console.log(`Llamando a función ${functionName} en Firebase real con datos:`, data);
    
    const functions = getConfiguredFunctions();
    const callable = httpsCallable(functions, functionName);
    
    const result = await callable(data);
    console.log(`Resultado de la función ${functionName}:`, result.data);
    
    return result.data;
  } catch (error) {
    console.error(`Error llamando a ${functionName}:`, error);
    throw error;
  }
}; 