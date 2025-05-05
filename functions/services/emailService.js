// services/emailService.js
const sgMail = require('@sendgrid/mail');
const { defineSecret } = require("firebase-functions/params");

// Definir secreto para la API key de SendGrid
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");
const defaultSender = defineSecret("SENDGRID_SENDER");

/**
 * Envía un email usando SendGrid
 *
 * @param {Object} emailData - Datos del email
 * @param {string} emailData.to - Email del destinatario
 * @param {string} emailData.subject - Asunto del email
 * @param {string} emailData.html - Contenido HTML del email
 * @param {string} sender - Email del remitente (DEBE estar verificado en SendGrid)
 * @param {string} apiKey - La API Key de SendGrid (obtenida con .value() en runtime)
 * @returns {Promise<boolean>} - Si el email fue aceptado por SendGrid para envío
 */
const sendEmail = async (emailData, apiKey, sender) => {
  try {
    if (!sender || !apiKey) {
      console.error('Error enviando email: Remitente (sender) o API Key no proporcionados.', { hasSender: !!sender, hasApiKey: !!apiKey });
      return false;
    }

    // CONFIGURAR API KEY EN TIEMPO DE EJECUCIÓN
    sgMail.setApiKey(apiKey); 

    const msg = {
      to: emailData.to,
      from: sender, // Usar siempre el sender proporcionado (verificado)
      subject: emailData.subject,
      html: emailData.html,
    };

    console.log(`Preparing to send email via SendGrid: To=${msg.to}, From=${msg.from}, Subject=${msg.subject}`);
    const response = await sgMail.send(msg);
    
    const statusCode = response[0]?.statusCode;
    console.log(`SendGrid response statusCode: ${statusCode}`);
    
    if (statusCode >= 200 && statusCode < 300) {
      console.log(`Email aceptado por SendGrid para enviar a: ${emailData.to}`);
      return true;
    } else {
      console.warn(`SendGrid devolvió un statusCode no exitoso: ${statusCode}. Respuesta:`, response);
      return false;
    }

  } catch (error) {
    console.error('Error CATCH enviando email vía SendGrid:', error);
    if (error.response) {
      console.error('SendGrid error response body:', error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendEmail,
  sendgridApiKey,
  defaultSender
};