import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirebaseConfig } from './firebase.config';

// Determinar el entorno (development o production)
const isDevEnv = import.meta.env.MODE === 'development';
const firebaseConfig = getFirebaseConfig(isDevEnv ? 'development' : 'production');

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Conectar a emuladores en desarrollo
if (isDevEnv) {
  // Mostrar mensaje solo en desarrollo
  console.log('🔥 Utilizando emuladores de Firebase');
  
  // Conectar a emuladores
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}

export { app, auth, db, storage, functions };