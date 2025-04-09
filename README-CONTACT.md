# Configuración de Formulario de Contacto

## Configuración de Emuladores para Desarrollo Local

Para utilizar las funciones de contacto en desarrollo local, necesitas configurar los emuladores de Firebase.

### Requisitos Previos

1. Instalar Firebase CLI globalmente:
   ```
   yarn global add firebase-tools
   ```
   o
   ```
   npm install -g firebase-tools
   ```

2. Iniciar sesión en Firebase:
   ```
   firebase login
   ```

### Configuración y Ejecución

1. Iniciar los emuladores de Firebase:
   ```
   yarn dev:emuladores
   ```
   o
   ```
   yarn emulators
   ```

   Esto iniciará los emuladores de Functions y Firestore en los puertos 5001 y 8080 respectivamente.

2. Para el envío de emails, necesitas configurar variables de entorno para tu cuenta de correo:
   ```
   firebase functions:config:set email.user="tu-correo@gmail.com" email.password="tu-contraseña-de-aplicación"
   ```
   
   **Nota**: Para Gmail, debes usar una "contraseña de aplicación" generada en la configuración de seguridad de tu cuenta Google.

3. Para probar localmente estas configuraciones, puedes exportarlas al archivo `.runtimeconfig.json` en la carpeta functions:
   ```
   firebase functions:config:get > ./functions/.runtimeconfig.json
   ```

## Estructura de la Funcionalidad de Contacto

1. **Cliente (Frontend)**:
   - `src/modules/contact/services/contactService.js`: Servicio para guardar mensajes en Firestore y llamar a la Cloud Function.
   - El servicio se conecta automáticamente a los emuladores cuando detecta que está en localhost.

2. **Servidor (Cloud Functions)**:
   - `functions/contact/contactFunctions.js`: Implementación de la Cloud Function que envía los emails.
   - Usa Nodemailer para enviar correos tanto al administrador como una confirmación al usuario.

## Uso en Componentes

Ejemplo de uso en un componente de React:

```jsx
import { contactService } from '../services/contactService';
import { useCompanyInfo } from '../../admin/companyInfo/hooks/useCompanyInfo';

function ContactForm() {
  const { companyInfo, loading } = useCompanyInfo();
  
  const handleSubmit = async (formData) => {
    try {
      // El email del destinatario viene de la información de la empresa
      const result = await contactService.processContactForm(
        formData, 
        companyInfo.contactEmail
      );
      
      if (result.success) {
        // Mostrar mensaje de éxito
      }
    } catch (error) {
      // Manejar error
    }
  };
  
  // Resto del componente...
}
``` 