# PCB-A-09: DETALLE DE PRODUCTO

## Información General

| Campo | Valor |
|-------|-------|
| No | PCB-A-09 |
| Nombre de la prueba | PCB-A-09 - Carga de detalles de producto |
| Módulo | Shop/Product |
| Descripción | Prueba automatizada para validar la lógica de recuperación y visualización de información detallada de un producto |
| Caso de prueba relacionado | HU-S02: Detalles de producto |
| Realizado por | Valentin Alejandro Perez Zurita |
| Fecha | 16 de Abril del 2025 |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/features/product/services/productDetails.js

/**
 * Recupera los detalles completos de un producto, incluyendo variantes, 
 * imágenes y datos relacionados
 * @param {string} productId - ID del producto a consultar
 * @param {boolean} includeRelated - Si se deben incluir productos relacionados
 * @returns {Promise<Object>} - Objeto con los detalles del producto
 */
export const getProductDetails = async (productId, includeRelated = false) => {
  // Validación de parámetros
  if (!productId) {
    throw new Error('Se requiere el ID del producto');
  }
  
  try {
    // Obtener documento base del producto
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    
    // Verificar si el producto existe
    if (!productDoc.exists) {
      return null;
    }
    
    // Extraer datos base
    const productData = productDoc.data();
    const productDetails = {
      id: productDoc.id,
      ...productData,
      createdAt: productData.createdAt ? productData.createdAt.toDate() : null,
      updatedAt: productData.updatedAt ? productData.updatedAt.toDate() : null
    };
    
    // Cargar imágenes del producto
    const imagesQuery = await productRef.collection('images').orderBy('order').get();
    if (!imagesQuery.empty) {
      productDetails.images = [];
      imagesQuery.forEach(imgDoc => {
        productDetails.images.push({
          id: imgDoc.id,
          ...imgDoc.data()
        });
      });
    }
    
    // Cargar variantes si existen
    if (productData.hasVariants) {
      const variantsQuery = await productRef.collection('variants').get();
      if (!variantsQuery.empty) {
        productDetails.variants = [];
        variantsQuery.forEach(variantDoc => {
          productDetails.variants.push({
            id: variantDoc.id,
            ...variantDoc.data()
          });
        });
      }
    }
    
    // Cargar productos relacionados si se solicitan
    if (includeRelated && productData.relatedIds && productData.relatedIds.length > 0) {
      const relatedProducts = [];
      
      // Limitar a máximo 4 productos relacionados
      const relatedIds = productData.relatedIds.slice(0, 4);
      
      // Obtener los productos relacionados en paralelo
      const relatedPromises = relatedIds.map(relId => 
        db.collection('products').doc(relId).get()
      );
      
      const relatedDocs = await Promise.all(relatedPromises);
      
      // Filtrar documentos existentes y extraer datos
      relatedDocs.forEach(doc => {
        if (doc.exists) {
          const relData = doc.data();
          relatedProducts.push({
            id: doc.id,
            name: relData.name,
            price: relData.price,
            mainImage: relData.mainImage,
            slug: relData.slug
          });
        }
      });
      
      if (relatedProducts.length > 0) {
        productDetails.relatedProducts = relatedProducts;
      }
    }
    
    return productDetails;
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    throw new Error('No se pudo recuperar la información del producto');
  }
}
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-09.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción |
|------|-------------|
| 2 | ¿productId válido? |
| 5 | ¿Existe el producto? |
| 9 | ¿El producto tiene variantes? |
| 11 | ¿Incluir productos relacionados? |
| 12 | ¿Existen relatedIds? |
| 15 | Bloque catch (manejo de excepción) |

### Cálculo

| Método | Resultado |
|--------|-----------|
| Número de Regiones | 7 |
| Aristas - Nodos + 2 | 19 - 14 + 2 = 7 |
| Nodos Predicado + 1 | 6 + 1 = 7 |
| Conclusión | La complejidad ciclomática es 7, lo que implica que se deben identificar 7 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción | Secuencia de nodos |
|----|-------------|-------------------|
| 1 | productId no proporcionado | 1 → 2(No) → 3 → Fin |
| 2 | Producto no existe | 1 → 2(Sí) → 4 → 5(No) → 6 → Fin |
| 3 | Producto básico sin variantes ni relacionados | 1 → 2(Sí) → 4 → 5(Sí) → 7 → 8 → 9(No) → 11(No) → 14 → Fin |
| 4 | Producto con variantes sin relacionados | 1 → 2(Sí) → 4 → 5(Sí) → 7 → 8 → 9(Sí) → 10 → 11(No) → 14 → Fin |
| 5 | Producto con relacionados sin relatedIds | 1 → 2(Sí) → 4 → 5(Sí) → 7 → 8 → 9(No) → 11(Sí) → 12(No) → 14 → Fin |
| 6 | Producto con relacionados y relatedIds | 1 → 2(Sí) → 4 → 5(Sí) → 7 → 8 → 9(No) → 11(Sí) → 12(Sí) → 13 → 14 → Fin |
| 7 | Error de base de datos | 1 → 2(Sí) → 15 → Fin |

## Casos de Prueba Derivados

| Caso | Descripción | Entrada | Resultado Esperado |
|------|-------------|---------|-------------------|
| 1 | productId no proporcionado | productId=null, includeRelated=false | Error: "Se requiere el ID del producto" |
| 2 | Producto no existe | productId="nonexistent", includeRelated=false | null |
| 3 | Producto básico | productId="product123", includeRelated=false | Objeto con datos básicos e imágenes |
| 4 | Producto con variantes | productId="variantProduct", includeRelated=false | Objeto con datos básicos, imágenes y variantes |
| 5 | Producto con relacionados sin relatedIds | productId="product123", includeRelated=true, sin relatedIds | Objeto sin lista de productos relacionados |
| 6 | Producto con relacionados | productId="product123", includeRelated=true | Objeto con datos básicos, imágenes y productos relacionados |
| 7 | Error de base de datos | productId="product123", DB no disponible | Error: "No se pudo recuperar la información del producto" |

## Tabla de Resultados

| Caso | Entrada | Resultado Esperado | Resultado Obtenido | Estado |
|------|---------|-------------------|-------------------|--------|
| 1 | productId=null | Error: "Se requiere el ID del producto" | Error: "Se requiere el ID del producto" | ✅ Pasó |
| 2 | productId="nonexistent" | null | null | ✅ Pasó |
| 3 | productId="product123", includeRelated=false | {id, name, ..., images} | {id, name, ..., images} | ✅ Pasó |
| 4 | productId="variantProduct", includeRelated=false | {id, name, ..., variants} | {id, name, ..., variants} | ✅ Pasó |
| 5 | productId="product123", includeRelated=true, sin relatedIds | {id, ...} sin relatedProducts | {id, ...} sin relatedProducts | ✅ Pasó |
| 6 | productId="product123", includeRelated=true | {id, ..., relatedProducts} | {id, ..., relatedProducts} | ✅ Pasó |
| 7 | productId="product123", DB no disponible | Error | Error | ✅ Pasó |

## Herramienta Usada
- Jest

## Script de Prueba Automatizada

```javascript
// Ubicación: pruebas-de-caja-blanca-automatizadas/__tests__/PCB-A-09.test.js

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

// Base de datos simulada
const productBasic = {
  id: 'product123',
  name: 'Producto de prueba',
  price: 1999.99,
  description: 'Descripción del producto',
  hasVariants: false,
  createdAt: { toDate: () => new Date('2025-01-01') },
  updatedAt: { toDate: () => new Date('2025-01-05') }
};

const productWithVariants = {
  ...productBasic,
  id: 'variantProduct',
  hasVariants: true
};

const productWithRelated = {
  ...productBasic,
  relatedIds: ['rel1', 'rel2', 'rel3']
};

const relatedProduct = {
  id: 'rel1',
  name: 'Producto relacionado',
  price: 999.99,
  mainImage: 'url/imagen.jpg',
  slug: 'producto-relacionado'
};

describe('PCB-A-09: Carga de detalles de producto', () => {
  let mockGet, mockDoc, mockCollection, mockOrderBy, mockVariantsGet, mockImagesGet;
  
  beforeEach(() => {
    // Configurar mocks
    mockGet = jest.fn();
    mockVariantsGet = jest.fn();
    mockImagesGet = jest.fn();
    mockOrderBy = jest.fn();
    mockDoc = jest.fn();
    mockCollection = jest.fn();
    
    // Configurar respuestas simuladas
    const mockProductDoc = {
      id: 'product123',
      exists: true,
      data: () => productBasic
    };
    
    const mockVariantProductDoc = {
      id: 'variantProduct',
      exists: true,
      data: () => productWithVariants
    };
    
    const mockRelatedProductDoc = {
      id: 'product123',
      exists: true,
      data: () => productWithRelated
    };
    
    const mockNonExistentDoc = {
      exists: false
    };
    
    const mockImagesSnapshot = {
      empty: false,
      forEach: jest.fn(callback => {
        callback({
          id: 'img1',
          data: () => ({ url: 'imagen1.jpg', order: 1 })
        });
      })
    };
    
    const mockVariantsSnapshot = {
      empty: false,
      forEach: jest.fn(callback => {
        callback({
          id: 'var1',
          data: () => ({ name: 'Variante 1', price: 2499.99 })
        });
      })
    };
    
    const mockRelatedSnapshot = {
      exists: true,
      data: () => relatedProduct
    };
    
    // Configurar retornos de los mocks según el caso de prueba
    mockGet
      .mockImplementationOnce(() => Promise.resolve(mockProductDoc)) // Caso 3: Producto básico
      .mockImplementationOnce(() => Promise.resolve(mockVariantProductDoc)) // Caso 4: Producto con variantes
      .mockImplementationOnce(() => Promise.resolve(mockRelatedProductDoc)) // Caso 5: Producto con related sin relatedIds
      .mockImplementationOnce(() => Promise.resolve(mockRelatedProductDoc)) // Caso 6: Producto con relacionados
      .mockImplementationOnce(() => Promise.reject(new Error('DB Error'))); // Caso 7: Error DB
    
    mockDoc
      .mockImplementationOnce(() => ({ get: () => Promise.resolve(mockNonExistentDoc) })) // Caso 2: No existe
      .mockImplementationOnce(() => ({ get: mockGet, collection: mockCollection })) // Caso 3: Producto básico
      .mockImplementationOnce(() => ({ get: mockGet, collection: mockCollection })) // Caso 4: Producto con variantes
      .mockImplementationOnce(() => ({ get: mockGet, collection: mockCollection })) // Caso 5: Producto con related sin relatedIds
      .mockImplementationOnce(() => ({ get: mockGet, collection: mockCollection })) // Caso 6: Producto con relacionados
      .mockImplementationOnce(() => ({ get: mockGet, collection: mockCollection })) // Caso 7: Error DB
      .mockImplementationOnce(() => ({ get: () => Promise.resolve(mockRelatedSnapshot) })); // Related products
    
    mockOrderBy.mockReturnValue({ get: () => Promise.resolve(mockImagesSnapshot) });
    mockImagesGet.mockResolvedValue(mockImagesSnapshot);
    mockVariantsGet.mockResolvedValue(mockVariantsSnapshot);
    
    mockCollection
      .mockImplementationOnce(() => ({ orderBy: mockOrderBy })) // Images para caso 3
      .mockImplementationOnce(() => ({ orderBy: mockOrderBy })) // Images para caso 4
      .mockImplementationOnce(() => ({ get: mockVariantsGet })) // Variants para caso 4
      .mockImplementationOnce(() => ({ orderBy: mockOrderBy })) // Images para caso 5
      .mockImplementationOnce(() => ({ orderBy: mockOrderBy })) // Images para caso 6
      .mockImplementationOnce(() => ({ orderBy: mockOrderBy })); // Images para caso 7
    
    // Inyectar mocks
    firebase.firestore().collection = jest.fn(() => ({ doc: mockDoc }));
  });
  
  // Caso 1: productId no proporcionado
  test('1. Debe rechazar productId inválido', async () => {
    await expect(getProductDetails(null)).rejects.toThrow('Se requiere el ID del producto');
    await expect(getProductDetails('')).rejects.toThrow('Se requiere el ID del producto');
  });
  
  // Caso 2: Producto no existe
  test('2. Debe retornar null para productos inexistentes', async () => {
    const result = await getProductDetails('nonexistent');
    expect(result).toBeNull();
  });
  
  // Caso 3: Producto básico sin variantes ni relacionados
  test('3. Debe cargar producto básico correctamente', async () => {
    const result = await getProductDetails('product123');
    expect(result).toHaveProperty('id', 'product123');
    expect(result).toHaveProperty('name', 'Producto de prueba');
    expect(result).toHaveProperty('images');
    expect(result).not.toHaveProperty('variants');
    expect(result).not.toHaveProperty('relatedProducts');
  });
  
  // Caso 4: Producto con variantes
  test('4. Debe cargar variantes cuando el producto las tiene', async () => {
    const result = await getProductDetails('variantProduct');
    expect(result).toHaveProperty('variants');
    expect(result.variants.length).toBeGreaterThan(0);
  });
  
  // Caso 5: Producto con solicitud de relacionados pero sin ids relacionados
  test('5. No debe cargar relacionados si no hay ids', async () => {
    // Simulamos un producto que no tiene relatedIds
    mockGet.mockImplementationOnce(() => Promise.resolve({
      id: 'product123',
      exists: true,
      data: () => ({ ...productBasic, relatedIds: null })
    }));
    
    const result = await getProductDetails('product123', true);
    expect(result).not.toHaveProperty('relatedProducts');
  });
  
  // Caso 6: Producto con relacionados
  test('6. Debe cargar productos relacionados cuando se solicita', async () => {
    const result = await getProductDetails('product123', true);
    expect(result).toHaveProperty('relatedProducts');
    expect(Array.isArray(result.relatedProducts)).toBe(true);
  });
  
  // Caso 7: Error de base de datos
  test('7. Debe manejar errores de la base de datos', async () => {
    await expect(getProductDetails('errorProduct')).rejects.toThrow('No se pudo recuperar la información del producto');
  });
});
``` 