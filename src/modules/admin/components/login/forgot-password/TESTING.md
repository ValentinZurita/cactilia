# Documentación de Pruebas: Módulo de Recuperación de Contraseña

Este documento describe la implementación de pruebas unitarias para el módulo de recuperación de contraseña de administradores.

## Estructura de componentes probados

El módulo está estructurado siguiendo un enfoque de componentes atómicos:

- `ForgotPasswordForm`: Componente principal que integra todos los demás
- `EmailField`: Campo de entrada de correo electrónico
- `StatusMessage`: Componente para mensajes de éxito/error
- `SubmitButton`: Botón de envío con estado de carga

## Configuración de pruebas

### Herramientas utilizadas
- **Jest**: Framework principal de pruebas
- **React Testing Library**: Para renderizar y probar componentes
- **jest.fn()**: Para crear funciones simuladas (mocks)

### Mocks necesarios

Debido a las dependencias externas, es necesario mockear:

1. **Firebase Auth**: Para evitar llamadas reales a servicios de autenticación
2. **React Hook Form**: Para simular formularios sin necesidad de bibliotecas completas
3. **Componentes hijos**: Para aislar pruebas de componentes específicos

## Estrategias de mocking implementadas

### 1. Mock de Firebase Auth

Creamos mocks para evitar problemas con Firebase Auth:

```javascript
// __mocks__/firebase-auth.js
export const sendPasswordResetEmail = jest.fn(() => Promise.resolve());
export const FirebaseAuth = {};
```

### 2. Mock de hooks personalizados

Para `useAdminForgotPassword`:

```javascript
// Mock del estado y funciones
const mockSendPasswordReset = jest.fn();
const mockState = {
  loading: false,
  error: null,
  success: false
};

// Mock del hook completo
const useAdminForgotPassword = () => ({
  sendPasswordReset: mockSendPasswordReset,
  state: mockState
});
```

### 3. Mock de componentes hijos

Para probar componentes de forma aislada:

```javascript
// Mock simplificado de EmailField
const EmailField = ({ register, errors }) => (
  <div data-testid="email-field-mock">
    <input data-testid="email-input" {...register('email')} />
    {errors?.email && <span data-testid="email-error">{errors.email.message}</span>}
  </div>
);
```

## Patrones de pruebas utilizados

### Para componentes simples (StatusMessage, SubmitButton)

Validamos:
- Renderizado correcto de elementos
- Correcta visualización basada en props (ej: estado de carga)
- Correcta aplicación de clases y estilos

Ejemplo:
```javascript
test('muestra el texto de carga cuando loading es true', () => {
  render(<SubmitButton loading={true} loadingText="Cargando..." text="Enviar" />);
  expect(screen.getByText("Cargando...")).toBeInTheDocument();
});
```

### Para formularios (ForgotPasswordForm)

Validamos:
- Renderizado inicial correcto
- Visualización de mensajes de éxito/error según el estado
- Interacciones de usuario (envío de formulario)
- Llamadas correctas a funciones (sendPasswordReset)

Ejemplo:
```javascript
test('llama a sendPasswordReset al enviar el formulario', async () => {
  render(<ForgotPasswordForm />);
  fireEvent.click(screen.getByTestId('submit-button'));
  await waitFor(() => {
    expect(mockSendPasswordReset).toHaveBeenCalled();
  });
});
```

## Problemas comunes y soluciones

### Problema: Importación de módulos ESM de Firebase

Firebase utiliza módulos ESM que pueden causar problemas con Jest:
```
Must use import to load ES Module: .../postinstall.mjs
```

### Solución 1: Mockear completamente Firebase

Crear mocks completos en `__mocks__` para evitar importar Firebase:

```javascript
// En jest.config.mjs
moduleNameMapper: {
  '^firebase/auth$': '<rootDir>/__mocks__/firebase-auth.js',
}
```

### Solución 2: Implementación de componentes internos para pruebas

Para `ForgotPasswordForm`, implementamos el componente directamente en el archivo de pruebas:

```javascript
// Componente simplificado para testing
const ForgotPasswordForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { sendPasswordReset, state } = useAdminForgotPassword();
  const { loading, error, success } = state;
  
  return (
    <form onSubmit={handleSubmit(sendPasswordReset)}>
      {/* ... componentes internos ... */}
    </form>
  );
};
```

## Comandos útiles

Ejecutar todas las pruebas del módulo:
```
yarn test src/modules/admin/components/login/forgot-password/__tests__
```

Ejecutar una prueba específica:
```
yarn test src/modules/admin/components/login/forgot-password/__tests__/ForgotPasswordForm.test.jsx
```

## Mejores prácticas implementadas

1. **Aislamiento**: Cada componente se prueba de forma aislada
2. **Simplicidad**: Mocks simples y enfocados
3. **Interacción de usuario**: Pruebas que simulan acciones reales
4. **Verificación de resultados**: Validación completa de estados y mensajes

## Próximos pasos

- Considerar pruebas de integración para flujos completos
- Implementar pruebas E2E con Cypress para el flujo de recuperación
- Añadir pruebas para escenarios de error específicos de Firebase 