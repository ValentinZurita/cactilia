import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, getDoc } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject } from "firebase/storage";
import { FirebaseDB, FirebaseStorage } from "../../../firebase/firebaseConfig";
import { uploadFile } from "../../../firebase/firebaseStorage";

/**
 * Upload a new media item to Firebase Storage and save metadata to Firestore
 *
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata for the file (collectionId, name, alt, tags)
 * @returns {Promise<Object>} - Upload result with success status and media data
 */
export const uploadMedia = async (file, metadata = {}) => {
  try {
    // Validar inputs
    if (!file) {
      throw new Error("No file provided for upload");
    }

    // Usar el nombre personalizado si se proporciona, o el nombre original del archivo
    const displayName = metadata.name || file.name;

    // Crear un nombre de archivo seguro para Storage
    const safeFileName = displayName.replace(/\s+/g, '_').toLowerCase();

    // 1. Upload file to Firebase Storage in media folder with custom name
    const storageRef = `media/${Date.now()}_${safeFileName}`;
    const downloadURL = await uploadFile(file, 'media');

    if (!downloadURL) {
      throw new Error("Failed to upload file to storage");
    }

    // 2. Add metadata to Firestore, incluyendo todos los metadatos proporcionados
    const mediaData = {
      filename: file.name,         // Nombre original del archivo
      name: displayName,           // Nombre personalizado
      url: downloadURL,            // URL del archivo en Storage
      storageRef: storageRef,      // Referencia en Storage
      size: file.size,             // Tamaño en bytes
      type: file.type,             // Tipo MIME
      uploadedAt: serverTimestamp(), // Timestamp de subida

      // Metadatos adicionales
      collectionId: metadata.collectionId || null, // ID de colección (importante)
      tags: Array.isArray(metadata.tags) ? metadata.tags : [],
      alt: metadata.alt || displayName, // Texto alternativo
    };

    console.log('Guardando archivo con metadatos:', mediaData); // Log para debugging

    const docRef = await addDoc(collection(FirebaseDB, "media"), mediaData);

    return {
      ok: true,
      id: docRef.id,
      ...mediaData
    };
  } catch (error) {
    console.error("Error uploading media:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Get all media items with optional filtering
 *
 * @param {Object} options - Filter options
 * @param {string} options.category - Filter by category
 * @param {string} options.searchTerm - Search by filename, alt text, or tags
 * @param {Array} options.tags - Filter by tags
 * @returns {Promise<Object>} - Query result with media items
 */
export const getMediaItems = async (options = {}) => {
  try {
    const mediaCollection = collection(FirebaseDB, "media");
    const queryConstraints = [];

    // Apply category filter if provided
    if (options.category) {
      queryConstraints.push(where("category", "==", options.category));
    }

    // Apply tags filter if provided
    if (options.tags && Array.isArray(options.tags) && options.tags.length > 0) {
      // Using array-contains-any to match any of the provided tags
      queryConstraints.push(where("tags", "array-contains-any", options.tags));
    }

    // Always sort by uploadedAt in descending order (newest first)
    queryConstraints.push(orderBy("uploadedAt", "desc"));

    // Execute query with all constraints
    const querySnapshot = await getDocs(
      query(mediaCollection, ...queryConstraints)
    );

    // Process results
    let mediaItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamp to date string for display
      uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date(),
    }));

    // Apply text search filtering if provided (client-side)
    if (options.searchTerm) {
      const searchLower = options.searchTerm.toLowerCase();
      mediaItems = mediaItems.filter(item =>
        item.filename.toLowerCase().includes(searchLower) ||
        (item.alt && item.alt.toLowerCase().includes(searchLower)) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    return { ok: true, data: mediaItems };
  } catch (error) {
    console.error("Error fetching media items:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Update media item metadata
 *
 * @param {string} mediaId - The ID of the media item to update
 * @param {Object} updatedData - The updated metadata
 * @returns {Promise<Object>} - Update result
 */
export const updateMediaItem = async (mediaId, updatedData) => {
  try {
    // Validate inputs
    if (!mediaId) {
      throw new Error("Media ID is required for updating");
    }

    if (!updatedData || Object.keys(updatedData).length === 0) {
      throw new Error("No update data provided");
    }

    // Prepare data for update
    const dataToUpdate = {
      ...updatedData,
      updatedAt: serverTimestamp()
    };

    // Ensure tags is an array if provided
    if (updatedData.tags && !Array.isArray(updatedData.tags)) {
      dataToUpdate.tags = [];
    }

    // Update in Firestore
    const mediaRef = doc(FirebaseDB, "media", mediaId);
    await updateDoc(mediaRef, dataToUpdate);

    return { ok: true };
  } catch (error) {
    console.error("Error updating media item:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Delete a media item from both Firestore and Storage
 *
 * @param {string} mediaId - The ID of the media item to delete
 * @param {string} url - The storage URL of the media item
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteMediaItem = async (mediaId, url) => {
  try {
    // Validate inputs
    if (!mediaId) {
      throw new Error("Media ID is required for deletion");
    }

    // 1. Delete from Firestore
    const mediaRef = doc(FirebaseDB, "media", mediaId);
    await deleteDoc(mediaRef);

    // 2. Delete from Storage if URL provided
    if (url) {
      try {
        // Extract the storage path from the URL
        const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
        const fileRef = ref(FirebaseStorage, decodedPath);
        await deleteObject(fileRef);
      } catch (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with the function even if storage deletion fails
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("Error deleting media item:", error);
    return { ok: false, error: error.message };
  }
};

/**
 * Get single media item by ID
 *
 * @param {string} mediaId - The ID of the media item
 * @returns {Promise<Object>} - The media item data
 */
export const getMediaItemById = async (mediaId) => {
  try {
    if (!mediaId) {
      throw new Error("Media ID is required");
    }

    const mediaRef = doc(FirebaseDB, "media", mediaId);
    const mediaSnap = await getDoc(mediaRef);

    if (!mediaSnap.exists()) {
      throw new Error("Media item not found");
    }

    return {
      ok: true,
      data: {
        id: mediaSnap.id,
        ...mediaSnap.data(),
        uploadedAt: mediaSnap.data().uploadedAt?.toDate?.() || new Date(),
      }
    };
  } catch (error) {
    console.error("Error fetching media item:", error);
    return { ok: false, error: error.message };
  }
};