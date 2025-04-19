# Guía de pruebas para Cactilia

Este documento describe la configuración y las mejores prácticas para pruebas en el proyecto Cactilia.

## Configuración de pruebas

### Herramientas principales
- **Jest**: Framework de pruebas ([Documentación](https://jestjs.io/docs/getting-started))
- **React Testing Library**: Para pruebas de componentes React ([Documentación](https://testing-library.com/docs/react-testing-library/intro/))
- **@testing-library/react-hooks**: Para probar hooks personalizados
- **jest-environment-jsdom**: Entorno DOM para Jest

### Configuración de Jest

El proyecto utiliza ESM (ECMAScript Modules), lo que requiere una configuración especial para Jest:

```javascript
// jest.config.mjs
export default {
  testEnvironment: 'jsdom',
  transform: {},
  extensionsToTreatAsEsm: ['.jsx', '.js'],
  moduleNameMapper: {
    // Mapeos para módulos problemáticos
    '^firebase/auth$': '<rootDir>/__mocks__/firebase-auth.js',
    // Otros mapeos...
  },
  // Otras configuraciones...
};
```

### Ejecución

Comandos principales:
```bash
# Ejecutar todas las pruebas
yarn test

# Ejecutar pruebas específicas
yarn test src/modules/admin

# Actualizar snapshots
yarn test -- -u

# Ver cobertura
yarn test -- --coverage
```

## Estructura de pruebas

### Organización de archivos

Las pruebas siguen la misma estructura que el código fuente:

```
src/
  modules/
    admin/
      components/
        login/
          __tests__/
            Login.test.jsx
          Login.jsx
    auth/
      hooks/
        __tests__/
          useAuth.test.js
        useAuth.js
```

### Convenciones de nomenclatura

- Archivos de prueba: `ComponentName.test.jsx` o `hookName.test.js`
- Carpetas de prueba: `__tests__/`
- Test IDs: descriptivos y consistentes (ej: `email-field`, `submit-button`)

## Estrategias de mocking

### 1. Mocks en carpeta `__mocks__`

Para dependencias externas problemáticas:

```javascript
// __mocks__/firebase-auth.js
export const signInWithEmailAndPassword = jest.fn(() => Promise.resolve());
export const createUserWithEmailAndPassword = jest.fn(() => Promise.resolve());
// Más funciones simuladas...
```

### 2. Mocks inline en archivos de prueba

Para componentes y hooks internos:

```javascript
jest.mock('../../utils/validation', () => ({
  validateEmail: jest.fn(email => email.includes('@'))
}));
```

### 3. Componentes simplificados para pruebas

Cuando hay problemas con las importaciones de ESM:

```javascript
// Versión simplificada del componente para pruebas
const ComponentUnderTest = () => {
  // Implementación simplificada
  return <div>Componente simulado</div>;
};
```

## Patrones comunes de prueba

### 1. Pruebas de renderizado

```javascript
test('renderiza correctamente', () => {
  render(<Component />);
  expect(screen.getByText('Texto esperado')).toBeInTheDocument();
});
```

### 2. Pruebas de interacción

```javascript
test('responde al clic', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick} />);
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### 3. Pruebas asíncronas

```javascript
test('carga datos asincrónicamente', async () => {
  render(<DataLoader />);
  expect(screen.getByText('Cargando...')).toBeInTheDocument();
  await waitFor(() => screen.getByText('Datos cargados'));
  expect(screen.getByText('Datos cargados')).toBeInTheDocument();
});
```

### 4. Pruebas de hooks

```javascript
test('hook actualiza el estado correctamente', () => {
  const { result } = renderHook(() => useCustomHook());
  act(() => {
    result.current.update('nuevo valor');
  });
  expect(result.current.value).toBe('nuevo valor');
});
```

## Problemas comunes y soluciones

### Problema: Módulos ESM con Firebase

Firebase utiliza ESM, lo que puede causar conflictos con Jest.

**Solución**: 
1. Usar mocks completos en `__mocks__`
2. Configurar `moduleNameMapper` en Jest
3. Implementar componentes simplificados para pruebas

### Problema: Dependencias complejas

Componentes con muchas dependencias son difíciles de probar.

**Solución**:
1. Refactorizar hacia componentes más pequeños
2. Usar inyección de dependencias
3. Extraer lógica a hooks personalizados

### Problema: Errores con Context API

Componentes que usan Context pueden fallar en pruebas aisladas.

**Solución**:
1. Crear wrappers de prueba con los providers necesarios
2. Extraer lógica a hooks para probarla de forma independiente

## Mejores prácticas

1. **Prueba comportamiento, no implementación**
   - Enfócate en lo que hace el componente, no en cómo lo hace

2. **Utiliza test-ids con moderación**
   - Prefiere roles, textos y etiquetas accesibles

3. **Aísla tus pruebas**
   - Cada prueba debe ser independiente de las demás

4. **Usa mocks efectivamente**
   - Mockea solo lo necesario, mantén los mocks simples

5. **Asegúrate de limpiar después de cada prueba**
   - Usa `beforeEach` y `afterEach` para configurar y limpiar

6. **Prioriza la cobertura de casos críticos**
   - Identifica y prueba las funcionalidades más importantes

## Pruebas de Caja Blanca Manuales

| N° | Nombre de la Prueba | Descripción | Fecha | Responsable | Historia Relacionada |
|---|---|---|---|---|---|
| PCB-M-01 | Validación de campos en registro de usuario | Verifica caminos lógicos en la validación de datos del formulario de registro | 13/04/2025 | Valentin Alejandro Perez Zurita | HU-A01: Registro de usuario |
| PCB-M-02 | Autenticación de usuario | Verifica caminos en el proceso de autenticación con credenciales | 13/04/2025 | [Tu nombre] | HU-A02: Login de usuario |
| PCB-M-03 | Cálculo de costo de envío | Prueba los caminos en el algoritmo que calcula costos de envío basado en ubicación y peso | 13/04/2025 | [Tu nombre] | HU-C03: Cálculo de envío |
| PCB-M-04 | Proceso de autorización basado en roles | Evalúa la lógica de control de acceso a áreas administrativas según rol del usuario | 13/04/2025 | [Tu nombre] | HU-A05: Gestión de sesiones |
| PCB-M-05 | Gestión de cantidades en carrito | Prueba la lógica de incremento/decremento en el carrito y actualización de totales | 13/04/2025 | [Tu nombre] | HU-S06: Gestión de cantidades |
| PCB-M-06 | Filtrado de productos por precio | Verifica el algoritmo de filtrado de productos según rangos de precio y otras características | 13/04/2025 | [Tu nombre] | HU-S03: Filtros de precio |
| PCB-M-07 | Gestión de inventario administrativo | Evalúa la lógica de actualización de stock y funcionamiento de alertas de inventario bajo | 13/04/2025 | [Tu nombre] | HU-AD03: Gestión de inventario |
| PCB-M-08 | Procesamiento de confirmación de pago | Prueba los caminos lógicos del sistema al detectar y procesar confirmaciones de pago | 13/04/2025 | [Tu nombre] | HU-C08: Confirmación de pago |
| PCB-M-09 | Búsqueda avanzada de productos | Analiza el algoritmo de búsqueda por palabras clave, relevancia y filtros combinados | 13/04/2025 | [Tu nombre] | HU-P03: Búsqueda de productos |
| PCB-M-10 | Actualización de estados de pedido | Verifica la lógica del flujo de estados de pedido y el envío de notificaciones correspondientes | 13/04/2025 | [Tu nombre] | HU-AD05: Actualización de estado de pedidos |

## Pruebas de Caja Blanca Automatizadas

| N° | Nombre de la Prueba | Descripción | Fecha | Responsable | Herramienta | Historia Relacionada |
|---|---|---|---|---|---|---|
| PCB-A-01 | Validación de email | Prueba automatizada para validar formatos de email en registro | 13/04/2025 | [Tu nombre] | Jest | HU-A01: Registro de usuario |
| PCB-A-02 | Validación de contraseña | Verifica requisitos de seguridad para contraseñas | 13/04/2025 | [Tu nombre] | Jest | HU-A01: Registro de usuario |
| PCB-A-03 | Verificación de email | Prueba el proceso de envío y validación de verificación de email | 13/04/2025 | [Tu nombre] | Jest | HU-A04: Verificación de email |
| PCB-A-04 | Cálculo de subtotales | Verifica cálculos de precios y cantidades en el carrito | 13/04/2025 | [Tu nombre] | Jest | HU-S07: Resumen de carrito |
| PCB-A-05 | Integración con Stripe | Evalúa la lógica de comunicación con la pasarela de pago | 13/04/2025 | [Tu nombre] | Jest | HU-C05: Integración Stripe |
| PCB-A-06 | Validación de direcciones | Prueba la validación de campos en formulario de direcciones | 13/04/2025 | [Tu nombre] | Jest | HU-U01: Múltiples direcciones |
| PCB-A-07 | Gestión de categorías | Analiza la lógica de creación y modificación de categorías | 13/04/2025 | [Tu nombre] | Jest | HU-AD02: Gestión de categorías |
| PCB-A-08 | Gestión de historial de pedidos | Prueba la recuperación y visualización de pedidos del usuario | 13/04/2025 | [Tu nombre] | Jest | HU-U03: Historial de pedidos |
| PCB-A-09 | Detalle de producto | Verifica la lógica de carga y presentación de información de producto | 13/04/2025 | [Tu nombre] | Jest | HU-S02: Detalles de producto |
| PCB-A-10 | Generación de confirmación de pedido | Analiza la lógica que genera el resumen final antes de pagar | 13/04/2025 | [Tu nombre] | Jest | HU-C01: Revisión de compra |
| PCB-A-11 | Validación de formulario de contacto | Prueba la lógica de validación de los campos del formulario de contacto | 17/04/2025 | Valentin Alejandro Perez Zurita | Jest | HU-P05: Formulario de contacto |
| PCB-A-12 | Validación de reglas de envío | Prueba la lógica que determina si una regla de envío aplica para una dirección específica | 17/04/2025 | Valentin Alejandro Perez Zurita | Jest | HU-C03: Cálculo de envío |
| PCB-A-13 | Validación de códigos de referencia | Prueba la lógica que valida si un código de referencia cumple con todas las reglas establecidas | 17/04/2025 | Valentin Alejandro Perez Zurita | Jest | PCN-D-04 |
| PCB-A-14 | Verificación de disponibilidad de stock | Prueba la lógica que determina si un producto está disponible para compra según su stock | 17/04/2025 | Valentin Alejandro Perez Zurita | Jest | HU-S04: Indicador de stock |
| PCB-A-15 | Cálculo de descuento para carrito | Prueba la lógica que calcula los descuentos aplicables al carrito según el monto total | 17/04/2025 | Valentin Alejandro Perez Zurita | Jest | HU-S07: Resumen de carrito |

## Recursos adicionales

- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
- [Testing Library Cheat Sheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Kent C. Dodds - Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)