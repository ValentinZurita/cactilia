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

## Recursos adicionales

- [Jest Cheat Sheet](https://github.com/sapegin/jest-cheat-sheet)
- [Testing Library Cheat Sheet](https://testing-library.com/docs/react-testing-library/cheatsheet)
- [Kent C. Dodds - Common Mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) 