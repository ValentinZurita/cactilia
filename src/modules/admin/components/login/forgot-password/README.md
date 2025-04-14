# Recuperación de Contraseña para Administradores

Este módulo implementa la funcionalidad de "Olvidaste tu contraseña" para los administradores de Cactilia, permitiéndoles restablecer su contraseña de forma segura.

## Características

- Interfaz sencilla y profesional
- Validación de formato de correo electrónico
- Componentes atómicos independientes
- Mensajes claros de éxito/error
- Estilo consistente con Bootstrap (sin CSS personalizado)
- Redirección al panel de administración después de restablecer la contraseña

## Flujo de Funcionamiento

1. El administrador accede a la página de login de administración
2. Hace clic en "¿Olvidaste tu contraseña?"
3. Es redirigido a la página de recuperación de contraseña
4. Ingresa su correo electrónico y envía el formulario
5. Firebase Authentication genera un email con un enlace seguro
6. El administrador recibe el correo y hace clic en el enlace
7. Es llevado a una página oficial de Firebase para crear una nueva contraseña
8. Después de establecer la nueva contraseña, es redirigido a la página de login de administración
9. El administrador puede iniciar sesión con su nueva contraseña

## Implementación Técnica

El módulo utiliza la API de Firebase Authentication (`sendPasswordResetEmail()`) para manejar de forma segura el proceso de restablecimiento de contraseñas.

### Estructura de Archivos

```
src/modules/admin/
├── components/
│   └── login/
│       ├── AdminLoginCard.jsx     # Tarjeta de login (contiene el enlace)
│       └── forgot-password/
│           ├── EmailField.jsx      # Campo de email atómico
│           ├── ForgotPasswordForm.jsx  # Formulario completo
│           ├── StatusMessage.jsx   # Componente de mensajes
│           ├── SubmitButton.jsx    # Botón de envío
│           └── README.md           # Esta documentación
├── hooks/
│   ├── useAdminForgotPassword.js   # Lógica de recuperación
│   └── utils/
│       └── errorMessages.js        # Mapeo de errores
└── pages/
    └── AdminForgotPasswordPage.jsx  # Página completa
```

### Configuración de Redirección

En el archivo `useAdminForgotPassword.js` se configura la URL de redirección después del restablecimiento:

```javascript
const actionCodeSettings = {
  url: `${window.location.origin}/admin/login`,
  handleCodeInApp: false
};
```

## Seguridad

El sistema de recuperación de contraseña es seguro por los siguientes motivos:

- Los enlaces son generados por Firebase Authentication
- Cada enlace contiene un token único y temporal
- El enlace expira después de un período (típicamente 1 hora)
- El enlace solo puede utilizarse una vez
- No se almacenan contraseñas en texto plano en ningún momento

## Consideraciones Adicionales

Por motivos de seguridad, el sistema no valida si el correo electrónico pertenece a un administrador antes de enviar el enlace. Esto evita revelar información sobre qué cuentas existen en el sistema.

## Mantenimiento

Para hacer cambios en la funcionalidad:

- **Modificaciones visuales**: Editar los componentes atómicos siguiendo el estilo Bootstrap
- **Cambiar la redirección**: Actualizar el parámetro `url` en `useAdminForgotPassword.js`
- **Personalizar mensajes de error**: Modificar el archivo `errorMessages.js` 