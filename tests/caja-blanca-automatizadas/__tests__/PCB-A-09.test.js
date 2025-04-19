import { getProductDetails } from '../../src/modules/shop/features/product/services/productDetails';
import firebase from 'firebase/app';

// Mock de Firestore
jest.mock('firebase/app', () => {
  const firebaseMock = {
    firestore: jest.fn(() => ({
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: jest.fn(),
          collection: jest.fn(() => ({
            orderBy: jest.fn(() => ({
              get: jest.fn()
            })),
            get: jest.fn()
          }))
        }))
      }))
    }))
  };
  
  return firebaseMock;
});

// Datos de prueba
const mockProduct = {
  id: 'product123',
  name: 'Producto de Prueba',
  price: 150,
  description: 'Descripción del producto',
  mainImage: 'url-imagen-principal',
  hasVariants: false,
  stock: 10,
  createdAt: { toDate: () => new Date('2025-01-01') },
  updatedAt: { toDate: () => new Date('2025-01-10') },
  relatedIds: ['related1', 'related2']
};

const mockVariantProduct = {
  ...mockProduct,
  id: 'variantProduct',
  hasVariants: true
};

const mockProductImages = [
  { id: 'img1', url: 'url-img-1', order: 1 },
  { id: 'img2', url: 'url-img-2', order: 2 }
];

const mockVariants = [
  { id: 'var1', name: 'Variante 1', price: 150, stock: 5 },
  { id: 'var2', name: 'Variante 2', price: 180, stock: 3 }
];

const mockRelatedProducts = [
  { id: 'related1', name: 'Producto Relacionado 1', price: 120, mainImage: 'url-rel-1', slug: 'producto-rel-1' },
  { id: 'related2', name: 'Producto Relacionado 2', price: 200, mainImage: 'url-rel-2', slug: 'producto-rel-2' }
];

describe('PCB-A-09: Carga de detalles de producto', () => {
  let mockDocGet, mockImagesGet, mockVariantsGet, mockRelatedGet;
  
  beforeEach(() => {
    // Configurar mocks para documento principal
    mockDocGet = jest.fn().mockResolvedValue({
      exists: true,
      id: mockProduct.id,
      data: () => mockProduct
    });
    
    // Configurar mocks para imágenes
    mockImagesGet = jest.fn().mockResolvedValue({
      empty: false,
      forEach: jest.fn(callback => {
        mockProductImages.forEach((img, index) => {
          callback({
            id: img.id,
            data: () => img
          });
        });
      })
    });
    
    // Configurar mocks para variantes
    mockVariantsGet = jest.fn().mockResolvedValue({
      empty: false,
      forEach: jest.fn(callback => {
        mockVariants.forEach(variant => {
          callback({
            id: variant.id,
            data: () => variant
          });
        });
      })
    });
    
    // Configurar mocks para productos relacionados
    mockRelatedGet = jest.fn(relId => {
      const relatedProduct = mockRelatedProducts.find(p => p.id === relId);
      return Promise.resolve({
        exists: !!relatedProduct,
        id: relatedProduct?.id,
        data: () => relatedProduct
      });
    });
    
    // Inyectar mocks
    firebase.firestore().collection().doc().get = mockDocGet;
    firebase.firestore().collection().doc().collection().orderBy().get = mockImagesGet;
    firebase.firestore().collection().doc().collection().get = mockVariantsGet;
    firebase.firestore().collection().doc = jest.fn(id => ({
      get: () => mockRelatedGet(id),
      collection: jest.fn(() => ({
        orderBy: jest.fn(() => ({
          get: mockImagesGet
        })),
        get: mockVariantsGet
      }))
    }));
  });
  
  // Caso 1: productId no proporcionado
  test('1. Debe rechazar productId inválido', async () => {
    await expect(getProductDetails(null)).rejects.toThrow('Se requiere el ID del producto');
    await expect(getProductDetails('')).rejects.toThrow('Se requiere el ID del producto');
  });
  
  // Caso 2: Producto no existe
  test('2. Debe retornar null si el producto no existe', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: false
    });
    
    const result = await getProductDetails('nonexistent');
    expect(result).toBeNull();
  });
  
  // Caso 3: Producto básico sin variantes
  test('3. Debe retornar datos básicos e imágenes del producto', async () => {
    const result = await getProductDetails('product123');
    
    expect(result).toHaveProperty('id', 'product123');
    expect(result).toHaveProperty('name', 'Producto de Prueba');
    expect(result.images).toHaveLength(2);
    expect(result).not.toHaveProperty('variants');
    expect(result).not.toHaveProperty('relatedProducts');
  });
  
  // Caso 4: Producto con variantes
  test('4. Debe incluir variantes cuando el producto las tiene', async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      id: mockVariantProduct.id,
      data: () => mockVariantProduct
    });
    
    const result = await getProductDetails('variantProduct');
    
    expect(result).toHaveProperty('variants');
    expect(result.variants).toHaveLength(2);
    expect(result.variants[0]).toHaveProperty('id', 'var1');
  });
  
  // Caso 5: Producto con relacionados
  test('5. Debe incluir productos relacionados cuando se solicitan', async () => {
    const result = await getProductDetails('product123', true);
    
    expect(result).toHaveProperty('relatedProducts');
    expect(result.relatedProducts).toHaveLength(2);
    expect(result.relatedProducts[0]).toHaveProperty('id', 'related1');
  });
  
  // Caso 6: Error de base de datos
  test('6. Debe manejar errores en la consulta', async () => {
    mockDocGet.mockRejectedValueOnce(new Error('Error de conexión'));
    
    await expect(getProductDetails('product123')).rejects.toThrow('No se pudo recuperar la información del producto');
  });
}); 