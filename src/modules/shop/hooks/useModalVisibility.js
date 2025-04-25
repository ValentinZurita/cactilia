import { useState, useEffect } from 'react';

/**
 * Hook to manage modal visibility transitions and body scroll lock.
 * @param {boolean} isOpen - Whether the modal should be open.
 * @param {any} dependency - A dependency (like the modal's data) that triggers the effect when the modal opens.
 * @returns {boolean} - Whether the modal should be considered visibly rendered (after transition delay).
 */
export const useModalVisibility = (isOpen, dependency) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (isOpen && dependency) {
      // Short delay to allow CSS transition
      timer = setTimeout(() => {
        setVisible(true);
        document.body.style.overflow = 'hidden'; // Prevent background scroll
      }, 10); 
    } else {
      setVisible(false);
      document.body.style.overflow = ''; // Restore background scroll
    }

    // Cleanup function
    return () => {
      clearTimeout(timer);
      // Ensure scroll is restored if modal closes abruptly or component unmounts
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, dependency]); // Re-run effect if isOpen or the dependency changes

  return visible;
}; 