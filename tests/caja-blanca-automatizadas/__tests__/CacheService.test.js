// PCB-Real: Test Automatizado - Servicio de Caché
import { CacheService } from '../../src/utils/CacheService';

// Mock para Date.now()
const originalDateNow = Date.now;

describe('CacheService - Prueba de Caja Blanca', () => {
  beforeEach(() => {
    // Limpiar la caché antes de cada prueba
    CacheService.clear();
    // Restaurar el Date.now original
    Date.now = originalDateNow;
  });

  afterAll(() => {
    // Asegurar que Date.now quede restaurado
    Date.now = originalDateNow;
  });

  // Función set()
  describe('set', () => {
    test('debe almacenar un valor con tiempo de expiración cuando ttlMinutes > 0', () => {
      const mockTime = 1000;
      Date.now = jest.fn(() => mockTime);

      const key = 'testKey';
      const value = { data: 'testValue' };
      const ttlMinutes = 10;

      const result = CacheService.set(key, value, ttlMinutes);

      // Verificar que retorna el valor
      expect(result).toEqual(value);

      // Verificar el contenido del caché
      expect(CacheService._cache[key]).toEqual({
        value: value,
        expiry: mockTime + (ttlMinutes * 60 * 1000)
      });
    });

    test('debe almacenar un valor sin tiempo de expiración cuando ttlMinutes = 0', () => {
      const key = 'testKey';
      const value = { data: 'testValue' };
      
      CacheService.set(key, value, 0);

      // Verificar que no hay tiempo de expiración
      expect(CacheService._cache[key].expiry).toBeNull();
    });
  });

  // Función get()
  describe('get', () => {
    test('debe retornar null cuando la clave no existe', () => {
      const result = CacheService.get('nonExistentKey');
      expect(result).toBeNull();
    });

    test('debe retornar null y eliminar el ítem cuando está expirado', () => {
      // Configurar tiempo actual
      const currentTime = 1000;
      const expiryTime = 900; // Ya expiró (antes del tiempo actual)
      
      // Insertar manualmente un ítem expirado
      CacheService._cache.expiredKey = {
        value: 'expiredValue',
        expiry: expiryTime
      };

      // Mock de Date.now para simular tiempo actual
      Date.now = jest.fn(() => currentTime);

      // Obtener el valor
      const result = CacheService.get('expiredKey');

      // Verificar que retorna null
      expect(result).toBeNull();

      // Verificar que el ítem fue eliminado
      expect(CacheService._cache.expiredKey).toBeUndefined();
    });

    test('debe retornar el valor cuando existe y no está expirado', () => {
      // Configurar tiempo actual
      const currentTime = 1000;
      const expiryTime = 2000; // No ha expirado (después del tiempo actual)
      const value = 'validValue';
      
      // Insertar manualmente un ítem válido
      CacheService._cache.validKey = {
        value: value,
        expiry: expiryTime
      };

      // Mock de Date.now para simular tiempo actual
      Date.now = jest.fn(() => currentTime);

      // Obtener el valor
      const result = CacheService.get('validKey');

      // Verificar que retorna el valor correcto
      expect(result).toBe(value);

      // Verificar que el ítem sigue en la caché
      expect(CacheService._cache.validKey).toBeDefined();
    });

    test('debe retornar el valor cuando existe y no tiene tiempo de expiración', () => {
      const value = 'nonExpiringValue';
      
      // Insertar manualmente un ítem sin expiración
      CacheService._cache.nonExpiringKey = {
        value: value,
        expiry: null
      };

      // Obtener el valor
      const result = CacheService.get('nonExpiringKey');

      // Verificar que retorna el valor correcto
      expect(result).toBe(value);
    });
  });

  // Función getOrFetch()
  describe('getOrFetch', () => {
    test('debe retornar el valor cacheado si existe y no está expirado', async () => {
      // Preparar datos de caché
      const cachedValue = { data: 'cachedData' };
      CacheService.set('cachedKey', cachedValue);

      // Mock de la función fetch que nunca debería ser llamada
      const mockFetch = jest.fn();

      // Ejecutar getOrFetch
      const result = await CacheService.getOrFetch('cachedKey', mockFetch);

      // Verificar que se retornó el valor cacheado
      expect(result).toEqual(cachedValue);

      // Verificar que la función fetch no fue llamada
      expect(mockFetch).not.toHaveBeenCalled();
    });

    test('debe llamar a fetchFunction y guardar el resultado si no está en caché', async () => {
      // Mock de la función fetch
      const fetchedValue = { data: 'fetchedData', ok: true };
      const mockFetch = jest.fn().mockResolvedValue(fetchedValue);

      // Ejecutar getOrFetch
      const result = await CacheService.getOrFetch('newKey', mockFetch, 10);

      // Verificar que se retornó el valor obtenido
      expect(result).toEqual(fetchedValue);

      // Verificar que la función fetch fue llamada
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verificar que el valor fue guardado en caché
      expect(CacheService.get('newKey')).toEqual(fetchedValue);
    });

    test('no debe guardar en caché si el resultado del fetch tiene ok=false', async () => {
      // Mock de la función fetch
      const fetchedValue = { data: 'errorData', ok: false };
      const mockFetch = jest.fn().mockResolvedValue(fetchedValue);

      // Ejecutar getOrFetch
      const result = await CacheService.getOrFetch('errorKey', mockFetch);

      // Verificar que se retornó el valor obtenido
      expect(result).toEqual(fetchedValue);

      // Verificar que la función fetch fue llamada
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verificar que el valor NO fue guardado en caché
      expect(CacheService.get('errorKey')).toBeNull();
    });

    test('debe propagar errores de la función fetch', async () => {
      // Mock de la función fetch que falla
      const fetchError = new Error('Fetch failed');
      const mockFetch = jest.fn().mockRejectedValue(fetchError);

      // Ejecutar getOrFetch y esperar que falle
      await expect(CacheService.getOrFetch('errorKey', mockFetch)).rejects.toThrow(fetchError);

      // Verificar que la función fetch fue llamada
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Verificar que no hay valor en caché
      expect(CacheService.get('errorKey')).toBeNull();
    });
  });

  // Función remove()
  describe('remove', () => {
    test('debe eliminar un valor de la caché', () => {
      // Agregar un valor a la caché
      CacheService.set('keyToRemove', 'valueToRemove');
      
      // Verificar que existe
      expect(CacheService.get('keyToRemove')).toBe('valueToRemove');
      
      // Remover el valor
      CacheService.remove('keyToRemove');
      
      // Verificar que ya no existe
      expect(CacheService.get('keyToRemove')).toBeNull();
    });

    test('no debe afectar otros valores en caché al eliminar uno', () => {
      // Agregar dos valores
      CacheService.set('key1', 'value1');
      CacheService.set('key2', 'value2');
      
      // Remover uno
      CacheService.remove('key1');
      
      // Verificar que solo uno fue removido
      expect(CacheService.get('key1')).toBeNull();
      expect(CacheService.get('key2')).toBe('value2');
    });
  });

  // Función clear()
  describe('clear', () => {
    test('debe eliminar todos los valores de la caché', () => {
      // Agregar varios valores
      CacheService.set('key1', 'value1');
      CacheService.set('key2', 'value2');
      
      // Verificar que existen
      expect(CacheService.get('key1')).toBe('value1');
      expect(CacheService.get('key2')).toBe('value2');
      
      // Limpiar la caché
      CacheService.clear();
      
      // Verificar que ya no existen
      expect(CacheService.get('key1')).toBeNull();
      expect(CacheService.get('key2')).toBeNull();
      expect(CacheService._cache).toEqual({});
    });
  });
}); 