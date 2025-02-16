import { useState } from 'react'


/**
 * useImageUpload hook for handling image upload and management.
 *
 * @param {number} maxImages - Maximum number of images allowed
 * @param {number} maxSizeMB - Maximum size of the images in MB
 *
 * @returns {Object} - An object with the following properties: images, mainImage, uploadImages, removeImage, setPrimaryImage, setInitialImages, getImagesToDelete
 *
 * @example
 * const { images, mainImage, uploadImages, removeImage, setPrimaryImage, setInitialImages, getImagesToDelete } = useImageUpload();
 */


export const useImageUpload = (maxImages = 5, maxSizeMB = 2) => {

  // States
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);



  /**
   * Add local images for preview without uploading.
   * @param {FileList | File[]} files - List of files to add locally
   * @returns {void}
   * @example
   * addLocalImages(files);
   * @example
   * addLocalImages([file1, file2]);
   */

  const addLocalImages = (files) => {

    const selectedFiles = Array.from(files); // Convert to array

    if (images.length + selectedFiles.length > maxImages) {
      alert(`Maximum of ${maxImages} images allowed.`);
      return;
    }

    // Create preview URLs
    const newItems = [];

    // Check file size and create preview URLs
    for (const file of selectedFiles) {

      if (file.size > maxSizeMB * 1024 * 1024) { // Validate size in MB
        alert(`The file ${file.name} exceeds the maximum allowed size of ${maxSizeMB}MB.`);
        continue;
      }

      newItems.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    const updated = [...images, ...newItems];
    setImages(updated);

    // Set the main image if not set
    if (!mainImage && updated.length > 0) {
      setMainImage(updated[0].previewUrl);
    }
  };




  /**
   * Remove an image from the images state.
   * If the image exists in Firebase, mark it for deletion.
   *
   * @param { string } previewUrl  - URL of the image to remove
   * @example
   * removeLocalImage(previewUrl);
   * @example
   * removeLocalImage('https://example.com/image.jpg');
   */

  const removeLocalImage = (previewUrl) => {

    // Check if the image is already uploaded (no file means it's from Firebase)
    const imageToRemove = images.find((img) => img.previewUrl === previewUrl);
    if (imageToRemove?.file === null) {
      setImagesToDelete((prev) => [...prev, previewUrl]);
    }

    // Remove the image from the images state
    const updated = images.filter((img) => img.previewUrl !== previewUrl);
    setImages(updated);

    // If the main image is removed, set another one
    if (mainImage === previewUrl) {
      setMainImage(updated[0]?.previewUrl || null);
    }
  };




  /**
   * Set the main image to the selected one
   * @param { string } previewUrl - URL of the image to set as main
   * @example
   * setPrimaryImage(previewUrl);
   * @example
   * setPrimaryImage('https://example.com/image.jpg');
   */

  const setPrimaryImage = (previewUrl) => {
    setMainImage(previewUrl);
  };




  /**
   * method to handle initial images for editing existing products.
   *
   * @param {Array} initialImages - Array of existing images [{file: null, previewUrl: string}]
   * @example
   * setInitialImages([{file: null, previewUrl: 'https://example.com/image.jpg'}])
   */

  const setInitialImages = (initialImages) => {
    // Set the existing images without modifying them
    setImages(initialImages);

    // Set the main image if it's not already set
    if (!mainImage && initialImages.length > 0) {
      setMainImage(initialImages[0].previewUrl);
    }
  };



  /**
   * method to retrieve images marked for deletion.
   *
   * @returns {string[]} - Array of image URLs to delete
   * @example
   * const imagesToDelete = getImagesToDelete();
   */

  const getImagesToDelete = () => imagesToDelete;



  // Return the images state and the functions to manage it
  return {
    images,           // [{ file, previewUrl }]
    mainImage,        // previewUrl of the main image
    addLocalImages,   // Function to add images
    removeLocalImage, // Function to remove an image
    setPrimaryImage,  // Function to set the main image
    setInitialImages, // Function to set initial images
    getImagesToDelete // Function to get images marked for deletion
  };
};