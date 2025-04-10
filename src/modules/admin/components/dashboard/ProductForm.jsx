import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { addProduct, updateProduct } from '../../services/productService';
import { getCategories } from '../../services/categoryService';
import { uploadFile, deleteFile } from '../../../../config/firebase/firebaseStorage.js';
import { useImageUpload } from '../../hooks/useImageUpload';
import { ImageUploader } from './ImageUploader';
import { ImagePreview } from './ImagePreview';
import { DynamicDropdown } from './DynamicDropdown';
import { InputField } from './InputField';
import { SelectField } from './SelectField';
import { fetchShippingRules } from '../../services/shippingRuleService';
import { MultiSelectDropdown } from './MultiSelectDropdown';

/**
 * ProductForm component for adding and editing products.
 *
 * @param {Object} props - Component props
 * @param {Function} props.onProductSaved - Callback when the product is saved successfully
 * @param {Object} [props.editingProduct] - Product being edited (optional)
 *
 * @returns {JSX.Element}
 *
 * @example
 * <ProductForm onProductSaved={handleSave} uploadFolder="product-images" />
 */

export const ProductForm = ({ onProductSaved, editingProduct }) => {
  // Inicializar con los valores del producto si existe
  const defaultValues = editingProduct ? {
    active: editingProduct.active ? "true" : "false",
    featured: editingProduct.featured ? "true" : "false",
    categoryId: editingProduct.categoryId || "",
    // Otros valores por defecto si es necesario
  } : {
    // Valores predeterminados para nuevo producto
    active: "true",
    featured: "false"
  };
  
  const methods = useForm({
    defaultValues
  });
  const { handleSubmit, reset, setValue, control, formState: { isSubmitting } } = methods;
  const [formInitialized, setFormInitialized] = useState(false);

  // Image upload hook for local image management
  const {
    images,       // [{ file, previewUrl }]
    mainImage,    // previewUrl of the main image
    addLocalImages,
    removeLocalImage,
    setPrimaryImage,
    setInitialImages,
    getImagesToDelete
  } = useImageUpload();

  /**
   * Load product data if editing.
   * It sets form values and existing images for editing.
   */
  useEffect(() => {
    if (editingProduct && !formInitialized) { // Prevenir múltiples inicializaciones
      // Reset formulario primero para evitar valores residuales
      reset();
      
      // Set form values
      Object.entries(editingProduct).forEach(([key, value]) => {
        // Skip arrays for now - handle them separately
        if (!Array.isArray(value) || key === 'shippingRuleIds') {
          // Convert boolean values to strings for select fields
          if (key === 'active' || key === 'featured') {
            const stringValue = value ? "true" : "false";
            setValue(key, stringValue, { shouldValidate: true });
          } else {
            setValue(key, value, { shouldValidate: true });
          }
        }
      });
      
      // Establecer explícitamente los valores booleanos
      if (editingProduct.hasOwnProperty('active')) {
        const activeValue = editingProduct.active ? "true" : "false";
        setValue('active', activeValue);
      }
      
      if (editingProduct.hasOwnProperty('featured')) {
        const featuredValue = editingProduct.featured ? "true" : "false";
        setValue('featured', featuredValue);
      }
      
      // Asegurar que categoryId esté establecido
      if (editingProduct.categoryId) {
        setValue('categoryId', editingProduct.categoryId);
      }
      
      // Handle arrays separately to avoid string conversion
      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        setValue('images', editingProduct.images);
      }
      
      // Establecer valores para las reglas de envío
      if (editingProduct.shippingRuleIds && Array.isArray(editingProduct.shippingRuleIds)) {
        // Si ya tiene un array de shippingRuleIds, usamos ese
        setValue('shippingRuleIds', editingProduct.shippingRuleIds);
      } else if (editingProduct.shippingRuleId) {
        // Para compatibilidad con versiones anteriores
        setValue('shippingRuleIds', [editingProduct.shippingRuleId]);
      } else {
        // Sin reglas de envío
        setValue('shippingRuleIds', []);
      }

      // Prepare initial images
      const existingImages = editingProduct.images?.map((url) => ({
        file: null,
        previewUrl: url
      })) || [];

      setInitialImages(existingImages);

      if (editingProduct.mainImage) {
        setPrimaryImage(editingProduct.mainImage);
      }

      setFormInitialized(true); // Marcar como inicializado
    }
  }, [editingProduct, setValue, images.length, setInitialImages, setPrimaryImage, formInitialized, reset]);

  /**
   * Handle form submission.
   * Uploads images, removes marked images, and saves the product.
   *
   * @param {Object} data - Form data submitted
   */
  const handleSubmitForm = async (data) => {
    // Verificar las reglas de envío antes de guardar
    if (!data.shippingRuleIds || data.shippingRuleIds.length === 0) {
      alert('Debe seleccionar al menos una regla de envío');
      return;
    }
    
    // 1️⃣ Create folder path using product name
    const productName = data.name?.trim() || 'unknown';
    const folderPath = `product-images/${productName.replace(/\s+/g, '-')}`;

    // 2️⃣ Upload images to Firebase
    const uploadedUrls = [];
    for (const img of images) {
      if (img.file) {
        const url = await uploadFile(img.file, folderPath);
        if (url) uploadedUrls.push(url);
      } else {
        uploadedUrls.push(img.previewUrl);
      }
    }

    // 3️⃣ Determine main image URL
    let mainUrl = uploadedUrls[0] || 'https://via.placeholder.com/300';
    const found = uploadedUrls.find((u) => u === mainImage);
    if (found) mainUrl = found;

    // 4️⃣ Remove images marked for deletion
    const imagesToDelete = getImagesToDelete();
    for (const imageUrl of imagesToDelete) {
      await deleteFile(imageUrl);
    }

    // 5️⃣ Create product object with shipping rules
    const productData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      weight: parseFloat(data.weight),
      images: uploadedUrls,
      mainImage: mainUrl,
      active: data.active === "true",
      featured: data.featured === "true",
      categoryId: data.categoryId || null, // Asegurar que siempre se incluya el categoryId
      shippingRuleIds: Array.isArray(data.shippingRuleIds) ? data.shippingRuleIds : [], // Asegurarse que sea array
      shippingRuleId: Array.isArray(data.shippingRuleIds) && data.shippingRuleIds.length > 0 
        ? data.shippingRuleIds[0] 
        : null // Para compatibilidad
    };
    
    // Eliminar campos que podrían causar problemas
    delete productData.shippingRulesInfo;
    delete productData.shippingRuleInfo;

    // 6️⃣ Save or update product
    const response = editingProduct
      ? await updateProduct(editingProduct.id, productData)
      : await addProduct(productData);

    if (!response.ok) {
      alert(`Error ${editingProduct ? "actualizando" : "creando"} el producto: ${response.error}`);
      return;
    }

    // ✅ Success feedback
    alert(`Producto ${editingProduct ? "actualizado" : "creado"} correctamente`);
    
    // Solo resetear el formulario para nuevos productos, no al actualizar
    if (!editingProduct) {
      reset();
    }
    
    // Llamar al callback sin parámetros, igual que en CategoryForm
    onProductSaved();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitForm)} className="mt-4">
        <h3>{editingProduct ? "Editar Producto" : "Añadir Producto"}</h3>

        {/* 🧩 Category selection dropdown */}
        <DynamicDropdown
          name="categoryId"
          label="Categoría"
          control={control}
          fetchFunction={getCategories}
          defaultValue={editingProduct?.categoryId || ""}
          rules={{ required: false }}
        />

        {/* 🧩 Shipping rules multi-selection dropdown */}
        <MultiSelectDropdown
          name="shippingRuleIds"
          label="Reglas de envío"
          control={control}
          fetchFunction={async () => {
            try {
              const result = await fetchShippingRules();
              
              if (result.ok && result.data && result.data.length > 0) {
                const formattedData = result.data.map(rule => ({
                  id: rule.id,
                  name: rule.zona || 'Regla sin nombre'
                }));
                return { ok: true, data: formattedData };
              } else {
                return { ok: false, data: [], error: result.error || 'No se encontraron reglas de envío' };
              }
            } catch (error) {
              return { ok: false, data: [], error: error.message };
            }
          }}
          rules={{ required: true }}
          defaultValue={[]}
          helperText="Seleccione una o más reglas de envío. Un producto puede tener múltiples opciones de envío."
        />

        {/* 🖋️ Basic product info */}
        <InputField 
          name="name" 
          label="Nombre" 
          control={control} 
          required={true}
          defaultValue="" 
        />
        <InputField 
          name="description" 
          label="Descripción" 
          control={control} 
          type="textarea" 
          required={false}
          defaultValue="" 
        />
        <InputField 
          name="price" 
          label="Precio" 
          control={control} 
          type="number" 
          required={true}
          defaultValue="0" 
        />
        <InputField 
          name="weight" 
          label="Peso (kg)" 
          control={control} 
          type="number" 
          required={true}
          defaultValue="0" 
        />
        <InputField 
          name="stock" 
          label="Stock" 
          control={control} 
          type="number" 
          required={true}
          defaultValue="0" 
        />
        <InputField 
          name="sku" 
          label="SKU" 
          control={control} 
          required={true}
          defaultValue="" 
        />

        {/* 🖼️ Image upload with local preview */}
        <ImageUploader onUpload={(files) => addLocalImages(files)} />

        {/* 🔍 Image preview and management */}
        <ImagePreview
          images={images}
          mainImage={mainImage}
          onRemove={removeLocalImage}
          onSetMain={setPrimaryImage}
        />

        {/* ⚙️ Product settings */}
        <SelectField 
          name="active" 
          label="¿Activo?" 
          control={control} 
          options={[["true", "Sí"], ["false", "No"]]} 
          required={false}
        />
        <SelectField 
          name="featured" 
          label="¿Destacado?" 
          control={control} 
          options={[["true", "Sí"], ["false", "No"]]} 
          required={false}
        />

        {/*  Submit button */}
        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (editingProduct ? "Actualizando..." : "Creando...")
            : (editingProduct ? "Actualizar Producto" : "Crear Producto")}
        </button>
      </form>
    </FormProvider>
  );
};