// src/modules/public/components/contact/ContactForm.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SubmitButton } from '../../../../shared/components/index.js';
import { useCompanyInfo } from '../../../admin/companyInfo/hooks/useCompanyInfo';
import { contactService } from '../../../contact/services/contactService';

/**
 * Regular expressions for form validations
 */
const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_PATTERN = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;

/**
 * Enhanced contact form component with support for custom subject options
 * and other configurable elements
 *
 * @param {Object} props - Component props
 * @param {boolean} props.showName - Show name field
 * @param {boolean} props.showEmail - Show email field
 * @param {boolean} props.showPhone - Show phone field
 * @param {boolean} props.showSubject - Show subject field
 * @param {boolean} props.showMessage - Show message field
 * @param {string} props.buttonText - Text for submit button
 * @param {string} props.buttonColor - Color for submit button
 * @param {string} props.privacyText - Privacy policy text
 * @param {string[]} props.subjectOptions - Array of subject options for dropdown
 * @returns {JSX.Element}
 */
export const ContactForm = ({
                              showName = true,
                              showEmail = true,
                              showPhone = true,
                              showSubject = true,
                              showMessage = true,
                              buttonText = 'Enviar mensaje',
                              buttonColor = '#34C749',
                              privacyText = 'Al enviar este formulario, aceptas nuestra política de privacidad.',
                              subjectOptions = ["Consulta general", "Soporte técnico", "Ventas", "Otro"]
                            }) => {
  // Obtener la información de la empresa usando el hook personalizado
  const { contactEmail, companyName, loading: companyInfoLoading } = useCompanyInfo();
  
  // Form state
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Form submission handler
   * @param {Object} data - Form data
   */
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Verificar que se tenga un correo de destino configurado
      if (!contactEmail) {
        throw new Error("El correo de contacto no está configurado. Por favor, contacte al administrador.");
      }
      
      // Procesar el formulario
      await contactService.processContactForm({
        name: data.nombre,
        email: data.email,
        phone: data.telefono || '',
        subject: data.asunto || 'Contacto desde la web',
        message: data.mensaje,
        companyName: companyName || 'Cactilia'
      }, contactEmail);
      
      // Marcar como enviado y resetear el formulario
      setFormSubmitted(true);
      reset();
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      setSubmitError(error.message || "Hubo un problema al enviar el mensaje. Inténtelo de nuevo más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renders success message after form submission
   * @returns {JSX.Element|null}
   */
  const renderSuccessMessage = () => {
    if (!formSubmitted) return null;

    return (
      <div className="form-success-message mb-4">
        <div className="success-icon">
          <i className="bi bi-check-circle-fill"></i>
        </div>
        <div className="success-text">
          ¡Mensaje enviado con éxito! Te responderemos lo antes posible.
        </div>
      </div>
    );
  };
  
  /**
   * Renders error message if submission failed
   * @returns {JSX.Element|null}
   */
  const renderErrorMessage = () => {
    if (!submitError) return null;
    
    return (
      <div className="alert alert-danger mb-4">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{submitError}</div>
        </div>
      </div>
    );
  };

  // Si la información de la empresa está cargando, mostrar indicador
  if (companyInfoLoading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {renderSuccessMessage()}
      {renderErrorMessage()}

      <div className="row g-4">
        {/* Name field */}
        {showName && (
          <div className="col-md-6">
            <InputField
              label="Nombre"
              placeholder="Tu nombre"
              errors={errors.nombre}
              {...register("nombre", {
                required: "El nombre es requerido",
                pattern: {
                  value: NAME_PATTERN,
                  message: "Solo letras y espacios"
                }
              })}
            />
          </div>
        )}

        {/* Email field */}
        {showEmail && (
          <div className="col-md-6">
            <InputField
              label="Email"
              type="email"
              placeholder="ejemplo@mail.com"
              errors={errors.email}
              {...register("email", {
                required: "El email es requerido",
                pattern: {
                  value: EMAIL_PATTERN,
                  message: "Email inválido"
                }
              })}
            />
          </div>
        )}

        {/* Phone field */}
        {showPhone && (
          <div className="col-md-6">
            <InputField
              label="Teléfono"
              placeholder="Tu número de teléfono"
              errors={errors.telefono}
              {...register("telefono", {
                pattern: {
                  value: PHONE_PATTERN,
                  message: "Formato inválido"
                }
              })}
            />
          </div>
        )}

        {/* Subject field */}
        {showSubject && (
          <div className="col-md-6">
            <div className="mb-3 w-100 text-start">
              <label className="form-label text-muted">Asunto</label>
              <select
                className={`form-select shadow-sm ${errors.asunto ? "is-invalid" : ""}`}
                {...register("asunto", {
                  required: "Selecciona un asunto"
                })}
              >
                <option value="">Seleccionar</option>
                {subjectOptions && subjectOptions.length > 0 ? (
                  subjectOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))
                ) : (
                  // Fallback options if none provided
                  <>
                    <option value="general">Consulta general</option>
                    <option value="support">Soporte técnico</option>
                    <option value="sales">Ventas</option>
                    <option value="other">Otro</option>
                  </>
                )}
              </select>
              {errors.asunto && (
                <div className="invalid-feedback">{errors.asunto.message}</div>
              )}
            </div>
          </div>
        )}

        {/* Message field */}
        {showMessage && (
          <div className="col-12">
            <div className="mb-3 w-100 text-start">
              <label className="form-label text-muted">Mensaje</label>
              <textarea
                className={`form-control shadow-sm ${errors.mensaje ? "is-invalid" : ""}`}
                rows="4"
                placeholder="Escribe tu mensaje aquí..."
                {...register("mensaje", {
                  required: "El mensaje es requerido",
                  minLength: {
                    value: 10,
                    message: "Mínimo 10 caracteres"
                  }
                })}
              />
              {errors.mensaje && (
                <div className="invalid-feedback">{errors.mensaje.message}</div>
              )}
            </div>
          </div>
        )}

        {/* Submit button and privacy text */}
        <div className="col-12">
          <button
            type="submit"
            className="btn w-100 fw-bold my-2 shadow-sm submit-btn"
            style={{
              backgroundColor: buttonColor,
              border: `2px solid ${buttonColor}`,
              color: '#fff'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : buttonText}
          </button>

          {privacyText && (
            <p className="form-privacy-text mt-3 mb-0 text-center text-muted small">
              {privacyText}
            </p>
          )}
        </div>
      </div>
    </form>
  );
};