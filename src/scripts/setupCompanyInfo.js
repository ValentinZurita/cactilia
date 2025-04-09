/**
 * Script para configurar la información básica de la empresa en Firestore
 * 
 * Ejecutar con: node src/scripts/setupCompanyInfo.js
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuración de Firebase (ajustar según tus credenciales)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Información básica de la empresa
const companyInfo = {
  generalInfo: {
    companyName: "Cactilia",
    legalName: "Cactilia S.A. de C.V.",
    description: "Tienda en línea de cactus y plantas suculentas",
    logoUrl: "",
    rfc: ""
  },
  contactInfo: {
    email: "tu-email@gmail.com", // CAMBIAR POR TU EMAIL
    phone: "",
    whatsapp: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  },
  businessHours: [
    { day: "Lunes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "Martes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "Miércoles", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "Jueves", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "Viernes", isOpen: true, openTime: "09:00", closeTime: "18:00" },
    { day: "Sábado", isOpen: true, openTime: "10:00", closeTime: "14:00" },
    { day: "Domingo", isOpen: false, openTime: "", closeTime: "" }
  ],
  socialMedia: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    tiktok: ""
  },
  paymentConfig: {
    acceptCreditCards: true,
    acceptDebitCards: true,
    acceptOxxo: false,
    acceptBankTransfers: false
  }
};

// Función principal
async function setupCompanyInfo() {
  try {
    console.log('Inicializando Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('Configurando información de la empresa...');
    await setDoc(doc(db, 'company_info', 'default'), companyInfo);
    
    console.log('¡Configuración completada con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error al configurar la información de la empresa:', error);
    process.exit(1);
  }
}

// Ejecutar la función
setupCompanyInfo(); 