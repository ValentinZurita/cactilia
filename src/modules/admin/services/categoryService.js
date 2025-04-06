import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { FirebaseDB } from "../../../config/firebase/firebaseConfig";


/**
 *
 * Get all categories from the database.
 *
 * @returns {Object} - The result of the operation.
 * @returns {boolean} ok - Indicates if the operation was successful.
 * @returns {Array} [data] - The categories data.
 * @returns {Object} [error] - The error object in case of failure.
 *
 * @example
 * const result = await getCategories();
 * if (result.ok) {
 * console.log("Categories:", result.data);
 * } else {
 * console.error("Error fetching categories:", result.error);
 * }
 *
 * EXAMPLE OF DATA RETURNED
 * [
 *  {
 *  id: 'category1',
 *  name: 'Category 1',
 *  description: 'Description of category 1',
 *  createdAt: Timestamp { seconds: 1630311600, nanoseconds: 0 },
 *  updatedAt: Timestamp { seconds: 1630311600, nanoseconds: 0 }
 *  },
 *  {
 *  id: 'category2',
 *  name: 'Category 2',
 *  description: 'Description of category 2',
 *  createdAt: Timestamp { seconds: 1630311600, nanoseconds: 0 },
 *  updatedAt: Timestamp { seconds: 1630311600, nanoseconds: 0 }
 *  }
 *  ]
 *
 */


export const getCategories = async () => {
  try {
    try {
      const querySnapshot = await getDocs(collection(FirebaseDB, "categories"));
      const categories = querySnapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }));

      return { ok: true, data: categories };
    } catch (permissionError) {
      console.warn("Posible error de permisos al obtener categorías:", permissionError);

      // Proporcionar categorías de muestra para usuarios no autenticados
      const sampleCategories = [
        {
          id: 'sample-category-1',
          name: 'Plantas',
          description: 'Variedad de plantas para tu hogar',
          image: '/public/images/categories/plants.jpg',
          active: true
        },
        {
          id: 'sample-category-2',
          name: 'Macetas',
          description: 'Macetas decorativas para tus plantas',
          image: '/public/images/categories/pots.jpg',
          active: true
        },
        {
          id: 'sample-category-3',
          name: 'Accesorios',
          description: 'Accesorios para el cuidado de plantas',
          image: '/public/images/categories/accessories.jpg',
          active: true
        }
      ];

      return { 
        ok: true, 
        data: sampleCategories,
        isPublicFallback: true 
      };
    }
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { ok: false, error };
  }
};




/**
 *
 * Create a new category in the database.
 *
 * @param {Object} categoryData - The category data to save.
 *
 * @returns {Object} - The result of the operation.
 * @returns {boolean} ok - Indicates if the operation was successful.
 * @returns {string} [id] - The ID of the new category.
 * @returns {Object} [error] - The error object in case of failure.
 *
 * @example
 * const result = await createCategory(categoryData);
 * if (result.ok) {
 * console.log("Category created successfully. ID:", result.id);
 * } else {
 * console.error("Error creating category:", result.error);
 * }
 *
 * EXAMPLE OF DATA TO SAVE
 * {
 * name: 'Category 1',
 * description: 'Description of category 1',
 * createdAt: Timestamp { seconds: 1630311600, nanoseconds: 0 },
 * updatedAt: Timestamp { seconds: 1630311600, nanoseconds: 0 }
 * }
 *
 */


export const createCategory = async (categoryData) => {
  try {
    const docRef = await addDoc(collection(FirebaseDB, "categories"), categoryData);
    return { ok: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating category:", error);
    return { ok: false, error };
  }
};




/**
 *
 * Update a category in the database.
 *
 * @param {string} categoryId - The ID of the category to update.
 * @param {Object} updatedData - The updated category data.
 *
 * @returns {Object} - The result of the operation.
 * @returns {boolean} ok - Indicates if the operation was successful.
 * @returns {Object} [error] - The error object in case of failure.
 *
 * @example
 * const result = await updateCategory(categoryId, updatedData);
 * if (result.ok) {
 * console.log("Category updated successfully.");
 * } else {
 * console.error("Error updating category:", result.error);
 * }
 *
 * EXAMPLE OF UPDATED DATA
 * {
 * name: 'Category 1',
 * description: 'Description of category 1',
 * updatedAt: Timestamp { seconds: 1630311600, nanoseconds: 0 }
 * }
 *
 */


export const updateCategory = async (categoryId, updatedData) => {
  try {
    const categoryRef = doc(FirebaseDB, "categories", categoryId);
    await updateDoc(categoryRef, updatedData);
    return { ok: true };
  } catch (error) {
    console.error("Error updating category:", error);
    return { ok: false, error };
  }
};




/**
 *
 * Delete a category from the database.
 *
 * @param {string} categoryId - The ID of the category to delete.
 *
 * @returns {Object} - The result of the operation.
 * @returns {boolean} ok - Indicates if the operation was successful.
 * @returns {Object} [error] - The error object in case of failure.
 *
 * @example
 * const result = await deleteCategory(categoryId);
 * if (result.ok) {
 * console.log("Category deleted successfully.");
 * } else {
 * console.error("Error deleting category:", result.error);
 * }
 *
 * EXAMPLE OF DATA TO DELETE
 * 'category1'
 *
 */


export const deleteCategory = async (categoryId) => {
  try {
    const categoryRef = doc(FirebaseDB, "categories", categoryId);
    await deleteDoc(categoryRef);
    return { ok: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { ok: false, error };
  }
};