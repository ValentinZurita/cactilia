import React from 'react';
import PropTypes from 'prop-types';

/**
 * EmptyState component to display when a section has no content
 * 
 * @param {Object} props
 * @param {string} props.icon - Bootstrap icon class to use (without the 'bi-' prefix)
 * @param {string} props.title - Title text to display
 * @param {string} props.message - Message text to display
 * @param {React.ReactNode} props.action - Optional action button or link
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({ 
  icon = 'info-circle',
  title,
  message,
  action,
  className = ''
}) => {
  const iconClass = icon.startsWith('bi-') ? icon : `bi-${icon}`;
  
  return (
    <div className={`empty-state text-center py-4 ${className}`}>
      <div className="empty-state-icon mb-3">
        <i className={`bi ${iconClass}`} style={{ fontSize: '2.5rem', opacity: 0.6 }}></i>
      </div>
      
      {title && (
        <h4 className="empty-state-title h5 mb-2">{title}</h4>
      )}
      
      {message && (
        <p className="empty-state-message text-muted mb-3">{message}</p>
      )}
      
      {action && (
        <div className="empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string
};

export default EmptyState; 