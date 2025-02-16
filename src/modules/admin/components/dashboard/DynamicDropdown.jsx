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
 *
 * @returns {JSX.Element}
 *
 * @constructor
 *
 * @example
 * <DynamicDropdown name="category" label="Categoría" control={control} fetchFunction={getCategories} />
 * <DynamicDropdown name="product" label="Producto" control={control} fetchFunction={getProducts} />
 */


export const DynamicDropdown = ({ name, label, control, fetchFunction }) => {
  const { items, loading } = useDynamicList(fetchFunction);
  const {
    field,
    fieldState: { error }
  } = useController({ name, control, rules: { required: 'Este campo es requerido' } });


  return (
    <div className="mb-3">

      {/* Label */}
      <label className="form-label" htmlFor={name}>{label}</label>

      {/* Select field */}
      {loading
        ? (<div className="text-secondary">Cargando datos...</div>)
        : ( <select id={name} className="form-select" {...field}>
          <option value="">Seleccione una opción</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      )}

      {/* Error message */}
      {error && <div className="text-danger">{error.message}</div>}

    </div>
  );
};