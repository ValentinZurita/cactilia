import { useController } from 'react-hook-form';


/**
 * Select field component.
 * It uses the react-hook-form useController hook to manage the select field.
 *
 * @param { string } name The name of the select field.
 * @param { string } label The label of the select field.
 * @param { Object } control The control object from the useForm
 * @param { Object } rules The validation rules for the select field.
 * @param { Array } options The options for the select field.
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <SelectField name="category" label="Categoría" control={control} rules={{ required: "La categoría es obligatoria" }} options={categories} />
 * <SelectField name="status" label="Estado" control={control} rules={{ required: "El estado es obligatorio" }} options={[["active", "Activo"], ["inactive", "Inactivo"]]} />
 */


export const SelectField = ({ name, label, control, rules, options = [] }) => {
  const {
    field, // Get the field props
    fieldState: { error } // Get the field state
  } = useController({ name, control, rules }); // Use the controller

  return (

    <div className="mb-3">

      {/* Label */}
      <label className="form-label" htmlFor={name}>{label}</label>

      {/* Select field */}
      <select id={name} className="form-select" {...field}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>

      {/* Error message */}
      {error && <div className="text-danger">{error.message}</div>}

    </div>

  );
};
