import React, { useState } from 'react';
import { contactService } from '../services/contactService';
import { useCompanyInfo } from '../../admin/companyInfo/hooks/useCompanyInfo';

/**
 * Componente de formulario de contacto
 */
export const ContactForm = () => {
  // Email de destino fijo para desarrollo - REEMPLAZAR POR TU EMAIL
  const ADMIN_EMAIL = "valentin.alejandro.p.z@gmail.com";
  
  const { companyInfo, loading: loadingCompany } = useCompanyInfo();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [apiResponse, setApiResponse] = useState(null); // Para guardar la respuesta completa de la API

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.name || !formData.email || !formData.message) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setDebugInfo(null);
      setApiResponse(null);
      
      console.log('🚀 INICIANDO ENVÍO DE FORMULARIO');
      
      // Añadir información de la empresa
      const dataToSend = {
        ...formData,
        companyName: companyInfo?.generalInfo?.companyName || 'Cactilia'
      };
      
      // Usar el email configurado en la empresa o el email fijo
      const recipientEmail = companyInfo?.contact?.email || ADMIN_EMAIL;
      console.log("📧 Enviando email a:", recipientEmail, "usando Firebase real (PRODUCCIÓN)");
      
      // Mostrar información de depuración
      setDebugInfo({
        timestamp: new Date().toISOString(),
        destinatario: recipientEmail,
        modo: "Firebase Real (Producción)",
        entorno: "Producción real, no emulador",
        status: "Preparando envío..."
      });
      
      // Guarda el mensaje en Firestore primero
      console.log('💾 Guardando mensaje en Firestore...');
      const saveResult = await contactService.saveContactMessage(dataToSend);
      
      setDebugInfo(prev => ({
        ...prev,
        status: "Mensaje guardado en Firestore, enviando email...",
        messageId: saveResult.messageId
      }));
      
      console.log('✅ Mensaje guardado con ID:', saveResult.messageId);
      
      // Enviar el email
      console.log('📤 Enviando email...');
      const emailData = {
        ...dataToSend,
        recipientEmail,
        messageId: saveResult.messageId
      };
      
      // Mostrar los datos que se enviarán
      console.log('📋 Datos que se enviarán:', emailData);
      
      // Enviar el email con los datos del formulario
      const emailResult = await contactService.sendContactEmail(emailData);
      
      // Guardar la respuesta completa
      setApiResponse(emailResult);
      console.log('📨 Respuesta del servidor:', emailResult);
      
      setDebugInfo(prev => ({
        ...prev,
        status: "Email enviado con éxito",
        emailSent: true,
        emailResult: emailResult
      }));
      
      // Si todo fue exitoso
      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      console.error('❌ ERROR al enviar mensaje:', err);
      setError('Ocurrió un error al enviar tu mensaje: ' + (err.message || 'Error desconocido'));
      
      setDebugInfo(prev => ({
        ...prev,
        status: "ERROR",
        error: err.toString(),
        stack: err.stack,
        funcionUtilizada: "sendContactEmail (producción)"
      }));
      
      // Mostrar detalles del error si está disponible
      if (err.details) {
        setApiResponse(err.details);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingCompany) {
    return <div className="text-center p-4">Cargando formulario...</div>;
  }

  return (
    <div className="card border-0 shadow-sm rounded">
      <div className="card-body p-4">
        <h3 className="card-title mb-4 text-center">Contáctanos</h3>
        
        {/* Banner de depuración siempre visible durante desarrollo */}
        <div className="alert alert-info mb-3">
          <div className="d-flex align-items-center mb-2">
            <i className="bi bi-info-circle-fill me-2"></i>
            <strong>Modo depuración:</strong> 
          </div>
          <div>
            <small>Email destino: {companyInfo?.contact?.email || ADMIN_EMAIL}</small>
            <br/>
            <small>Estado: {loading ? 'Enviando...' : debugInfo?.status || 'Esperando envío'}</small>
          </div>
        </div>
        
        {success ? (
          <div className="alert alert-success">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle-fill me-2"></i>
              <div>
                <h5 className="mb-1">¡Mensaje enviado con éxito!</h5>
                <p className="mb-0">Gracias por contactarnos. Te responderemos lo antes posible.</p>
              </div>
            </div>
            
            <div className="mt-3 p-2 bg-light rounded">
              <small className="d-block fw-bold">Información de depuración:</small>
              <pre className="small mb-0 mt-1">{JSON.stringify(debugInfo, null, 2)}</pre>
              
              {apiResponse && (
                <>
                  <small className="d-block fw-bold mt-2">Respuesta del servidor:</small>
                  <pre className="small mb-0 mt-1">{JSON.stringify(apiResponse, null, 2)}</pre>
                </>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                
                <div className="mt-2 p-2 bg-light rounded">
                  <small className="d-block fw-bold">Información de depuración:</small>
                  <pre className="small mb-0 mt-1">{JSON.stringify(debugInfo, null, 2)}</pre>
                  
                  {apiResponse && (
                    <>
                      <small className="d-block fw-bold mt-2">Respuesta del servidor:</small>
                      <pre className="small mb-0 mt-1">{JSON.stringify(apiResponse, null, 2)}</pre>
                    </>
                  )}
                </div>
              </div>
            )}
            
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nombre <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ingresa tu nombre"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Correo electrónico <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="tucorreo@ejemplo.com"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="phone" className="form-label">
                Teléfono
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(Opcional) Tu número de teléfono"
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="subject" className="form-label">
                Asunto
              </label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿Sobre qué nos quieres hablar?"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="form-label">
                Mensaje <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>
            
            <div className="d-grid">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enviando...
                  </>
                ) : 'Enviar mensaje'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}; 