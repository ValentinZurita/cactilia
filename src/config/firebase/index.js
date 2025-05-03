// import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { connectStorageEmulator } from 'firebase/storage';
import { connectFunctionsEmulator } from 'firebase/functions';
// import { getFirebaseConfig } from './firebase.config';

// Import initialized services from firebaseConfig.js
import {
  FirebaseApp,
  FirebaseAuth,
  FirebaseDB,
  FirebaseStorage,
  FirebaseFunctions
} from './firebaseConfig.js';

// Determinar el entorno (development o production)
const isDevEnv = import.meta.env.MODE === 'development';
// const firebaseConfig = getFirebaseConfig(isDevEnv ? 'development' : 'production');

// Inicializar Firebase - REMOVED
// const app = initializeApp(firebaseConfig);

// Inicializar servicios - REMOVED (using imports now)
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);
// const functions = getFunctions(app);

// Conectar a emuladores en desarrollo using imported instances
if (isDevEnv) {
  // Mostrar mensaje solo en desarrollo
  console.log('🔥 Conexión a emuladores DESHABILITADA para usar servicios desplegados.');
  
  // Conectar a emuladores using imported instances - DESHABILITADO
  // connectAuthEmulator(FirebaseAuth, 'http://localhost:9099');
  // connectFirestoreEmulator(FirebaseDB, 'localhost', 8081);
  // connectStorageEmulator(FirebaseStorage, 'localhost', 9199);
  // connectFunctionsEmulator(FirebaseFunctions, 'localhost', 5001);
}

// Export the imported (and potentially emulator-connected) instances
// Rename for backward compatibility if needed, or use the new names directly
export {
  FirebaseApp as app, // Optional rename
  FirebaseAuth as auth,
  FirebaseDB as db,
  FirebaseStorage as storage,
  FirebaseFunctions as functions
};