import { useForm } from "react-hook-form";
import { InputField } from '../../../../shared/components/index.js'
import { useAdminLogin } from '../../hooks/useAdminLogin.js'


/*
  Form that allows the admin to log in.
  It is used in the AdminLoginCard component.
*/


export const AdminLoginForm = () => {

  // 1) Hook useForm to handle the form state and validation
  const { register, handleSubmit, formState: { errors } } = useForm();

  // 2) Hook useAdminLogin to get the login function and the Firebase error
  const { login, firebaseError } = useAdminLogin();

  // 3) Function that renders the Firebase error
  const renderFirebaseError = () => {
    if (firebaseError) {
      return (
        <div className="alert alert-danger d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {firebaseError}
        </div>
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(login)}>

      {/* Error */}
      {renderFirebaseError()}

      {/* Email Input */}
      <InputField
        label="Correo Electrónico"
        type="email"
        placeholder="Ingresa tu email"
        {...register("email", { required: "El correo es obligatorio" })}
        errors={errors.email}
      />

      {/* Password Input */}
      <InputField
        label="Contraseña"
        type="password"
        placeholder="Ingresa tu contraseña"
        toggleVisibility={true}
        {...register("password", { required: "La contraseña es obligatoria" })}
        errors={errors.password}
      />

      {/* Submit button */}
      <button type="submit" className="btn btn-primary w-100">
        Iniciar sesión
      </button>

    </form>
  );
};