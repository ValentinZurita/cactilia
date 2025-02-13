import { useForm } from 'react-hook-form';
import { addProduct, updateProduct } from '../../services/productService'
import { useEffect } from 'react'


/*
  Form that allows the admin to add a product.
 */


export const ProductForm = ({ onProductSaved, editingProduct }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  // Load the product data into the form if we're editing
  useEffect(() => {
    if (editingProduct) {
      Object.entries(editingProduct).forEach(([key, value]) => {
        setValue(key, Array.isArray(value) ? value.join(", ") : value);
      });
    }
  }, [editingProduct, setValue]);

  // Handle the form submission
  const onSubmit = async (data) => {
    const productData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      images: data.images.split(",").map((img) => img.trim()).filter(Boolean),
      active: data.active === "true",
      featured: data.featured === "true",
    };

    const response = editingProduct
      ? await updateProduct(editingProduct.id, productData)
      : await addProduct(productData);

    if (!response.ok) {
      alert(`Error al ${editingProduct ? "actualizar" : "crear"} producto: ${response.error}`);
      return;
    }

    alert(`Producto ${editingProduct ? "actualizado" : "creado"} exitosamente`);
    reset();
    onProductSaved();
  };

  // Render a reusable input field
  const renderInputField = (label, name, type = "text", options = {}) => {
    return (
      <div className="mb-3">
        <label className="form-label">{label}</label>
        {type === "textarea" ? (
          <textarea className="form-control" rows={3} {...register(name, options)} />
        ) : (
          <input className="form-control" type={type} {...register(name, options)} />
        )}
        {errors[name] && <div className="text-danger">{errors[name].message}</div>}
      </div>
    );
  };

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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
      <h3>{editingProduct ? "Editar Producto" : "Agregar Producto"}</h3>

      {/* Form fields */}
      {renderInputField("Category ID", "categoryId", "text", { required: "La categoría es requerida" })}
      {renderInputField("Nombre", "name", "text", { required: "El nombre es requerido" })}
      {renderInputField("Descripción", "description", "textarea", { required: "La descripción es requerida" })}
      {renderInputField("Precio", "price", "number", { required: "El precio es requerido", min: { value: 0.01, message: "El precio debe ser mayor que 0" } })}
      {renderInputField("Stock", "stock", "number", { required: "El stock es requerido", min: { value: 0, message: "El stock no puede ser negativo" } })}
      {renderInputField("Imágenes (separadas por coma)", "images", "text", { required: "Se requiere al menos una imagen" })}
      {renderInputField("SKU", "sku", "text", { required: "El SKU es requerido" })}

      {/* Select fields */}
      {renderSelectField("¿Activo?", "active", [["true", "Sí"], ["false", "No"]])}
      {renderSelectField("¿Destacado?", "featured", [["false", "No"], ["true", "Sí"]])}

      {/* Submit button */}
      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? (editingProduct ? "Actualizando..." : "Creando...") : (editingProduct ? "Actualizar Producto" : "Crear Producto")}
      </button>

    </form>
  );
};