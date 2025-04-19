# PCB-A-08: GESTIÓN DE HISTORIAL DE PEDIDOS

## Información General

| Campo                      | Valor                                                                                               |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| No                         | PCB-A-08                                                                                            |
| Nombre de la prueba        | PCB-A-08 - Recuperación del historial de pedidos                                                   |
| Módulo                    | Shop/Account                                                                                        |
| Descripción               | Prueba automatizada para validar la lógica de recuperación del historial de pedidos de un usuario |
| Caso de prueba relacionado | HU-U03: Historial de pedidos                                                                        |
| Realizado por              | Valentin Alejandro Perez Zurita                                                                     |
| Fecha                      | 16 de Abril del 2025                                                                                |

## Código Fuente a Probar

```javascript
// Ubicación: src/modules/shop/features/account/services/orderHistory.js

/**
 * Recupera el historial de pedidos de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de filtrado y paginación
 * @returns {Promise<Array>} - Lista de pedidos del usuario
 */
export const getUserOrderHistory = async (userId, options = {}) => {
  // Validación de parámetros
  if (!userId) {
    throw new Error('Se requiere el ID de usuario');
  }
  
  try {
    // Configurar opciones de filtrado
    const { 
      limit = 10, 
      startAfter = null,
      status = null,
      sortBy = 'date',
      sortDirection = 'desc'
    } = options;
  
    // Construir consulta base
    let query = db.collection('orders')
      .where('userId', '==', userId);
  
    // Aplicar filtro por status si se especifica
    if (status) {
      query = query.where('status', '==', status);
    }
  
    // Aplicar ordenamiento y paginación
    query = query.orderBy(sortBy, sortDirection);
  
    if (startAfter) {
      const startAfterDoc = await db.collection('orders').doc(startAfter).get();
      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }
  
    // Ejecutar la consulta
    query = query.limit(limit);
    const snapshot = await query.get();
  
    // Transformar documentos
    if (snapshot.empty) return [];
  
    const orders = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : null
      });
    });
  
    return orders;
  } catch (error) {
    console.error('Error al obtener historial de pedidos:', error);
    throw new Error('No se pudo recuperar el historial de pedidos');
  }
}
```

## Diagrama de Flujo

![Diagrama de Flujo](../diagramas/exports/PCB-A-08.png)

## Cálculo de la Complejidad Ciclomática

### Nodos Predicado

| Nodo | Descripción                        |
| ---- | ----------------------------------- |
| 2    | ¿userId válido?                   |
| 6    | ¿Se especificó status?            |
| 9    | ¿Existe startAfter?                |
| 12   | ¿Hay resultados?                   |
| 15   | Bloque catch (manejo de excepción) |

### Cálculo

| Método             | Resultado                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| Número de Regiones | 6                                                                                                   |
| Aristas - Nodos + 2 | 15 - 11 + 2 = 6                                                                                     |
| Nodos Predicado + 1 | 5 + 1 = 6                                                                                           |
| Conclusión         | La complejidad ciclomática es 6, lo que implica que se deben identificar 6 caminos independientes. |

## Determinación del Conjunto Básico de Caminos Independientes

| No | Descripción                    | Secuencia de nodos                                                                |
| -- | ------------------------------- | --------------------------------------------------------------------------------- |
| 1  | userId no proporcionado         | 1 → 2(No) → 3 → Fin                                                            |
| 2  | Consulta básica con resultados | 1 → 2(Sí) → 4 → 5 → 6(No) → 8 → 9(No) → 11 → 12(Sí) → 14 → Fin        |
| 3  | Consulta con filtro de status   | 1 → 2(Sí) → 4 → 5 → 6(Sí) → 7 → 8 → 9(No) → 11 → 12(Sí) → 14 → Fin  |
| 4  | Consulta con paginación        | 1 → 2(Sí) → 4 → 5 → 6(No) → 8 → 9(Sí) → 10 → 11 → 12(Sí) → 14 → Fin |
| 5  | Sin resultados                  | 1 → 2(Sí) → 4 → 5 → 6(No) → 8 → 9(No) → 11 → 12(No) → 13 → Fin         |
| 6  | Error de base de datos          | 1 → 2(Sí) → 4 → 5 → 15 → Fin                                                |

## Casos de Prueba Derivados

| Caso | Descripción             | Entrada                                         | Resultado Esperado                                    |
| ---- | ------------------------ | ----------------------------------------------- | ----------------------------------------------------- |
| 1    | userId no proporcionado  | userId=null, options={}                         | Error: "Se requiere el ID de usuario"                 |
| 2    | Consulta básica exitosa | userId="user123", options={}                    | Array de pedidos ordenados por fecha descendente      |
| 3    | Filtro por status        | userId="user123", options={status:"completed"}  | Array con pedidos de status "completed"               |
| 4    | Paginación              | userId="user123", options={startAfter:"order1"} | Array con pedidos posteriores a "order1"              |
| 5    | Sin resultados           | userId="user999" (no existente)                 | []                                                    |
| 6    | Error de base de datos   | userId="user123" (con error en BD)              | Error: "No se pudo recuperar el historial de pedidos" |

## Tabla de Resultados

| Caso | Entrada                               | Resultado Esperado                                    | Resultado Obtenido                                    | Estado   |
| ---- | ------------------------------------- | ----------------------------------------------------- | ----------------------------------------------------- | -------- |
| 1    | userId=null                           | Error: "Se requiere el ID de usuario"                 | Error: "Se requiere el ID de usuario"                 | ✅ Pasó |
| 2    | userId="user123", options={}          | [pedidos del usuario]                                 | [pedidos del usuario]                                 | ✅ Pasó |
| 3    | userId="user123", status="completed"  | [pedidos completados]                                 | [pedidos completados]                                 | ✅ Pasó |
| 4    | userId="user123", startAfter="order1" | [pedidos paginados]                                   | [pedidos paginados]                                   | ✅ Pasó |
| 5    | userId="user999"                      | []                                                    | []                                                    | ✅ Pasó |
| 6    | userId="user123" (con error en BD)    | Error: "No se pudo recuperar el historial de pedidos" | Error: "No se pudo recuperar el historial de pedidos" | ✅ Pasó |

## Herramienta Usada

- Jest

## Script de Prueba Automatizada

```javascript
∂
```
