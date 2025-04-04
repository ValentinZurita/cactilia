import { useController } from 'react-hook-form';
import { useDynamicList } from '../../hooks/useDynamicList.js'


/**
 * Dynamic dropdown component.
 * It uses the react-hook-form useController hook to manage the dynamic dropdown field.
 *
 * @param { string } name The name of the dynamic dropdown field.
 * @param { string } label The label of the dynamic dropdown field.
 * @param { Object } control The control object from the useForm
 * @param { Function } fetchFunction The function to fetch the dynamic dropdown data.
 * @param { Object } rules The validation rules for the field (optional)
 * @param { string } defaultValue The default value for the dropdown
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <DynamicDropdown name="category" label="Categoría" control={control} fetchFunction={getCategories} />
 * <DynamicDropdown name="product" label="Producto" control={control} fetchFunction={getProducts} rules={{ required: false }} />
 */


export const DynamicDropdown = ({ 
  name, 
  label, 
  control, 
  fetchFunction, 
  rules = {}, 
  defaultValue = '' 
}) => {
  const { items, loading } = useDynamicList(fetchFunction);
  
  // Add detailed debugging logs
  console.log(`DynamicDropdown ${name}:`, { 
    items, 
    loading, 
    isRequired: rules.required,
    defaultValue
  });
  
  const {
    field,
    fieldState: { error }
  } = useController({ 
    name, 
    control, 
    rules: { 
      required: rules.required !== false ? 'Este campo es requerido' : false,
      ...rules 
    },
    defaultValue: defaultValue
  });
  
  // Log field values
  console.log(`DynamicDropdown ${name} field:`, field);

  // Determinar si el campo es opcional
  const isOptional = rules.required === false;
  
  // Fix for shipping rule selection - ensure onChange is properly triggered
  const handleSelectionChange = (e) => {
    console.log(`${name} selection changed to:`, e.target.value);
    field.onChange(e);
  };

  return (
    <div className="mb-3">

      {/* Label */}
      <label className="form-label" htmlFor={name}>
        {label}
        {isOptional && <span className="text-muted ms-1">(opcional)</span>}
        {!isOptional && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Select field */}
      {loading
        ? (<div className="text-secondary">Cargando datos...</div>)
        : ( 
          <select 
            id={name} 
            className={`form-select ${error ? 'is-invalid' : ''}`} 
            value={field.value}
            onChange={handleSelectionChange}
            onBlur={field.onBlur}
            ref={field.ref}
          >
            <option value="">Seleccione una opción</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        )
      }

      {/* Error message */}
      {error && <div className="invalid-feedback d-block">{error.message}</div>}

    </div>
  );
};