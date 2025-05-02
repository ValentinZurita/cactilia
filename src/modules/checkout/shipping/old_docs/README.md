# Módulo de Envío (NewShipping3)

Este módulo gestiona las opciones de envío durante el proceso de checkout, calculando las alternativas disponibles según la dirección del usuario y los productos en el carrito.

## Arquitectura

El módulo está organizado en las siguientes carpetas:

- **components**: Componentes React para la interfaz de usuario
- **services**: Servicios para interactuar con las APIs y procesar datos
- **hooks**: Hooks personalizados para gestionar estado y lógica
- **utils**: Utilidades y funciones de ayuda
- **constants**: Constantes y configuraciones
- **styles**: Estilos CSS para los componentes

## Flujo de trabajo

1. **Selección de dirección**: El usuario selecciona o ingresa una dirección de envío
2. **Cálculo de opciones**: El sistema obtiene las reglas de envío aplicables y las normaliza
3. **Validación de productos**: Se verifica qué productos pueden enviarse a la dirección seleccionada
4. **Agrupación óptima**: Se agrupan los productos en paquetes usando un algoritmo greedy para minimizar costos
5. **Presentación de opciones**: Se muestran las opciones de envío disponibles al usuario
6. **Cálculo de costos**: Se calculan los costos de envío considerando peso, cantidad y reglas especiales

## Componentes principales

### ShippingOptions
Componente principal que muestra las opciones de envío disponibles. Gestiona la selección de opciones y notifica cambios en el costo de envío.

### ShippingPackage
Muestra información detallada de cada paquete de envío, incluyendo:
- Tipo de envío (local, nacional, express)
- Tiempo estimado de entrega
- Costo total
- Productos incluidos
- Peso total y distribución en paquetes

### ShippingManager / ShippingManagerForCheckout
Componentes de alto nivel que integran la funcionalidad de envío en el checkout, coordinando la selección de dirección con las opciones de envío.

### AddressSelector
Permite al usuario seleccionar una dirección existente o crear una nueva para el envío.

### UnshippableProducts
Muestra información sobre productos que no pueden enviarse a la dirección seleccionada.

## Servicios clave

### checkoutShippingService
Servicio principal que gestiona la obtención de opciones de envío. Coordina:
- Normalización de datos del carrito
- Obtención y procesamiento de reglas de envío
- Formateo de opciones para mostrar en la UI

### shippingRulesService
Gestiona la obtención de reglas de envío desde Firestore.

## Algoritmo de cálculo

El sistema utiliza un algoritmo greedy (codicioso) para:

1. Determinar si una regla de envío es válida para una dirección (`isRuleValidForAddress`)
2. Calcular costos de envío considerando:
   - Peso base y extra
   - Número máximo de productos por paquete
   - Montos mínimos para envío gratuito
3. Distribuir productos en paquetes según restricciones de peso y cantidad
4. Maximizar el uso de reglas de envío compartidas para minimizar costos

## Normalización de reglas

El componente `RuleFormatNormalizer` estandariza las reglas de envío para garantizar compatibilidad con el algoritmo greedy, manejando:

- Reglas de cobertura nacional
- Reglas por estado/provincia
- Reglas por código postal
- Combinaciones de reglas

## Tiempos de entrega

Los tiempos de entrega se calculan a partir de:
1. Datos explícitos de la regla (`tiempo_minimo`, `tiempo_maximo`)
2. Datos de opciones de mensajería (`minDays`, `maxDays`)
3. Texto descriptivo del tiempo de entrega (`tiempo_entrega`)

## Integración con el checkout

El módulo se integra en el proceso de checkout mediante:
- Notificaciones de cambios en costos de envío
- Validación de opciones seleccionadas
- Gestión del estado de carga y errores
- Soporte para envíos parciales 