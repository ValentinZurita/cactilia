import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SubmitButton } from '../../../../shared/components/index.js';

/**
 * Expresiones regulares para validaciones
 */
const NAME_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_PATTERN = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;


/**
 * Formulario de contacto que incluye campos de nombre, email, teléfono,
 * asunto y mensaje. Utiliza react-hook-form para validaciones.
 *
 * @returns {JSX.Element} - Retorna el formulario de contacto completo.
 */
export const ContactForm = () => {
  // * react-hook-form y estados locales
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);


  /**
   * Función que maneja el envío del formulario.
   *
   * @param {Object} data - Datos del formulario.
   */
  const onSubmit = (data) => {
    console.log('Form data:', data);
    setIsSubmitting(true);

    // Simula una respuesta exitosa después de 1.5 segundos
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      reset(); // Limpiar el formulario

      // Oculta el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1500);
  };

  /**
   * Renderiza un mensaje de éxito cuando el formulario se envía satisfactoriamente.
   *
   * @returns {JSX.Element|null} - Mensaje de éxito o null si no se ha enviado.
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
   * Renderiza el campo "Nombre" con sus validaciones.
   */
  const renderNameInput = () => (
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
  );


  /**
   * Renderiza el campo "Email" con sus validaciones.
   */
  const renderEmailInput = () => (
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
  );

  /**
   * Renderiza el campo "Teléfono" con sus validaciones.
   */
  const renderPhoneInput = () => (
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
  );


  /**
   * Renderiza el selector "Asunto" con sus validaciones.
   */
  const renderSubjectSelect = () => (
    <div className="mb-3 w-100 text-start">
      <label className="form-label text-muted">Asunto</label>
      <select
        className={`form-select shadow-sm ${errors.asunto ? "is-invalid" : ""}`}
        {...register("asunto", {
          required: "Selecciona un asunto"
        })}
      >
        <option value="">Seleccionar</option>
        <option value="general">Consulta general</option>
        <option value="support">Soporte técnico</option>
        <option value="sales">Ventas</option>
        <option value="other">Otro</option>
      </select>
      {errors.asunto && (
        <div className="invalid-feedback">{errors.asunto.message}</div>
      )}
    </div>
  );


  /**
   * Renderiza el campo de texto "Mensaje" con sus validaciones.
   */
  const renderMessageTextarea = () => (
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
  );


  /**
   * Renderiza el botón de envío y el texto de privacidad.
   */
  const renderSubmitSection = () => (
    <>
      <SubmitButton text={isSubmitting ? "Enviando..." : "Enviar mensaje"} color="green" />
      <p className="form-privacy-text mt-3 mb-0">
        Al enviar este formulario, aceptas nuestra <a href="#" className="privacy-link">política de privacidad</a>.
      </p>
    </>
  );


  /**
   * Render final del formulario.
   */
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {renderSuccessMessage()}

      <div className="row g-4">
        {/* Nombre completo */}
        <div className="col-md-6">
          {renderNameInput()}
        </div>

        {/* Email */}
        <div className="col-md-6">
          {renderEmailInput()}
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          {renderPhoneInput()}
        </div>

        {/* Asunto */}
        <div className="col-md-6">
          {renderSubjectSelect()}
        </div>

        {/* Mensaje */}
        <div className="col-12">
          {renderMessageTextarea()}
        </div>

        {/* Botón de envío y texto de privacidad */}
        <div className="col-12">
          {renderSubmitSection()}
        </div>
      </div>
    </form>
  );
};
