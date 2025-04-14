import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  // Ambiente para pruebas de componentes React
  testEnvironment: 'jsdom',
  
  // Indica a Jest que trate sólo JSX como módulos ES (JS ya se infiere del package.json)
  extensionsToTreatAsEsm: ['.jsx'],
  
  // Configuración para importaciones en módulos ES
  moduleNameMapper: {
    // Mapeo para archivos de estilo
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
    
    // Mapeo para importaciones específicas que dan problemas
    '^firebase/auth$': '<rootDir>/__mocks__/firebase-auth.js',
    '^firebase/firestore$': '<rootDir>/__mocks__/firebase-firestore.js',
    '^../../../../../shared/components$': '<rootDir>/__mocks__/shared-components.js',
    '^../utils/errorMessages$': '<rootDir>/__mocks__/error-messages.js'
  },
  
  // Configuración de transformaciones para babel
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        'presets': [
          ['@babel/preset-env', { 'targets': { 'node': 'current' } }],
          ['@babel/preset-react', { 'runtime': 'automatic' }]
        ]
      }
    ]
  },
  
  // Transformar también módulos ESM dentro de node_modules
  transformIgnorePatterns: [
    '/node_modules/(?!(@firebase|firebase|uuid|swiper)/)'
  ],
  
  // Archivos de configuración que se ejecutan antes de cada prueba
  setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
  
  // Patrón para buscar archivos de prueba
  testMatch: ['**/__tests__/**/*.test.(js|jsx)'],
  
  // Archivos a ignorar
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Extensiones de archivos a buscar
  moduleFileExtensions: ['js', 'jsx'],
}; 