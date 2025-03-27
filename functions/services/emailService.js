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
 * @param {string} [emailData.from] - Email del remitente (opcional)
 * @returns {Promise<boolean>} - Si el email se envió correctamente
 */
const sendEmail = async (emailData, apiKey, sender) => {
  try {
    // Configurar SendGrid con la API key
    sgMail.setApiKey(apiKey);

    const msg = {
      to: emailData.to,
      from: emailData.from || sender || 'pedidos@cactilia.com',
      subject: emailData.subject,
      html: emailData.html,
    };

    await sgMail.send(msg);
    console.log(`Email enviado a: ${emailData.to}`);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return false;
  }
};

module.exports = {
  sendEmail,
  sendgridApiKey,
  defaultSender
};