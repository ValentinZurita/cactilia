import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { InputField, SubmitButton } from '../../../../shared/components/index.js'

export const ContactForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Simulamos envío
    setIsSubmitting(true);

    // Simular una respuesta exitosa después de 1.5 segundos
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      reset(); // Limpiar el formulario

      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setFormSubmitted(false);
      }, 5000);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Mensaje de éxito */}
      {formSubmitted && (
        <div className="form-success-message mb-4">
          <div className="success-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="success-text">
            ¡Mensaje enviado con éxito! Te responderemos lo antes posible.
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Nombre completo */}
        <div className="col-md-6">
          <InputField
            label="Nombre"
            placeholder="Tu nombre"
            errors={errors.nombre}
            {...register("nombre", {
              required: "El nombre es requerido",
              pattern: {
                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: "Solo letras y espacios"
              }
            })}
          />
        </div>

        {/* Email */}
        <div className="col-md-6">
          <InputField
            label="Email"
            type="email"
            placeholder="ejemplo@mail.com"
            errors={errors.email}
            {...register("email", {
              required: "El email es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido"
              }
            })}
          />
        </div>

        {/* Teléfono */}
        <div className="col-md-6">
          <InputField
            label="Teléfono"
            placeholder="Tu número de teléfono"
            errors={errors.telefono}
            {...register("telefono", {
              pattern: {
                value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                message: "Formato inválido"
              }
            })}
          />
        </div>

        {/* Asunto */}
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
              <option value="general">Consulta general</option>
              <option value="support">Soporte técnico</option>
              <option value="sales">Ventas</option>
              <option value="other">Otro</option>
            </select>
            {errors.asunto && (
              <div className="invalid-feedback">{errors.asunto.message}</div>
            )}
          </div>
        </div>

        {/* Mensaje */}
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
            ></textarea>
            {errors.mensaje && (
              <div className="invalid-feedback">{errors.mensaje.message}</div>
            )}
          </div>
        </div>

        {/* Botón de envío */}
        <div className="col-12">
          <SubmitButton text={isSubmitting ? "Enviando..." : "Enviar mensaje"} color="green" />

          {/* Texto de privacidad */}
          <p className="form-privacy-text mt-3 mb-0">
            Al enviar este formulario, aceptas nuestra <a href="#" className="privacy-link">política de privacidad</a>.
          </p>
        </div>
      </div>
    </form>
  );
};