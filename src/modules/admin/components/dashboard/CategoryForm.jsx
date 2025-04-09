import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { createCategory, updateCategory } from "../../services/categoryService";
import { useImageUpload } from "../../hooks/useImageUpload";
import { uploadFile, deleteFile } from '../../../../config/firebase/firebaseStorage.js'
import { ImageUploader, ImagePreview, SelectField, InputField } from './index.js'


/**
 * CategoryForm
 * Form to create or edit a category.
 * @param {Function} onCategorySaved The function to call when the category is saved.
 * @param {Object} editingCategory The category to edit, if any.
 *
 * @returns {JSX.Element}
 *
 * @constructor
 * @example
 * <CategoryForm onCategorySaved={handleCategorySaved} editingCategory={category} />
 */


export const CategoryForm = ({ onCategorySaved, editingCategory }) => {

  // Inicializar con los valores de la categoría si existe
  const defaultValues = editingCategory ? {
    active: editingCategory.active ? "true" : "false",
    featured: editingCategory.featured ? "true" : "false",
    name: editingCategory.name || "",
    description: editingCategory.description || ""
  } : {};

  // Form methods and properties from react-hook-form
  const methods = useForm({
    defaultValues
  });
  const { handleSubmit, reset, setValue, control, formState: { isSubmitting } } = methods;
  const [formInitialized, setFormInitialized] = useState(false);

  // Image hook: max 3 images, 2 MB each
  const {
    images,         // [{ file, previewUrl }]
    mainImage,      // previewUrl
    addLocalImages,
    removeLocalImage,
    setPrimaryImage,
    setInitialImages,
    getImagesToDelete
  } = useImageUpload(3, 2); // Max 3 images, 2MB each

  // Load category data into the form
  useEffect(() => {
    if (editingCategory && !formInitialized) {
      // Set form values for non-boolean fields
      Object.entries(editingCategory).forEach(([key, value]) => {
        if (key !== 'active' && key !== 'featured') {
          setValue(key, value);
        }
      });
      
      // Establecer explícitamente los campos booleanos
      if (editingCategory.hasOwnProperty('active')) {
        const activeValue = editingCategory.active ? "true" : "false";
        setValue('active', activeValue, { shouldValidate: true });
      }
      
      if (editingCategory.hasOwnProperty('featured')) {
        const featuredValue = editingCategory.featured ? "true" : "false";
        setValue('featured', featuredValue, { shouldValidate: true });
      }

      // Prepare existing images
      if (editingCategory.images && Array.isArray(editingCategory.images)) {
        const existingImages = editingCategory.images.map((url) => ({
          file: null,
          previewUrl: url,
        }));

        setInitialImages(existingImages);
        if (editingCategory.mainImage) {
          setPrimaryImage(editingCategory.mainImage);
        }
      }
      
      setFormInitialized(true);
    }
  }, [editingCategory, setValue, images.length, setInitialImages, setPrimaryImage, formInitialized]);


  /**
   * Handle form submission.
   * Uploads new images, removes deleted ones, and saves the category.
   *
   * @param {Object} data - Form data
   */

  const onSubmit = async (data) => {
    // 1️⃣ Prepare folder path
    const categoryName = data.name?.trim() || "unknown";
    const folderPath = `category-images/${categoryName.replace(/\s+/g, '-')}`;

    // 2️⃣ Upload new images to Firebase
    const uploadedURLs = [];
    for (const img of images) {
      if (img.file) {
        const url = await uploadFile(img.file, folderPath);
        if (url) uploadedURLs.push(url);
      } else {
        uploadedURLs.push(img.previewUrl);
      }
    }

    // 3️⃣ Determine the main image URL
    let mainUrl = uploadedURLs[0] || null;
    const found = uploadedURLs.find((u) => u === mainImage);
    if (found) mainUrl = found;

    // 4️⃣ Remove images marked for deletion
    const imagesToDelete = getImagesToDelete();
    for (const imageUrl of imagesToDelete) {
      await deleteFile(imageUrl);
    }

    // 5️⃣ Prepare category data
    const categoryData = {
      name: data.name,
      description: data.description || "",
      active: data.active === "true",
      featured: data.featured === "true", // Añadido campo featured
      images: uploadedURLs,
      mainImage: mainUrl,
    };

    // 6️⃣ Create or update the category
    const response = editingCategory
      ? await updateCategory(editingCategory.id, categoryData)
      : await createCategory(categoryData);

    // 6.1) Handle errors
    if (!response.ok) {
      alert(`Error al ${editingCategory ? "actualizar" : "crear"} la categoría: ${response.error}`);
      return;
    }

    // 7️⃣ Reset form and notify success
    alert(`Categoría ${editingCategory ? "actualizada" : "creada"} exitosamente`);
    reset();
    onCategorySaved();
  };


  return (

    <FormProvider {...methods}>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-4">

        {/* Form title */}
        <h3>{editingCategory ? "Editar Categoría" : "Agregar Categoría"}</h3>

        {/* Name */}
        <InputField
          name="name"
          label="Nombre"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
        />

        {/* Description */}
        <InputField
          name="description"
          label="Descripción"
          control={control}
          type="textarea"
        />

        {/* Image uploader */}
        <ImageUploader onUpload={addLocalImages} />

        {/* Image preview */}
        <ImagePreview
          images={images}
          mainImage={mainImage}
          onRemove={removeLocalImage}
          onSetMain={setPrimaryImage}
        />

        {/* Active */}
        <SelectField
          name="active"
          label="Activa"
          control={control}
          options={[["true", "Sí"], ["false", "No"]]}
          defaultValue={editingCategory?.active ? "true" : "false"}
        />

        {/* Featured */}
        <SelectField
          name="featured"
          label="Destacada"
          control={control}
          options={[["true", "Sí"], ["false", "No"]]}
          defaultValue={editingCategory?.featured ? "true" : "false"}
        />

        {/* Submit button */}
        <button type="submit" className="btn btn-primary w-100 mt-3" disabled={isSubmitting}>
          {editingCategory ? "Actualizar Categoría" : "Guardar Categoría"}
        </button>

      </form>

    </FormProvider>
  );
};