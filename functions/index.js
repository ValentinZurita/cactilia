/**
 * Main Firebase Functions entry point file
 */
const admin = require("firebase-admin");
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

// Avoid duplicate initialization
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import payment functions (v2 format)
const paymentFunctions = require('./payment/paymentIntents');
const paymentMethodFunctions = require('./payment/paymentMethods');
const stripeService = require('./payment/stripeService');

// Import resend email functions
const resendEmails = require('./notifications/resendEmails');
const shippedEmails = require('./notifications/shippedEmails');
const invoiceEmails = require('./notifications/invoiceEmails');


// Import auth functions
const authFunctions = require("./auth/setCustomClaims");

// Import test function
const { basicTest } = require("./payment/test-function");

// Import OXXO payment functions
const oxxoFunctions = require('./payment/oxxoPaymentIntent');
const { simulateOxxoPayment } = require('./payment/simulateOxxOPayment');

// Export address functions
const { saveAddress } = require('./address/saveAddress');

// Export all functions
exports.createPaymentIntent = paymentFunctions.createPaymentIntent;
exports.confirmOrderPayment = paymentFunctions.confirmOrderPayment;
exports.createSetupIntent = paymentMethodFunctions.createSetupIntent;
exports.savePaymentMethod = paymentMethodFunctions.savePaymentMethod;
exports.detachPaymentMethod = paymentMethodFunctions.detachPaymentMethod;

// Export auth functions
exports.setCustomClaims = authFunctions.setCustomClaims;
exports.deleteUser = authFunctions.deleteUser;
exports.getUsersDetail = authFunctions.getUsersDetail;

// Export test function
exports.basicTest = basicTest;

// Export email functions
exports.resendOrderConfirmationEmail = resendEmails.resendOrderConfirmationEmail;
exports.sendOrderShippedEmail = shippedEmails.sendOrderShippedEmail;
exports.sendInvoiceEmail = invoiceEmails.sendInvoiceEmail;

// Export OXXO payment functions
exports.createOxxoPaymentIntent = oxxoFunctions.createOxxoPaymentIntent;
exports.checkOxxoPaymentStatus = oxxoFunctions.checkOxxoPaymentStatus;
exports.simulateOxxoPayment = simulateOxxoPayment;

// Export address functions
exports.saveAddress = saveAddress;

/**
 * Cloud Function para enviar emails desde el formulario de contacto
 * 
 * Esta función recibe los datos del formulario y envía un email
 * al correo configurado en la información de la empresa
 */
exports.sendContactEmail = functions.https.onCall(async (data, context) => {
  try {
    // Validar datos requeridos
    const { name, email, message, recipientEmail, messageId, companyName } = data;
    
    if (!name || !email || !message || !recipientEmail) {
      throw new Error('Faltan datos requeridos para enviar el email');
    }
    
    // Configurar el transportador de email (ajustar según proveedor)
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Cambiar según el proveedor de email
      auth: {
        user: functions.config().email.user,
        pass: functions.config().email.password
      }
    });
    
    // Construir el contenido del email para el administrador
    const adminMailOptions = {
      from: `"Contacto Web ${companyName}" <${functions.config().email.user}>`,
      to: recipientEmail,
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
            <p>Este email fue enviado automáticamente desde el formulario de contacto de ${companyName}.</p>
          </div>
        </div>
      `
    };
    
    // Construir el email de autorespuesta para el usuario
    const userMailOptions = {
      from: `"${companyName}" <${functions.config().email.user}>`,
      to: email,
      subject: `Hemos recibido tu mensaje - ${companyName}`,
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
            <p>El equipo de ${companyName}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      `
    };
    
    // Enviar ambos emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Configurar las variables de entorno con:
// firebase functions:config:set email.user="tu-correo@gmail.com" email.password="tu-contraseña"