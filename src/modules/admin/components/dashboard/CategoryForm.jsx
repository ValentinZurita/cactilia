import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { createCategory, updateCategory } from "../../services/categoryService";


/*
  *
  * Form that allows the admin to add or edit a category.
  *
  * @param {Object} props
  * @param {Function} props.onCategorySaved - Function to call when the category is saved.
  * @param {Object} [props.editingCategory] - The category to edit, if any.
  *
  * @returns {JSX.Element}
  *
  * @example
  * <CategoryForm onCategorySaved={handleCategorySaved} editingCategory={category} />
  *
 */


export const CategoryForm = ({ onCategorySaved, editingCategory }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Load the category data into the form if we're editing
  useEffect(() => {
    if (editingCategory) {
      Object.entries(editingCategory).forEach(([key, value]) => {
        setValue(key, value);
      });
    }
  }, [editingCategory, setValue]);

  // Handle the form submission
  const onSubmit = async (data) => {
    const categoryData = {
      nombre: data.nombre,
      descripcion: data.descripcion || "",
      activa: data.activa === "true",
      imagenUrl: data.imagenUrl || null,
    };

    const response = editingCategory
      ? await updateCategory(editingCategory.id, categoryData)
      : await createCategory(categoryData);

    if (!response.ok) {
      alert(`Error al ${editingCategory ? "actualizar" : "crear"} la categoría: ${response.error}`);
      return;
    }

    alert(`Categoría ${editingCategory ? "actualizada" : "creada"} exitosamente`);
    reset();
    onCategorySaved();
  };

  // Render a reusable input field
  const renderInputField = (label, name, type = "text", options = {}) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input className="form-control" type={type} {...register(name, options)} />
      {errors[name] && <div className="text-danger">{errors[name].message}</div>}
    </div>
  );

  // Render a reusable select field
  const renderSelectField = (label, name, options) => (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <select className="form-select" {...register(name)}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>{text}</option>
        ))}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mb-4">
      <h3>{editingCategory ? "Editar Categoría" : "Agregar Categoría"}</h3>

      {/* Render the input fields */}
      {renderInputField("Nombre", "nombre", "text", { required: "El nombre es obligatorio" })}
      {renderInputField("Descripción", "descripcion", "textarea")}
      {renderInputField("Imagen URL", "imagenUrl", "text")}

      {/* Render the select field */}
      {renderSelectField("Activa", "activa", [["true", "Sí"], ["false", "No"]])}

      {/* Submit button */}
      <button type="submit" className="btn btn-primary">
        {editingCategory ? "Actualizar Categoría" : "Guardar Categoría"}
      </button>

    </form>
  );
};