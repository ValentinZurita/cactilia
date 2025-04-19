// PCB-A-01: Validación de formato de email
// Prueba automatizada para el caso PCB-A-01

// Importando la función isValidEmail directamente desde la ruta exacta
import { isValidEmail } from '../../../src/modules/shop/utils/validation.js';

describe('PCB-A-01: Email Validation Function', () => {
  // Camino 1: Email nulo o vacío
  test('debería devolver false para email nulo', () => {
    expect(isValidEmail(null)).toBe(false);
  });

  test('debería devolver false para email vacío', () => {
    expect(isValidEmail('')).toBe(false);
  });

  // Camino 2: Email no nulo -> validación con regex
  test('debería devolver false para email sin @', () => {
    expect(isValidEmail('usuarioexample.com')).toBe(false);
  });

  test('debería devolver true para email válido simple', () => {
    expect(isValidEmail('usuario@example.com')).toBe(true);
  });

  // Casos de prueba adicionales para mayor cobertura
  test('debería devolver false para email sin dominio', () => {
    expect(isValidEmail('usuario@')).toBe(false);
  });

  test('debería devolver false para email con caracteres especiales inválidos', () => {
    expect(isValidEmail('usuario@example.com!')).toBe(false);
  });

  test('debería devolver true para email con subdominio', () => {
    expect(isValidEmail('usuario@sub.example.com')).toBe(true);
  });
});