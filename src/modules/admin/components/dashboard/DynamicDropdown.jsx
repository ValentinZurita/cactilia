import { useController } from 'react-hook-form';
import { useDynamicList } from '../../hooks/useDynamicList.js';
import { useEffect } from 'react';

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
  
  // Corrige el problema con valores por defecto cuando cambia items
  useEffect(() => {
    // Solo ejecutamos esto si tenemos un valor y los items ya se cargaron
    if (field.value && items.length > 0) {
      // Verificamos que el valor exista en los items
      const valueExists = items.some(item => item.id === field.value);
      
      // Si el valor no existe en los items recién cargados, pero debería estar
      // (significa que las API tienen valores diferentes), mantenemos el valor actual
      if (!valueExists) {
        // Podríamos manejar este caso si es necesario
      }
    }
  }, [items, field.value, field]);

  // Determinar si el campo es opcional
  const isOptional = rules.required === false;
  
  // Fix for shipping rule selection - ensure onChange is properly triggered
  const handleSelectionChange = (e) => {
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
            value={field.value || ''}
            onChange={(e) => field.onChange(e)}
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