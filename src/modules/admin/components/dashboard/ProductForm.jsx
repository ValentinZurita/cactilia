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
import { fetchShippingRules } from '../../services/shippingRuleService';

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
        // Skip arrays for now - handle them separately
        if (!Array.isArray(value)) {
          // Convert boolean values to strings for select fields
          if (key === 'active' || key === 'featured') {
            console.log(`Setting ${key} to`, value ? "true" : "false");
            setValue(key, value ? "true" : "false");
          } else {
            setValue(key, value);
          }
        }
      });
      
      // Handle arrays separately to avoid string conversion
      if (editingProduct.images && Array.isArray(editingProduct.images)) {
        setValue('images', editingProduct.images);
      }
      
      // Log shipping rule ID for debugging
      console.log('Loading product with shipping rule ID:', editingProduct.shippingRuleId);

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
      weight: parseFloat(data.weight),
      images: uploadedUrls,
      mainImage: mainUrl,
      active: data.active === "true",
      featured: data.featured === "true",
      shippingRuleId: data.shippingRuleId || null
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
          defaultValue=""
          rules={{ required: false }}
        />

        {/* 🧩 Shipping rule selection dropdown */}
        <DynamicDropdown
          name="shippingRuleId"
          label="Regla de envío"
          control={control}
          fetchFunction={async () => {
            try {
              console.log('ProductForm: Fetching shipping rules');
              const result = await fetchShippingRules();
              console.log('ProductForm: Shipping rules result', result);
              
              if (result.ok && result.data && result.data.length > 0) {
                const formattedData = result.data.map(rule => ({
                  id: rule.id,
                  name: rule.zona || 'Regla sin nombre'
                }));
                console.log('ProductForm: Formatted shipping rules', formattedData);
                return { ok: true, data: formattedData };
              } else {
                console.error('ProductForm: No shipping rules found or error in response', result);
                return { ok: false, data: [], error: result.error || 'No se encontraron reglas de envío' };
              }
            } catch (error) {
              console.error('ProductForm: Error fetching shipping rules', error);
              return { ok: false, data: [], error: error.message };
            }
          }}
          rules={{ required: true }}
          defaultValue=""
        />

        {/* 🖋️ Basic product info */}
        <InputField 
          name="name" 
          label="Name" 
          control={control} 
          required={true}
          defaultValue="" 
        />
        <InputField 
          name="description" 
          label="Description" 
          control={control} 
          type="textarea" 
          required={false}
          defaultValue="" 
        />
        <InputField 
          name="price" 
          label="Price" 
          control={control} 
          type="number" 
          required={true}
          defaultValue="0" 
        />
        <InputField 
          name="weight" 
          label="Weight (kg)" 
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
          label="Active?" 
          control={control} 
          options={[["true", "Yes"], ["false", "No"]]} 
          defaultValue="true"
          required={false}
        />
        <SelectField 
          name="featured" 
          label="Featured?" 
          control={control} 
          options={[["false", "No"], ["true", "Yes"]]} 
          defaultValue="false"
          required={false}
        />

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