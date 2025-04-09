import { useController, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';

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
  // Acceso al contexto del formulario para obtener más información
  const formContext = useFormContext();
  
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
  
  // Asegurar que se respete el valor establecido por setValue
  useEffect(() => {
    if (formContext && formContext._formValues) {
      const formValue = formContext._formValues[name];
      if (formValue !== undefined && formValue !== field.value) {
        field.onChange(formValue);
      }
    }
  }, [field, name, formContext]);
  
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
        value={field.value || ''}
        onChange={(e) => field.onChange(e)}
        onBlur={field.onBlur}
        ref={field.ref}
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
