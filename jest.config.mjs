// jest.config.mjs
export default {
  // Entorno de prueba para aplicaciones React
  testEnvironment: 'jsdom',
  
  // Extensiones de archivos que Jest debe reconocer
  moduleFileExtensions: ['js', 'jsx', 'json'],
  
  // Ignorar estos directorios para las pruebas
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Transformadores para procesar diferentes tipos de archivos
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  
  // Mapeo de módulos para archivos que no son JavaScript
  moduleNameMapper: {
    // Mapeo para archivos de estilo (CSS, SCSS, etc.)
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    
    // Mapeo para archivos de imagen
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': 
      '<rootDir>/__mocks__/fileMock.js',
      
    // Agregando mapeos específicos para los mocks de Firebase
    '^firebase/auth$': '<rootDir>/__mocks__/firebase-auth.js',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase-firestore.js',
    
    // Agregando mapeo para componentes compartidos si es necesario
    '^@/shared/components/(.*)$': '<rootDir>/__mocks__/shared-components.js',
    
    // Mapeo para mensajes de error
    '^@/utils/error-messages$': '<rootDir>/__mocks__/error-messages.js'
  },
  
  // Configuración para la cobertura de código
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Configuraciones para los snapshots
  snapshotSerializers: [],
  
  // Archivos de configuración adicionales a ejecutar antes de las pruebas
  setupFilesAfterEnv: [
    '@testing-library/jest-dom'
  ],
  
  // Establece el directorio de trabajo para los import relativos
  rootDir: '.',
  
  // Patrón para encontrar los archivos de prueba
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)']
};