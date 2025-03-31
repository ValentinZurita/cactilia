import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, getDoc} from "firebase/firestore";
import { FirebaseDB } from "../../../config/firebase/firebaseConfig";


/*
  *
  * Get category name by ID.
  * This helper function retrieves the category name based on the provided categoryId.
  *
  * @param {string} categoryId - The ID of the category to retrieve the name for.
  *
  * @returns {string} - The name of the category, or a default string if not found.
  *
  * @example
  * const categoryName = await getCategoryNameById("abc123");
  * console.log("Category name:", categoryName);
  *
 */


const getCategoryNameById = async (categoryId) => {
  if (!categoryId) return "Sin categoría";

  try {
    const categoryRef = doc(FirebaseDB, "categories", categoryId);
    const categorySnap = await getDoc(categoryRef);
    return categorySnap.exists() ? categorySnap.data().name : "Categoría desconocida";
  } catch (error) {
    console.error("Error fetching category:", error);
    return "Error de categoría";
  }
};



/*
  *
  * Get all products from the database.
  * This function retrieves all products, adding the category name based on the categoryId.
  *
  * @returns {Object} - The result of the operation.
  * @returns {boolean} ok - Indicates if the operation was successful.
  * @returns {Array} [data] - The products data with category names included.
  * @returns {Object} [error] - The error object in case of failure.
  *
  * @example
  * const result = await getProducts();
  * if (result.ok) {
  * console.log("Products:", result.data);
  * }
  * else {
  * console.error("Error fetching products:", result.error);
  * }
  *
 */


export const getProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(FirebaseDB, "products"));
    const products = await Promise.all(
      querySnapshot.docs.map(async (docItem) => {
        const product = { id: docItem.id, ...docItem.data() };
        product.category = await getCategoryNameById(product.categoryId);
        return product;
      })
    );

    console.log("Products fetched with category names:", products);
    return { ok: true, data: products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { ok: false, error };
  }
};



/*
  * Function to add a product to the database.
  *
  * @param {Object} productData - The product data to save.
  *
  * @returns {Object} - The result of the operation.
  * @returns {boolean} ok - Indicates if the operation was successful.
  * @returns {string} [id] - The ID of the new product.
  * @returns {Object} [error] - The error object in case of failure.
  *
  * @example
  * const result = await addProduct(productData);
  * if (result.ok) {
  *  console.log("Product added successfully. ID:", result.id);
  * } else {
  * console.error("Error adding product:", result.error);
  * }
  *
 */


export const addProduct = async (productData) => {
  try {
    const dataToSave = {
      ...productData,
      active: productData.active ?? true,
      featured: productData.featured ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(FirebaseDB, "products"), dataToSave);
    return { ok: true, id: docRef.id };

  } catch (error) {
    console.error("Error adding product:", error);
    return { ok: false, error };
  }
};




/*
  *
  * Delete a product from the database.
  *
  * @param {string} productId - The ID of the product to delete.
  *
  * @returns {Object} - The result of the operation.
  * @returns {boolean} ok - Indicates if the operation was successful.
  * @returns {Object} [error] - The error object in case of failure.
  *
  * @example
  * const result = await deleteProduct(productId);
  * if (result.ok) {
  * console.log("Product deleted successfully.");
  * } else {
  * console.error("Error deleting product:", result.error);
  * }
  *
 */


export const updateProduct = async (productId, updatedData) => {
  try {
    const productRef = doc(FirebaseDB, "products", productId);
    await updateDoc(productRef, {
      ...updatedData,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { ok: false, error };
  }
};




/*
  *
  * Delete a product from the database.
  *
  * @param {string} productId - The ID of the product to delete.
  *
  * @returns {Object} - The result of the operation.
  * @returns {boolean} ok - Indicates if the operation was successful.
  * @returns {Object} [error] - The error object in case of failure.
  *
  * @example
  * const result = await deleteProduct(productId);
  * if (result.ok) {
  * console.log("Product deleted successfully.");
  * } else {
  * console.error("Error deleting product:", result.error);
  * }
  *
 */


export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(FirebaseDB, "products", productId);
    await deleteDoc(productRef);
    return { ok: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { ok: false, error };
  }
};
