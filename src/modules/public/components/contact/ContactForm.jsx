import React from 'react';
import { useForm } from 'react-hook-form';
import { SubjectSelector } from './SubjectSelector';
import { MessageField } from './MessageField';
import { InputField, SubmitButton } from '../../../../shared/components/index.js'

export const ContactForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Form data:', data);
    // Aquí iría la lógica para enviar el formulario
  };

  return (
    <div className="contact-form-container p-4 shadow-sm rounded">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row g-3">
          <div className="col-md-6">
            <InputField
              label="Nombre"
              placeholder="Tu nombre"
              errors={errors.nombre}
              {...register("nombre", {
                required: "El nombre es requerido"
              })}
            />
          </div>

          <div className="col-md-6">
            <InputField
              label="Numero de Telefónico"
              placeholder="+1012 3456 789"
              errors={errors.telefono}
              {...register("telefono", {
                required: "El teléfono es requerido",
                pattern: {
                  value: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
                  message: "Formato de teléfono inválido"
                }
              })}
            />
          </div>

          <div className="col-12">
            <InputField
              label="Email"
              placeholder="demo@gmail.com"
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

          <div className="col-12">
            <SubjectSelector
              errors={errors.asunto}
              register={register}
            />
          </div>

          <div className="col-12">
            <MessageField
              errors={errors.mensaje}
              register={register}
            />
          </div>

          <div className="col-12 mt-3">
            <SubmitButton text="Enviar" color="green" />
          </div>
        </div>
      </form>
    </div>
  );
};