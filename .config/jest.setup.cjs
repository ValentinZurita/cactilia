require('@testing-library/jest-dom');

// Silenciar advertencias no deseadas durante las pruebas
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {}); 