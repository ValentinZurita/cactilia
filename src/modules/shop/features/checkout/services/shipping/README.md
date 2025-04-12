# Servicios de Shipping Centralizados

Esta carpeta contiene todos los servicios relacionados con opciones de envío, cálculos y procesamiento de reglas de envío. 

## Estructura

- **ShippingService.js**: Servicio principal para todas las funcionalidades de envío.
- **ShippingZonesService.js**: Gestión de zonas de envío y cobertura geográfica.
- **RuleService.js**: Servicio para manejar reglas de envío y agrupar productos.
- **CombinationService.js**: Manejo de combinaciones óptimas de envío para pedidos complejos.
- **ShippingGroupingService.js**: Agrupación de productos por reglas de envío comunes.
- **ShippingOptionsService.js**: Manejo de opciones de envío disponibles.
- **ShippingRulesEngine.js**: Motor para aplicación de reglas de envío.
- **ShippingRulesGreedy.js**: Algoritmo greedy para optimización de envíos.
- **mockData.js**: Datos de prueba para development.

## Centralización

Todos los servicios relacionados con shipping han sido centralizados en esta carpeta. Cualquier función o servicio relacionado con envíos debe colocarse aquí. 

## Uso

Para importar estos servicios:

```js
// Importar funciones específicas
import { getShippingOptions, allProductsCovered } from '../services/shipping';

// Importar un servicio completo
import { ShippingZonesService } from '../services/shipping';
```

## Consideraciones para desarrollo

1. **Evitar duplicación**: No crear funciones/servicios relacionados con shipping fuera de esta carpeta.
2. **Mantener ordenado**: Cada archivo debe tener responsabilidades claras y específicas.
3. **Documentación**: Documentar las funciones públicas con JSDoc.
4. **Compatibilidad**: Al hacer cambios, asegurar que los componentes existentes siguen funcionando.

## Servicios migrados

Los siguientes archivos han sido migrados a esta carpeta centralizada:

- `shippingGroupingService.js` (anteriormente en la raíz de services)
- `ShippingZonesService.js` (anteriormente en la raíz de services)

Si encuentras referencias a estos archivos en su ubicación antigua, deberían actualizarse para usar esta ubicación centralizada. 