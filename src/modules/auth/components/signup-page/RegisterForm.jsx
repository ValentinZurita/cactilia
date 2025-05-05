import { InputField, SubmitButton } from '../../../../shared/components/index.js';
import { BirthdateField } from '../../../../shared/components/buttons-and-fields/BirthdateField.jsx';
import { PhoneNumberField } from '../../../../shared/components/buttons-and-fields/PhoneNumberField.jsx';
import { useForm } from 'react-hook-form';
import { startRegisterWithEmailPassword } from '../../../../store/auth/authThunks.js';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react'
import { clearRegistrationMessage } from '../../../../store/auth/authSlice.js'

export const RegisterForm = () => {

  const dispatch = useDispatch();
  const { register, handleSubmit, setError, formState: { errors } } = useForm();
  const { errorMessage, registrationSuccess, emailSent } = useSelector(state => state.auth);


  useEffect(() => {
    if (emailSent || errorMessage) {
      setTimeout(() => {
        dispatch(clearRegistrationMessage()); // 🔥 Limpia el mensaje después de 5 segundos
      }, 60000);
    }
  }, [emailSent, errorMessage, dispatch]);

  const onSubmit = async (data) => {
    console.log("✅ Registrando Usuario:", data);

    const response = await dispatch(startRegisterWithEmailPassword({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      phoneNumber: data.phoneNumber,
      birthdate: data.birthdate,
    }));

  };


  return (
    <form
      className="container-fluid d-flex flex-column justify-content-center align-items-center px-4 px-md-5"
      style={{ maxWidth: '600px', width: '100%' }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: '2.5rem' }}>
        Crea tu cuenta
      </h2>

      {/*
        1) Nombre
        - Requerido
        - Solo letras y espacios (si deseas)
      */}
      <InputField
        label="Nombre"
        type="text"
        placeholder="Tu nombre"
        {...register('fullName', {
          required: 'El nombre es obligatorio',
          pattern: {
            value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
            message: 'El nombre solo puede contener letras y espacios',
          },
        })}
        errors={errors.fullName}
      />

      {/*
        2) Email
        - Requerido
        - Formato de email
      */}
      <InputField
        label="Email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        {...register('email', {
          required: 'El correo es obligatorio',
          pattern: {
            value: /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/,
            message: 'Formato de correo no válido',
          },
        })}
        errors={errors.email}
      />

      {/*
        3) Fecha de Nacimiento (Hidden for now)
        - Requerido
        - Solo la parte de la fecha,
      */}
      {/*
      <BirthdateField
        {...register('birthdate', {
          required: 'La fecha de nacimiento es obligatoria',
        })}
        errors={errors.birthdate}
      />
      */}

      {/*
        4) Número Telefónico (Optional)
        - 10 dígitos
      */}
      <PhoneNumberField
        label="Número Telefónico (Opcional)"
        {...register('phoneNumber', {
          // required: 'El número de teléfono es obligatorio', // Made optional
          pattern: {
            value: /^\d{10}$/,
            message: 'El número debe tener exactamente 10 dígitos',
          },
        })}
        errors={errors.phoneNumber}
      />

      {/*
        5) Contraseña
        - Requerido
        - Mínimo 6 caracteres
        - Al menos 1 letra y 1 número (opcional)
      */}
      <InputField
        label="Password"
        type="password"
        placeholder="Ingresa tu contraseña"
        toggleVisibility={true}
        {...register('password', {
          required: 'La contraseña es obligatoria',
          pattern: {
            value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
            message: 'Mínimo 6 carácteres, con al menos 1 letra y 1 número',
          },
        })}
        errors={errors.password}
      />

      {/* Botón de Registro */}
      <SubmitButton text="Registrarse" />


      {/* Link to create an account */}
      <p className="text-center mt-3 text-muted">
        ¿Ya tienes cuenta?{' '}
        <a href="/auth/login" className="text-primary text-decoration-none fw-light">
          Inicia Sesión
        </a>
      </p>


      {/* ✅ Mostrar mensajes de éxito o error */}
      {emailSent && (
        <div className="alert alert-success text-center mt-3">
          📧 Hemos enviado un email de verificación. Confirma tu correo antes de iniciar sesión.
        </div>
      )}


    </form>
  );
};