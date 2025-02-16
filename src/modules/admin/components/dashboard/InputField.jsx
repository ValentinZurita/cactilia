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
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <InputField name="email" label="Correo Electrónico" control={control} rules={{ required: "El correo es obligatorio" }} />
 * <InputField name="password" label="Contraseña" control={control} rules={{ required: "La contraseña es obligatoria" }} type="password" />
 */


export const InputField = ({ name, label, control, rules, type = 'text' }) => {
  const {
    field, // Get the field props
    fieldState: { error } // Get the field state
  } = useController({ name, control, rules }); // Use the controller

  return (

    <div className="mb-3">

      {/* Label */}
      <label className="form-label" htmlFor={name}>{label}</label>

      {/* Input field */}
      {type === 'textarea'
        ? (<textarea id={name} className="form-control" {...field} />)
        : (<input id={name} type={type} className="form-control" {...field} />)
      }

      {/* Error message */}
      {error && <div className="text-danger">{error.message}</div>}

    </div>

  );
};