# Módulo de Reglas de Envío

Este módulo permite configurar las reglas de envío para la tienda. Las reglas de envío determinan los costos y opciones de envío disponibles para los clientes según su ubicación.

## Estructura de datos

Las reglas de envío se almacenan en Firebase en la colección `reglas_envio` con la siguiente estructura:

```javascript
{
  // Información básica
  zona: "Nombre de la zona",
  activo: true/false,
  zipcodes: ["estado_TAB", "12345", ...],  // Códigos postales o estados cubiertos
  
  // Configuración de envío gratuito
  envio_gratis: true/false,  // Si es true, el envío siempre es gratuito
  envio_gratis_monto_minimo: "500",  // Opcional: monto mínimo para envío gratuito
  
  // Opciones de mensajería disponibles
  opciones_mensajeria: [
    {
      // Información de la opción
      label: "Básico",  // Nombre visible para el cliente
      nombre: "Estafeta",  // Proveedor de envío
      tiempo_entrega: "2-5 días",  // Tiempo de entrega en texto
      minDays: 2,  // Tiempo mínimo en días
      maxDays: 5,  // Tiempo máximo en días
      
      // Precio y configuración
      precio: 350,  // Precio base de envío
      usaRangosPeso: false,  // Si usa rangos de peso para el precio
      rangosPeso: [],  // Rangos de peso si usaRangosPeso es true
      
      // Configuración de paquetes
      configuracion_paquetes: {
        peso_maximo_paquete: 1,  // Peso máximo por paquete en kg
        maximo_productos_por_paquete: 1,  // Productos máximos por paquete
        costo_por_kg_extra: 100  // OPCIONAL: Costo por kg extra
      }
    }
  ],
  
  // Metadatos
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Formulario de Creación/Edición

El formulario de creación/edición de reglas de envío tiene tres pestañas:

1. **Información Básica**: Configuración de la zona y cobertura
2. **Reglas**: Configuración de envío gratuito y condiciones
3. **Métodos**: Configuración de opciones de mensajería

### Métodos de Envío

Cada método de envío puede configurarse de dos formas:

1. **Precio fijo**: Se aplica un precio base fijo para todos los envíos
2. **Rangos de peso**: El precio varía según el peso del pedido

Adicionalmente, se puede configurar la estructura de paquetes:
- **Peso máximo por paquete**: Limite de peso para un paquete
- **Máximo productos por paquete**: Cuántos productos caben en un paquete
- **Costo por kg extra**: OPCIONAL - Costo adicional por kg que exceda el peso máximo

## Procesamiento de Datos

Al guardar una regla, el formulario procesa los datos para asegurar una estructura consistente:

1. Se limpian campos innecesarios
2. Se normaliza la estructura de datos
3. Los campos opcionales (como costo_por_kg_extra) solo se incluyen cuando corresponde

## Consideraciones Importantes

- El campo `costo_por_kg_extra` es opcional y solo se guarda cuando se activa la opción "Cobrar por kg extra"
- El campo `envio_gratis_monto_minimo` solo se incluye cuando se activa la opción de envío gratuito a partir de cierto monto
- Si `envio_gratis` es `true`, los precios configurados en los métodos de envío se ignoran

## Problema resuelto

Se ha corregido un error que impedía actualizar los productos con nuevas reglas de envío. El error ocurría por un valor `undefined` en el campo `shippingRulesInfo`.

## Cómo agregar reglas de envío a productos

1. Ve al panel de administración (`/admin`) e inicia sesión
2. Navega a la sección de "Productos"
3. Edita un producto existente o crea uno nuevo
4. Utiliza el selector "Reglas de envío" para asignar una o más reglas al producto
5. Guarda el producto

## Estructura de datos

El sistema utiliza los siguientes campos:

- `shippingRuleIds` (array): Lista de IDs de reglas de envío asignadas al producto
- `shippingRuleId` (string): Para compatibilidad, contiene el primer ID de la lista anterior

## Depuración de envíos

Se ha implementado un panel de diagnóstico en el checkout que muestra:

1. Grupos de envío generados basados en reglas
2. Costos de envío calculados por cada grupo
3. Detalles de cada regla de envío aplicada

## Resolución de problemas comunes

Si al asignar reglas de envío sigue mostrando error:

1. Verifica que la colección `reglas_envio` o `zonas_envio` exista en Firestore
2. Asegúrate de que cada regla tenga al menos una opción de mensajería
3. Cada opción de mensajería debe tener un precio válido

## Flujo de cálculo de envío

1. Los productos se agrupan por reglas de envío comunes
2. Se calcula el peso y cantidad total de cada grupo
3. Se determina el número de paquetes necesarios
4. Se aplica la tarifa base y recargos por sobrepeso
5. Se verifica si aplica envío gratuito por compra mínima

## Formato de regla de envío recomendado

```json
{
  "zona": "Nombre de la zona",
  "activo": true,
  "opciones_mensajeria": [
    {
      "nombre": "Envío Estándar",
      "precio": "200",
      "tiempo_entrega": "3-5 días",
      "configuracion_paquetes": {
        "peso_maximo_paquete": 20,
        "costo_por_kg_extra": 10,
        "maximo_productos_por_paquete": 10
      }
    }
  ]
}
``` 