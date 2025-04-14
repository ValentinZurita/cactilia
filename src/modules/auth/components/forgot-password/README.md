# Recuperación de Contraseña para Usuarios

Este módulo implementa la funcionalidad de "Olvidaste tu contraseña" para los usuarios regulares de Cactilia.

## Características

- Formulario simple para ingresar el correo electrónico
- Validación de formatos de correo
- Componentes atómicos para mejor reutilización
- Mensajes de feedback (éxito/error) para el usuario
- Redirección automática a la página de login después de restablecer la contraseña

## Flujo de Funcionamiento

1. El usuario accede a la página de login
2. El usuario hace clic en "¿Olvidaste tu contraseña?"
3. El usuario es redirigido a la página de recuperación de contraseña
4. El usuario ingresa su correo electrónico y envía el formulario
5. Firebase Authentication genera un email con un enlace seguro
6. El usuario recibe el correo y hace clic en el enlace
7. El usuario es llevado a una página oficial de Firebase para crear una nueva contraseña
8. Después de establecer la nueva contraseña, el usuario es redirigido a la página de login
9. El usuario puede iniciar sesión con su nueva contraseña

## Implementación Técnica

El módulo utiliza Firebase Authentication y su método `sendPasswordResetEmail()` para enviar enlaces de restablecimiento de contraseña seguros.

### Estructura de Archivos

```
src/modules/auth/
├── components/
│   └── forgot-password/
│       ├── EmailField.jsx       # Campo de email atómico
│       ├── ForgotPasswordForm.jsx  # Formulario completo
│       ├── StatusMessage.jsx    # Componente de mensajes
│       ├── SubmitButton.jsx     # Botón de envío
│       └── README.md            # Esta documentación
├── hooks/
│   └── useForgotPassword.js     # Lógica de recuperación
└── pages/
    └── ForgotPasswordPage.jsx   # Página completa
```

### Configuración de Redirección

En el archivo `useForgotPassword.js` se configura el parámetro `url` para definir a dónde será redirigido el usuario después de establecer su nueva contraseña:

```javascript
const actionCodeSettings = {
  url: `${window.location.origin}/auth/login`,
  handleCodeInApp: false
};
```

## Seguridad

El enlace de restablecimiento:
- Contiene un token único para esa solicitud específica
- Tiene una validez limitada (generalmente 1 hora)
- Solo puede utilizarse una vez
- Es generado y validado por Firebase Authentication

## Mantenimiento

Para modificar el diseño o comportamiento:
- Para cambios visuales: modificar los componentes atómicos
- Para cambiar la URL de redirección: actualizar `useForgotPassword.js`
- Para modificar mensajes: actualizar `StatusMessage.jsx` 