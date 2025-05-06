const functions = require('firebase-functions');
const sgMail = require('@sendgrid/mail');

/**
 * Función para enviar emails desde el formulario de contacto
 */
exports.sendContactEmail = functions.https.onCall(async (data, context) => {
  console.log('📩 INICIANDO FUNCIÓN sendContactEmail - DATOS RECIBIDOS:', JSON.stringify(data));
  
  try {
    // Validar datos requeridos
    const { name, email, message, recipientEmail, messageId, companyName } = data;
    console.log('📧 Datos del mensaje:', { name, email, recipientEmail, subject: data.subject || 'Sin asunto' });
    
    if (!name || !email || !message || !recipientEmail) {
      console.error('❌ FALTAN DATOS REQUERIDOS:', { name, email, message, recipientEmail });
      throw new Error('Faltan datos requeridos para enviar el email');
    }
    
    // Obtener configuración de SendGrid
    console.log('🔑 Obteniendo configuración de SendGrid...');
    const config = functions.config();
    console.log('📝 Config disponible:', JSON.stringify(config.sendgrid || {}));
    
    // Configurar SendGrid con la API key desde las variables de entorno de Firebase
    const apiKey = config.sendgrid?.key || config.sendgrid?.apikey;
    if (!apiKey) {
      console.error('❌ NO SE ENCONTRÓ LA API KEY DE SENDGRID EN LA CONFIGURACIÓN');
      throw new Error('Error en la configuración del servidor de email (API key no encontrada)');
    }
    
    console.log('✅ API key de SendGrid encontrada, configurando...');
    sgMail.setApiKey(apiKey);
    console.log('✅ SendGrid configurado exitosamente');
    
    // Email del remitente
    const sender = config.sendgrid?.sender || 'hola@cactilia.com';
    console.log(`📤 Usando remitente: ${sender}`);
    
    // Construir el contenido del email para el administrador
    console.log('📝 Construyendo email para administrador...');
    const adminMailMessage = {
      to: recipientEmail,
      from: sender,
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #34C749;">
            <h2 style="color: #333; margin: 0;">Nuevo mensaje de contacto</h2>
          </div>
          
          <div style="padding: 20px; background-color: #fff;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            ${data.phone ? `<p><strong>Teléfono:</strong> ${data.phone}</p>` : ''}
            ${data.subject ? `<p><strong>Asunto:</strong> ${data.subject}</p>` : ''}
            
            <div style="margin-top: 20px; border-left: 4px solid #34C749; padding-left: 15px;">
              <p><strong>Mensaje:</strong></p>
              <p style="white-space: pre-line;">${message}</p>
            </div>
            
            ${messageId ? `<p style="font-size: 12px; color: #666; margin-top: 30px;">ID del mensaje: ${messageId}</p>` : ''}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este email fue enviado automáticamente desde el formulario de contacto de ${companyName || 'Cactilia'}.</p>
          </div>
        </div>
      `
    };
    
    // Construir el email de autorespuesta para el usuario
    console.log('📝 Construyendo email para usuario...');
    const userMailMessage = {
      to: email,
      from: sender,
      subject: `Hemos recibido tu mensaje - ${companyName || 'Cactilia'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #34C749;">
            <h2 style="color: #333; margin: 0;">¡Gracias por contactarnos!</h2>
          </div>
          
          <div style="padding: 20px; background-color: #fff;">
            <p>Hola ${name},</p>
            <p>Hemos recibido tu mensaje y te responderemos lo antes posible. A continuación, encontrarás un resumen de la información que nos proporcionaste:</p>
            
            <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
              <p><strong>Asunto:</strong> ${data.subject || 'Contacto desde la web'}</p>
              <p><strong>Mensaje:</strong></p>
              <p style="white-space: pre-line;">${message.substring(0, 150)}${message.length > 150 ? '...' : ''}</p>
            </div>
            
            <p>Saludos cordiales,</p>
            <p>El equipo de ${companyName || 'Cactilia'}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    // Enviar ambos emails
    try {
      console.log('🚀 INTENTANDO ENVIAR EMAILS:');
      console.log(`📧 Email al administrador: ${recipientEmail}`);
      console.log(`📧 Email al usuario: ${email}`);
      
      // Enviar primero el email al administrador
      console.log('📤 Enviando email al administrador...');
      const adminResponse = await sgMail.send(adminMailMessage);
      console.log('✅ Email al administrador enviado:', JSON.stringify({
        statusCode: adminResponse[0]?.statusCode,
        headers: adminResponse[0]?.headers
      }));
      
      // Enviar después el email al usuario
      console.log('📤 Enviando email al usuario...');
      const userResponse = await sgMail.send(userMailMessage);
      console.log('✅ Email al usuario enviado:', JSON.stringify({
        statusCode: userResponse[0]?.statusCode,
        headers: userResponse[0]?.headers
      }));
      
      console.log('🎉 TODOS LOS EMAILS ENVIADOS CORRECTAMENTE');
      
      return { 
        success: true,
        message: 'Emails enviados correctamente',
        debug: {
          adminEmail: recipientEmail,
          userEmail: email,
          adminStatus: adminResponse[0]?.statusCode,
          userStatus: userResponse[0]?.statusCode,
          timestamp: new Date().toISOString()
        }
      };
    } catch (sendError) {
      console.error('❌ ERROR AL ENVIAR LOS EMAILS:', sendError);
      console.error('Detalles del error:', sendError.toString());
      
      if (sendError.response) {
        console.error('Respuesta del error:', sendError.response.body);
      }
      
      throw new functions.https.HttpsError(
        'internal', 
        'Error al enviar los emails: ' + sendError.message,
        {
          originalError: sendError.toString(),
          responseBody: sendError.response?.body,
          apiKey: apiKey ? 'API key configurada (oculta)' : 'No configurada'
        }
      );
    }
  } catch (error) {
    console.error('❌ ERROR GENERAL EN LA FUNCIÓN sendContactEmail:', error);
    console.error('Detalles completos:', error.toString());
    
    throw new functions.https.HttpsError(
      'internal', 
      error.message || 'Error al procesar la solicitud',
      { fullError: error.toString() }
    );
  }
}); 