import { InputField, SubmitButton } from '../../../../shared/components/index.js'
import { BirthdateField } from '../../../../shared/components/buttons-and-fields/BirthdateField.jsx'
import { PhoneNumberField } from '../../../../shared/components/buttons-and-fields/PhoneNumberField.jsx'
import { useForm } from 'react-hook-form'
import { startRegisterWithEmailPassword } from '../../../public/store/auth/authThunks.js'
import { useDispatch } from 'react-redux'

export const RegisterForm = () => {
  console.log("RegisterForm is rendering...");

  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("✅ Formulario enviado:", data);

    dispatch(startRegisterWithEmailPassword({
      fullName: data.fullName,
      email: data.email,
      password: data.password
    }));
  };

  return (
    <form
      className="container-fluid d-flex flex-column justify-content-center align-items-center px-4 px-md-5"
      style={{ maxWidth: "600px", width: "100%" }}
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: "2.5rem" }}>
        Crea tu cuenta
      </h2>

      <InputField
        label="Nombre"
        type="text"
        id="fullName"
        placeholder="Tu nombre"
        register={register("fullName", { required: "El nombre es obligatorio" })}
        errors={errors.fullName}
      />

      <InputField
        label="Email"
        type="email"
        id="email"
        placeholder="tucorreo@ejemplo.com"
        register={register("email", {
          required: "El correo es obligatorio",
          pattern: {
            value: /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/,
            message: "Formato de correo no válido",
          },
        })}
        errors={errors.email}
      />

      <BirthdateField register={register("birthdate", { required: "La fecha de nacimiento es obligatoria" })} errors={errors.birthdate} />

      <PhoneNumberField register={register("phone", { required: "El número de teléfono es obligatorio" })} errors={errors.phone} />

      <InputField
        label="Password"
        type="password"
        id="password"
        placeholder="Ingresa tu contraseña"
        register={register("password", {
          required: "La contraseña es obligatoria",
          minLength: { value: 6, message: "Debe tener al menos 6 caracteres" },
        })}
        errors={errors.password}
        toggleVisibility={true}
      />

      <SubmitButton text="Registrarse" />

      <p className="text-center mt-3 text-muted">
        ¿Ya tienes cuenta? <a href="/login" className="text-primary fw-semibold">Inicia Sesión</a>
      </p>
    </form>
  );
};