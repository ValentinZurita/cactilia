import { ForgotPasswordLink, InputField, SubmitButton } from '../../../shared/components/index.js'

export const LoginForm = () => {
    return (
      <form
        className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-75 px-4 px-md-5"
        style={{ maxWidth: '600px', width: '100%' }}
        onSubmit={(e) => { e.preventDefault(); }}
      >

        {/* Title */}
        <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: '2.5rem' }}>Iniciar Sesión</h2>

        {/* Email */}
        <InputField
          label="Email"
          type="email"
          id="email"
          placeholder="tucorreo@ejemplo.com"
        />

        {/* Password */}
        <InputField
          label="Password"
          type="password"
          id="password"
          placeholder="......"
        />

        {/* Forgot Password */}
        <ForgotPasswordLink />

        {/* Submit Button */}
        <SubmitButton text="Continuar" />

      </form>
    );
};