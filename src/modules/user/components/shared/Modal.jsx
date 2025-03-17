import React, { useEffect } from 'react';

/**
 * Fixed Modal component
 * Resolves issues with React static flags and improper event handling
 */
export const Modal = ({
                        isOpen,
                        onClose,
                        title,
                        children,
                        size = 'md',
                        showFooter = true,
                        footer = null,
                        className = ''
                      }) => {
  // If not open, don't render anything
  if (!isOpen) return null;

  // Prevent scrolling when modal is open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup when unmounting
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Size class mapping
  const sizeClass = {
    sm: 'modal-sm',
    md: '',
    lg: 'modal-lg',
    xl: 'modal-xl',
  }[size] || '';

  // Fixed event handler for backdrop clicks
  const handleBackdropClick = (e) => {
    // Only close if clicked directly on the backdrop
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className={`modal-dialog ${sizeClass} ${className}`}
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          maxWidth: '100%',
          margin: '1.75rem',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h5 className="modal-title">{title}</h5>
          <button
            type="button"
            className="btn-close"
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              onClose();
            }}
            aria-label="Close"
          ></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{
          padding: '1rem',
          overflowY: 'auto'
        }}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="modal-footer" style={{
            padding: '1rem',
            borderTop: '1px solid rgba(0, 0, 0, 0.06)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}>
            {footer || (
              <>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    onClose();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-green-3 text-white">
                  Save
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};