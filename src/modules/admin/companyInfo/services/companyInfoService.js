import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseDB } from '../../../../config/firebase/firebaseConfig';

const COMPANY_DOC_ID = 'company_info';

/**
 * Servicio para manejar la información de la empresa en Firestore
 */
export const companyInfoService = {
  /**
   * Obtener información de la empresa desde Firestore
   * @returns {Promise<Object>} Información de la empresa
   */
  getCompanyInfo: async () => {
    try {
      const docRef = doc(FirebaseDB, 'settings', COMPANY_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        console.log('No se encontraron datos de la empresa, usando valores por defecto');
        return companyInfoService.getDefaultCompanyInfo();
      }
    } catch (error) {
      console.error('Error al obtener información de la empresa:', error);
      throw error;
    }
  },
  
  /**
   * Guardar información de la empresa en Firestore
   * @param {Object} data - Datos de la empresa
   * @returns {Promise<Object>} Resultado de la operación
   */
  saveCompanyInfo: async (data) => {
    try {
      const docRef = doc(FirebaseDB, 'settings', COMPANY_DOC_ID);
      await setDoc(docRef, data, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error al guardar información de la empresa:', error);
      throw error;
    }
  },
  
  /**
   * Obtener valores por defecto para la información de la empresa
   * @returns {Object} Información por defecto
   */
  getDefaultCompanyInfo: () => {
    return {
      name: 'Cactilia',
      legalName: '',
      rfc: '',
      logoUrl: '',
      description: '',
      contact: {
        email: 'info@cactilia.com',
        phone: '',
        whatsapp: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        }
      },
      businessHours: [
        { day: 'Lunes', open: true, openingTime: '09:00', closingTime: '18:00' },
        { day: 'Martes', open: true, openingTime: '09:00', closingTime: '18:00' },
        { day: 'Miércoles', open: true, openingTime: '09:00', closingTime: '18:00' },
        { day: 'Jueves', open: true, openingTime: '09:00', closingTime: '18:00' },
        { day: 'Viernes', open: true, openingTime: '09:00', closingTime: '18:00' },
        { day: 'Sábado', open: true, openingTime: '10:00', closingTime: '14:00' },
        { day: 'Domingo', open: false, openingTime: '', closingTime: '' }
      ],
      socialMedia: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: '',
        tiktok: '',
        pinterest: ''
      },
      paymentConfig: {
        testMode: true,
        methods: {
          card: { enabled: false, config: {} },
          oxxo: { enabled: false, config: {} },
          transfer: { enabled: false, config: {} },
          cash: { enabled: false, config: {} }
        }
      }
    };
  }
}; 