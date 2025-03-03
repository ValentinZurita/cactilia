import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, getDownloadURL, deleteObject, getMetadata } from "firebase/storage";
import { FirebaseDB, FirebaseStorage } from "../../../firebase/firebaseConfig";
import { uploadFile } from "../../../firebase/firebaseStorage";

/**
 * Upload a new media item to Firebase Storage and save metadata to Firestore
 *
 * @param {File} file - The file to upload
 * @param {Object} metadata - Additional metadata for the file (category, alt, tags)
 * @returns {Promise<Object>} - Upload result with success status and media data
 */
export const uploadMedia = async (file, metadata = {}) => {
  try {
    // 1. Upload file to Firebase Storage in media folder
    const storageRef = `media/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const downloadURL = await uploadFile(file, 'media');

    if (!downloadURL) {
      throw new Error("Failed to upload file");
    }

    // 2. Add metadata to Firestore
    const mediaData = {
      filename: file.name,
      url: downloadURL,
      storageRef: storageRef,
      size: file.size,
      type: file.type,
      uploadedAt: serverTimestamp(),
      category: metadata.category || "uncategorized",
      tags: metadata.tags || [],
      alt: metadata.alt || file.name,
    };

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
 * @param {Array} options.tags - Filter by tags
 * @returns {Promise<Object>} - Query result with media items
 */
export const getMediaItems = async (options = {}) => {
  try {
    let mediaQuery = collection(FirebaseDB, "media");
    const queryConstraints = [];

    // Apply filters if provided
    if (options.category) {
      queryConstraints.push(where("category", "==", options.category));
    }

    // Add more filters as needed
    queryConstraints.push(orderBy("uploadedAt", "desc"));

    // Execute query
    const querySnapshot = await getDocs(
      query(mediaQuery, ...queryConstraints)
    );

    const mediaItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Convert timestamp to date string for display
      uploadedAt: doc.data().uploadedAt?.toDate?.() || new Date(),
    }));

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
    const mediaRef = doc(FirebaseDB, "media", mediaId);
    await updateDoc(mediaRef, {
      ...updatedData,
      updatedAt: serverTimestamp()
    });

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
 * @param {string} storageRef - The storage reference path
 * @returns {Promise<Object>} - Deletion result
 */
export const deleteMediaItem = async (mediaId, url) => {
  try {
    // 1. Delete from Firestore
    const mediaRef = doc(FirebaseDB, "media", mediaId);
    await deleteDoc(mediaRef);

    // 2. Delete from Storage
    try {
      // Extract the storage path from the URL
      const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      const fileRef = ref(FirebaseStorage, decodedPath);
      await deleteObject(fileRef);
    } catch (storageError) {
      console.error("Error deleting file from storage:", storageError);
      // Continue with the function even if storage deletion fails
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