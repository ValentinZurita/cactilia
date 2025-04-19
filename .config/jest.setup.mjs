// Importar las utilidades de testing-library
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Silenciar advertencias no deseadas durante las pruebas
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {}); 