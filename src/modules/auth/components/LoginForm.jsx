import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { AuthLinks, InputField, SubmitButton } from "../../../shared/components/index.js";
import { startEmailSignIn } from '../../../store/auth/authThunks.js'
import { useNavigate } from 'react-router-dom'

export const LoginForm = () => {


  const dispatch = useDispatch();
  const { status, errorMessage } = useSelector((state) => state.auth);
  const { register, handleSubmit, setError, formState: {errors} } = useForm(); // 🔥 Hook from react-hook-form
  const navigate = useNavigate(); // ✨ Navigate to another page


  const onSubmit = async (data) => {

    console.log("Enviando datos del formulario:", data); // 🐞 Debugging
    const response = await dispatch(startEmailSignIn(data.email, data.password)); // 🔥 Dispatching the action to start the sign-in process

    // If the status is 'error', set the error message
    if(!response.ok){
      setError("email", { type: "manual", message: response.errorMessage });
      return;
    }

    // if success, the user will be redirected to the profile page
    navigate("/profile");

  };


  return (
    <form
      className="container-fluid d-flex flex-column justify-content-center align-items-center px-4 px-md-5"
      style={{ maxWidth: "600px", width: "100%" }}
      onSubmit={handleSubmit(onSubmit)} // 🔥 Now the form is submitted to our function
    >

      {/* Title */}
      <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: "2.5rem" }}>Iniciar Sesión</h2>

      {/* Email field */}
      <InputField
        {...register("email", { required: "El email es obligatorio" })}
        label="Email"
        type="email"
        placeholder="tucorreo@ejemplo.com"
        errors={errors.email}
      />

      {/* Password field */}
      <InputField
        {...register("password", { required: "La contraseña es obligatoria" })}
        label="Password"
        type="password"
        placeholder="......"
        toggleVisibility={true}
        errors={errors.password}
      />


      {/* 🔥 Show from firebase if exist */}
      {errorMessage && (
        <div className="alert alert-danger text-center mt-3" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Forgot password link */}
      <AuthLinks type = "forgot"/>

      {/* Submit button */}
      <SubmitButton text="Continuar" />

    </form>
  );
};