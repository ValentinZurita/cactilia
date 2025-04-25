import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Preloads an array of image URLs.
 * @param {Array<string>} imageUrls - Array of image URLs to preload.
 */
const preloadImages = (imageUrls) => {
  imageUrls.forEach(url => {
    if (url) { // Check if URL is valid
      const img = new Image();
      img.src = url;
    }
  });
};

/**
 * Custom hook to manage image slider logic including auto-rotation and preloading.
 *
 * @param {Array<{id: string, src: string, alt: string}>} images - Array of image objects.
 * @param {boolean} autoRotate - Whether to automatically rotate images.
 * @param {number} interval - Rotation interval in milliseconds.
 * @returns {{ currentIndex: number }} - The index of the currently active image.
 */
export const useImageSlider = (images, autoRotate = false, interval = 5000) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Ensure images is always an array, extracting valid URLs
  const imageArray = useMemo(() => (
    Array.isArray(images) ? images.filter(img => img?.src) : []
  ), [images]);

  const imageUrls = useMemo(() => imageArray.map(img => img.src), [imageArray]);

  // Effect for preloading images when the list changes
  useEffect(() => {
    if (imageUrls.length > 0) {
      preloadImages(imageUrls);
    }
  }, [imageUrls]);

  // Effect for auto-rotation
  useEffect(() => {
    // Clear existing interval if settings change
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoRotate && imageArray.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageArray.length);
      }, interval);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  // Rerun effect if autoRotate, interval, or the number of images changes
  }, [autoRotate, interval, imageArray.length]); 

  return { currentIndex };
}; 