import { useController } from 'react-hook-form';

/**
 * Select field component.
 * It uses the react-hook-form useController hook to manage the select field.
 *
 * @param { string } name The name of the select field.
 * @param { string } label The label of the select field.
 * @param { Object } control The control object from the useForm
 * @param { Array } options The options for the select field.
 * @param { Object } rules The validation rules for the select field.
 * @param { string } defaultValue The default value for the select
 * @param { boolean } required Whether the field is required
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <SelectField name="gender" label="Género" control={control} options={[['male', 'Masculino'], ['female', 'Femenino']]} />
 */

export const SelectField = ({ 
  name, 
  label, 
  control, 
  options, 
  rules, 
  defaultValue = '', 
  required = false 
}) => {
  // Prepare validation rules
  const validationRules = {
    ...rules,
    required: required ? `El campo ${label} es requerido` : false
  };

  const {
    field,
    fieldState: { error }
  } = useController({ 
    name, 
    control, 
    rules: validationRules,
    defaultValue: defaultValue 
  });

  return (
    <div className="mb-3">
      {/* Label */}
      <label className="form-label" htmlFor={name}>
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Select field */}
      <select 
        id={name} 
        className={`form-select ${error ? 'is-invalid' : ''}`} 
        {...field}
      >
        {options.map(([value, label], index) => (
          <option key={index} value={value}>{label}</option>
        ))}
      </select>

      {/* Error message */}
      {error && <div className="invalid-feedback d-block">{error.message}</div>}
    </div>
  );
};
