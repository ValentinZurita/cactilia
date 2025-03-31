import React, { useEffect } from 'react';
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
  const methods = useForm();
  const { handleSubmit, reset, setValue, control, formState: { isSubmitting } } = methods;

  // Image upload hook for local image management
  const {
    images,       // [{ file, previewUrl }]
    mainImage,    // previewUrl of the main image
    addLocalImages,
    removeLocalImage,
    setPrimaryImage,
    setInitialImages,
    getImagesToDelete // 🆕 Retrieve images marked for deletion
  } = useImageUpload();

  /**
   * Load product data if editing.
   * It sets form values and existing images for editing.
   */
  useEffect(() => {
    if (editingProduct && images.length === 0) { // ✅ Prevent infinite re-renders
      // Set form values
      Object.entries(editingProduct).forEach(([key, value]) => {
        setValue(key, Array.isArray(value) ? value.join(', ') : value);
      });

      // Prepare initial images
      const existingImages = editingProduct.images?.map((url) => ({
        file: null,
        previewUrl: url
      })) || [];

      setInitialImages(existingImages);

      if (editingProduct.mainImage) {
        setPrimaryImage(editingProduct.mainImage);
      }
    }
  }, [editingProduct, setValue, images.length, setInitialImages, setPrimaryImage]);

  /**
   * Handle form submission.
   * Uploads images, removes marked images, and saves the product.
   *
   * @param {Object} data - Form data submitted
   */
  const handleSubmitForm = async (data) => {
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

    // 5️⃣ Create product object
    const productData = {
      ...data,
      price: parseFloat(data.price),
      stock: parseInt(data.stock, 10),
      images: uploadedUrls,
      mainImage: mainUrl,
      active: data.active === "true",
      featured: data.featured === "true",
    };

    // 6️⃣ Save or update product
    const response = editingProduct
      ? await updateProduct(editingProduct.id, productData)
      : await addProduct(productData);

    if (!response.ok) {
      alert(`Error ${editingProduct ? "updating" : "creating"} product: ${response.error}`);
      return;
    }

    // ✅ Success feedback
    alert(`Product ${editingProduct ? "updated" : "created"} successfully`);
    reset();
    onProductSaved();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitForm)} className="mt-4">
        <h3>{editingProduct ? "Edit Product" : "Add Product"}</h3>

        {/* 🧩 Category selection dropdown */}
        <DynamicDropdown
          name="categoryId"
          label="Category"
          control={control}
          fetchFunction={getCategories}
        />

        {/* 🖋️ Basic product info */}
        <InputField name="name" label="Name" control={control} required />
        <InputField name="description" label="Description" control={control} type="textarea" required />
        <InputField name="price" label="Price" control={control} type="number" required />
        <InputField name="stock" label="Stock" control={control} type="number" required />
        <InputField name="sku" label="SKU" control={control} required />

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
        <SelectField name="active" label="Active?" control={control} options={[["true", "Yes"], ["false", "No"]]} />
        <SelectField name="featured" label="Featured?" control={control} options={[["false", "No"], ["true", "Yes"]]} />

        {/* 🚀 Submit button */}
        <button
          type="submit"
          className="btn btn-primary w-100 mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? (editingProduct ? "Updating..." : "Creating...")
            : (editingProduct ? "Update Product" : "Crear Producto")}
        </button>
      </form>
    </FormProvider>
  );
};