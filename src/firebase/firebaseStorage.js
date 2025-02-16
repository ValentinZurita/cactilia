import { FirebaseStorage } from './firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';


/**
 * Upload file to Firebase Storage and return the download
 * URL to access the file later.
 *
 * @param {File} file - File to upload
 * @param {string} folder - Folder to store the file by default 'product-images'
 * @returns {Promise<string>} - Download URL of the file uploaded to Firebase Storage
 *
 * @throws {Error} - If there is an error uploading the file
 *
 * @example
 * const downloadURL = await uploadFile(file);
 */


// Upload file and get URL
export const uploadFile = async (file, folder = 'images') => {
  if (!file) return null;

  // File path
  const fileName = `${folder}/${Date.now()}_${file.name}`;
  const fileRef = ref(FirebaseStorage, fileName);

  // Upload file
  try {

    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log('File uploaded:', downloadURL);

    return downloadURL;

    // Return download URL
  } catch (error) {

    console.error('Error uploading file:', error);

    throw error;
  }

};




/**
 * Delete a file from Firebase Storage by its URL.
 *
 * @param {string} fileUrl - URL of the file to delete
 *
 * @throws {Error} - If there is an error deleting the file
 *
 * @example
 * await deleteFile(fileUrl);
 */


// Delete file by URL
export const deleteFile = async (fileUrl) => {

  // Get file path
  if (!fileUrl) return;

  // Decode file path
  const decodedPath = decodeURIComponent(fileUrl.split('/o/')[1].split('?')[0]);
  const fileRef = ref(FirebaseStorage, decodedPath);

  // Delete file
  try {

    await deleteObject(fileRef);

    console.log('File deleted:', fileUrl);

    // Return download URL
  } catch (error) {

    console.error('Error deleting file:', error);

    throw error;
  }

};