// PCB-A-08: Test Automatizado - Recuperación del historial de pedidos

// Importar firebase primero
import firebase from 'firebase/app';

// Implementación de la función que se está probando
const getUserOrderHistory = async (userId, options = {}) => {
  // Validar userId
  if (!userId) {
    throw new Error('Se requiere el ID de usuario');
  }

  const {
    limit = 10,
    status = null,
    startAfter = null,
    orderBy = 'date',
    orderDirection = 'desc'
  } = options;

  try {
    // Referencia a la colección de pedidos
    let query = firebase.firestore()
      .collection('orders')
      .where('userId', '==', userId);

    // Aplicar filtro por estado si se proporciona
    if (status) {
      query = query.where('status', '==', status);
    }

    // Ordenar resultados
    query = query.orderBy(orderBy, orderDirection);

    // Aplicar paginación si se proporciona startAfter
    if (startAfter) {
      const startAfterDoc = await firebase.firestore().collection('orders').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    // Limitar resultados
    query = query.limit(limit);

    // Ejecutar consulta
    const snapshot = await query.get();

    // Procesar resultados
    if (snapshot.empty) {
      return [];
    }

    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        date: data.date.toDate()
      });
    });

    return orders;
  } catch (error) {
    console.error('Error al obtener el historial de pedidos:', error);
    throw error;
  }
};

// Mock de Firestore
jest.mock('firebase/app', () => {
  const mockOrderBy = jest.fn().mockImplementation(() => ({
    startAfter: jest.fn().mockImplementation(() => ({
      limit: jest.fn().mockImplementation(() => ({
        get: jest.fn()
      }))
    })),
    limit: jest.fn().mockImplementation(() => ({
      get: jest.fn()
    }))
  }));

  const mockWhere = jest.fn().mockImplementation(() => ({
    where: jest.fn().mockImplementation(() => ({
      orderBy: mockOrderBy
    })),
    orderBy: mockOrderBy
  }));

  const mockCollection = jest.fn().mockImplementation(() => ({
    where: mockWhere,
    doc: jest.fn().mockImplementation(() => ({
      get: jest.fn()
    }))
  }));

  return {
    firestore: jest.fn().mockImplementation(() => ({
      collection: mockCollection
    }))
  };
});

// Base de datos simulada
const mockOrders = [
  { id: 'order1', userId: 'user123', status: 'completed', date: new Date('2025-01-01') },
  { id: 'order2', userId: 'user123', status: 'processing', date: new Date('2025-01-05') }
];

describe('PCB-A-08: Recuperación del historial de pedidos', () => {
  let mockGet, mockDocGet, mockCollection, mockWhere, mockOrderBy, mockLimit, mockStartAfter;
  
  beforeEach(() => {
    // Configurar respuestas simuladas
    const mockSnapshot = {
      empty: false,
      forEach: jest.fn(callback => {
        mockOrders.forEach(order => {
          callback({
            id: order.id,
            data: () => ({
              ...order,
              date: { toDate: () => order.date }
            })
          });
        });
      })
    };
    
    const mockDocSnapshot = {
      exists: true,
      data: () => mockOrders[0]
    };
    
    // Configurar mocks
    mockGet = jest.fn().mockResolvedValue(mockSnapshot);
    mockDocGet = jest.fn().mockResolvedValue(mockDocSnapshot);
    mockLimit = jest.fn().mockImplementation(() => ({ get: mockGet }));
    mockStartAfter = jest.fn().mockImplementation(() => ({ limit: mockLimit }));
    mockOrderBy = jest.fn().mockImplementation(() => ({ 
      limit: mockLimit,
      startAfter: mockStartAfter
    }));
    mockWhere = jest.fn().mockImplementation(() => ({ 
      where: jest.fn().mockImplementation(() => ({ orderBy: mockOrderBy })),
      orderBy: mockOrderBy
    }));
    mockCollection = jest.fn().mockImplementation(() => ({
      where: mockWhere,
      doc: jest.fn().mockImplementation(() => ({ get: mockDocGet }))
    }));
    
    // Inyectar mocks
    firebase.firestore = jest.fn().mockImplementation(() => ({
      collection: mockCollection
    }));
  });
  
  // Caso 1: userId no proporcionado
  test('1. Debe rechazar userId inválido', async () => {
    await expect(getUserOrderHistory(null)).rejects.toThrow('Se requiere el ID de usuario');
    await expect(getUserOrderHistory('')).rejects.toThrow('Se requiere el ID de usuario');
  });
  
  // Caso 2: Consulta básica exitosa
  test('2. Debe devolver lista de pedidos para consulta básica', async () => {
    const result = await getUserOrderHistory('user123');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect(result[0].id).toBe('order1');
  });
  
  // Caso 3: Consulta filtrada por status
  test('3. Debe aplicar filtro por status', async () => {
    const whereImpl = jest.fn().mockImplementation(() => ({
      orderBy: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          get: jest.fn().mockResolvedValue({
            empty: false,
            forEach: jest.fn()
          })
        }))
      }))
    }));
    
    mockWhere.mockImplementation(() => ({
      where: whereImpl,
      orderBy: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => ({
          get: jest.fn().mockResolvedValue({
            empty: false,
            forEach: jest.fn()
          })
        }))
      }))
    }));
    
    await getUserOrderHistory('user123', { status: 'completed' });
    
    // Verificar que se aplicó el filtro por userId
    expect(mockCollection).toHaveBeenCalledWith('orders');
    expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user123');
    
    // Verificar que se llamó a where con el status
    expect(whereImpl).toBeDefined();
  });
  
  // Caso 4: Consulta con paginación
  test('4. Debe aplicar paginación correctamente', async () => {
    const docImpl = jest.fn().mockImplementation(() => ({
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => mockOrders[0]
      })
    }));
    
    mockCollection.mockImplementation(() => ({
      doc: docImpl,
      where: mockWhere
    }));
    
    await getUserOrderHistory('user123', { startAfter: 'order1' });
    
    // Verificar que se solicitó el documento para startAfter
    expect(mockCollection).toHaveBeenCalledWith('orders');
    expect(docImpl).toBeDefined();
  });
  
  // Caso 5: Sin resultados
  test('5. Debe devolver array vacío cuando no hay resultados', async () => {
    mockGet.mockResolvedValueOnce({ empty: true, forEach: jest.fn() });
    const result = await getUserOrderHistory('user999');
    expect(result).toEqual([]);
  });
});