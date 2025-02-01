import { InputField, SubmitButton } from '../../../../shared/components/index.js'
import { BirthdateField } from '../../../../shared/components/buttons-and-fields/BirthdateField.jsx'
import { PhoneNumberField } from '../../../../shared/components/buttons-and-fields/PhoneNumberField.jsx'


export const RegisterForm = () => {
  return (
    <form
      className="container-fluid d-flex flex-column justify-content-center align-items-center px-4 px-md-5"
      style={{ maxWidth: '600px', width: '100%' }}
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Title */}
      <h2 className="fw-bold text-center my-4 text-muted" style={{ fontSize: '2.5rem' }}>Crea tu cuenta</h2>

      {/* Full Name */}
      <InputField label="Nombre" type="text" id="full-name" placeholder="Enter your full name" />

      {/* Email */}
      <InputField label="Email" type="email" id="email" placeholder="tucorreo@ejemplo.com" />

      {/* Birthdate */}
      <BirthdateField />

      {/* Phone Number */}
      <PhoneNumberField />

      {/* Password with toggle visibility */}
      <InputField label="Password" type="password" id="password" placeholder="Enter password" toggleVisibility={true} />

      {/* Register Button */}
      <SubmitButton text="Registrarse" />

      {/* Already have an account */}
      <p className="text-center mt-3 text-muted">
        ¿Ya tienes cuenta? <a href="/login" className="text-primary fw-semibold">Incia Sesión</a>
      </p>
    </form>
  );
};