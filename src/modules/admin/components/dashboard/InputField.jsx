import { useController } from 'react-hook-form';


/**
 * Input field component.
 * It uses the react-hook-form useController hook to manage the input field.
 *
 * @param { string } name The name of the input field.
 * @param { string } label The label of the input field.
 * @param { Object } control The control object from the useForm
 * @param { Object } rules The validation rules for the input field.
 * @param { string } [type='text'] The type of the input field. Default is 'text'.
 * @param { boolean } [required=false] Whether the field is required.
 * @param { any } [defaultValue=''] The default value for the field.
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <InputField name="email" label="Correo Electrónico" control={control} rules={{ required: "El correo es obligatorio" }} />
 * <InputField name="password" label="Contraseña" control={control} rules={{ required: "La contraseña es obligatoria" }} type="password" />
 */


export const InputField = ({ 
  name, 
  label, 
  control, 
  rules, 
  type = 'text', 
  required = false,
  defaultValue = ''
}) => {
  // Prepare validation rules
  const validationRules = {
    ...rules,
    required: required ? `El campo ${label} es requerido` : false
  };

  const {
    field, // Get the field props
    fieldState: { error } // Get the field state
  } = useController({ 
    name, 
    control, 
    rules: validationRules,
    defaultValue: defaultValue // Ensure we always have a default value
  }); 

  return (
    <div className="mb-3">
      {/* Label */}
      <label className="form-label" htmlFor={name}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Input field */}
      {type === 'textarea' ? (
        <textarea 
          id={name} 
          className={`form-control ${error ? 'is-invalid' : ''}`} 
          {...field} 
        />
      ) : (
        <input 
          id={name} 
          type={type} 
          className={`form-control ${error ? 'is-invalid' : ''}`} 
          {...field} 
        />
      )}

      {/* Error message */}
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
};