# Funcionalidad de Recuperación de Contraseña

Este documento explica cómo está implementada la funcionalidad de "Olvidaste tu contraseña" en Cactilia, tanto para usuarios regulares como para administradores.

## Visión General

Cactilia ofrece un sistema de recuperación de contraseñas basado en Firebase Authentication, que proporciona:

- Enlaces de restablecimiento seguros enviados por correo electrónico
- Tokens de un solo uso con tiempo limitado
- Redirección inteligente según el tipo de usuario
- Componentes atómicos reutilizables
- Mensajes claros para el usuario

## Arquitectura

La funcionalidad está implementada en dos módulos separados:

1. **Módulo de Autenticación de Usuarios** (`src/modules/auth/`)
   - Para usuarios regulares de la tienda
   - Diseño consistente con la experiencia de compra
   
2. **Módulo de Administración** (`src/modules/admin/`)
   - Para administradores y staff
   - Diseño minimalista con Bootstrap puro

Cada módulo sigue los principios de:
- Componentes atómicos (un componente = una responsabilidad)
- Código limpio (returns claros, sin lógica en el JSX)
- Reutilización (hooks y componentes compartidos)
- Lazy loading (para optimización de rendimiento)

## Flujo de Recuperación de Contraseña

```
┌────────────┐       ┌─────────────────┐       ┌──────────────┐
│            │       │                 │       │              │
│  Página de │ ───▶ │   Formulario    │ ───▶ │   Firebase   │
│   Login    │       │ Recuperación   │       │    Auth     │
│            │       │                 │       │              │
└────────────┘       └─────────────────┘       └──────┬───────┘
                                                      │
                                                      ▼
┌────────────┐       ┌─────────────────┐       ┌──────────────┐
│            │       │                 │       │              │
│  Nueva     │ ◀─── │   Página de     │ ◀─── │    Email     │
│ Contraseña │       │  Firebase Auth  │       │  al Usuario  │
│            │       │                 │       │              │
└────────────┘       └─────────────────┘       └──────────────┘
```

## URLs de Redirección

- **Usuarios**: `${window.location.origin}/auth/login`
- **Administradores**: `${window.location.origin}/admin/login`

## Implementación

La implementación utiliza los siguientes componentes principales:

1. **Hooks Personalizados**:
   - `useForgotPassword.js`
   - `useAdminForgotPassword.js`

2. **Componentes Atómicos**:
   - Campo de email (`EmailField.jsx`)
   - Mensajes de estado (`StatusMessage.jsx`)
   - Botón de envío (`SubmitButton.jsx`)

3. **Formularios**:
   - `ForgotPasswordForm.jsx` (para cada módulo)

## Pruebas con Jest

La funcionalidad de recuperación de contraseña está completamente probada usando Jest y React Testing Library:

### Estructura de Pruebas

```
src/
├── modules/
│   ├── auth/
│   │   ├── components/
│   │   │   └── forgot-password/
│   │   │       └── __tests__/
│   │   │           └── ForgotPasswordForm.test.jsx
│   │   ├── hooks/
│   │   │   └── __tests__/
│   │   │       └── useForgotPassword.test.js
│   │   └── pages/
│   │       └── __tests__/
│   │           └── ForgotPasswordPage.test.jsx
│   └── admin/
│       ├── components/
│       │   └── login/
│       │       └── forgot-password/
│       │           └── __tests__/
│       │               └── EmailField.test.jsx
│       └── hooks/
│           └── __tests__/
│               └── useAdminForgotPassword.test.js
```

### Tipos de Pruebas

1. **Pruebas de Hooks**:
   - Verifican el comportamiento de `useForgotPassword` y `useAdminForgotPassword`
   - Comprueban estados de carga, éxito y error
   - Prueban la interacción con Firebase Authentication (mocked)
   - Verifican la correcta gestión de errores

2. **Pruebas de Componentes**:
   - Prueban el renderizado correcto de componentes atómicos
   - Verifican la validación de formularios
   - Comprueban la visualización de mensajes de error/éxito
   - Aseguran que los componentes manejan correctamente sus props

3. **Pruebas de Integración**:
   - Verifican que toda la página de recuperación se renderiza correctamente
   - Comprueban la interacción entre componentes
   - Aseguran que la estructura sigue los patrones de diseño establecidos

### Ejecución de Pruebas

Para ejecutar las pruebas:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas específicas de recuperación de contraseña
npm test -- -t "useForgotPassword|ForgotPasswordForm|ForgotPasswordPage"
```

### Mocking

Las pruebas utilizan mocks para:
- Firebase Authentication
- React Router
- Funciones de utilidad
- Componentes hijos

Esto permite probar la funcionalidad de forma aislada y predecible.

## Mantenimiento y Extensión

- **Documentación Detallada**: Cada módulo tiene su propio README.md con instrucciones específicas
- **Componentes Independientes**: Modificar componentes individuales sin afectar al resto
- **Estructura Clara**: Organización de archivos lógica y fácil de entender

## Seguridad

- No se revelan direcciones de correo existentes
- Enlaces seguros generados por Firebase
- Validación de correo electrónico en el cliente y servidor
- Tokens temporales que expiran automáticamente

## Recursos Adicionales

- [Documentación de Firebase Authentication](https://firebase.google.com/docs/auth)
- [Guía de Recuperación de Contraseña](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)

---

Para más detalles, consulta la documentación específica:
- [Recuperación para Usuarios](src/modules/auth/components/forgot-password/README.md)
- [Recuperación para Administradores](src/modules/admin/components/login/forgot-password/README.md) 