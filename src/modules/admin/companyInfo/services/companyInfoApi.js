/**
 * Servicio mock para la API de información de la empresa
 * En una implementación real, esto se conectaría a una API del backend
 */

// Datos iniciales de muestra
let mockCompanyData = {
  // Información general
  name: 'Cactilia',
  legalName: 'Cactilia México S.A. de C.V.',
  rfc: 'CACT010101AAA',
  logoUrl: 'https://example.com/logo.png',
  description: 'Tienda de cactus y suculentas de la más alta calidad',
  
  // Información de contacto
  contact: {
    email: 'info@cactilia.com',
    phone: '+52 55 1234 5678',
    whatsapp: '+52 55 8765 4321',
    address: {
      street: 'Av. Insurgentes Sur 1234',
      city: 'Ciudad de México',
      state: 'CDMX',
      zipCode: '01000'
    }
  },
  
  // Horario de atención
  businessHours: [
    { day: 'Lunes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Martes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Miércoles', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Jueves', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Viernes', open: true, openingTime: '09:00', closingTime: '18:00' },
    { day: 'Sábado', open: true, openingTime: '10:00', closingTime: '14:00' },
    { day: 'Domingo', open: false, openingTime: '', closingTime: '' }
  ],
  
  // Redes sociales
  socialMedia: {
    facebook: 'https://facebook.com/cactilia',
    instagram: 'https://instagram.com/cactilia',
    twitter: 'https://twitter.com/cactilia',
    youtube: '',
    tiktok: 'https://tiktok.com/@cactilia',
    pinterest: ''
  },
  
  // Configuración de pagos
  paymentConfig: {
    testMode: true,
    methods: {
      card: {
        enabled: true,
        config: {
          apiKey: 'pk_test_sample123456',
          secretKey: 'sk_test_sample123456'
        }
      },
      oxxo: {
        enabled: true,
        config: {
          expirationDays: 3
        }
      },
      transfer: {
        enabled: true,
        config: {
          accountNumber: '0123456789',
          bank: 'BBVA',
          clabe: '012345678901234567'
        }
      },
      cash: {
        enabled: false,
        config: {}
      }
    }
  }
};

/**
 * Servicio para manejar la información de la empresa
 */
export const companyInfoApi = {
  /**
   * Obtener información de la empresa
   * @returns {Promise<Object>} Información de la empresa
   */
  getCompanyInfo: () => {
    // Simular latencia de red
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCompanyData });
      }, 800);
    });
  },
  
  /**
   * Guardar información de la empresa
   * @param {Object} data - Datos de la empresa a guardar
   * @returns {Promise<Object>} Información guardada
   */
  saveCompanyInfo: (data) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulamos una validación básica
        if (!data.name || !data.contact?.email) {
          return reject(new Error('El nombre de la empresa y el email son obligatorios'));
        }
        
        // Actualizar datos mock
        mockCompanyData = { ...data };
        
        // Devolver datos actualizados
        resolve({ ...mockCompanyData });
      }, 1200);
    });
  }
}; 