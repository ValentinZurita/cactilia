import { useState } from 'react';
import { SOCIAL_MEDIA_LINKS } from '../../../../shared/constants/index.js';

/**
 * Editor component for customizing social media links in the contact page
 *
 * @param {Object} props
 * @param {Object} props.data - Current social media configuration
 * @param {Function} props.onUpdate - Callback when configuration is updated
 * @returns {JSX.Element}
 */
export const SocialMediaEditor = ({ data = {}, onUpdate }) => {
  // Create a default social media config if it doesn't exist
  const socialMedia = data.socialMedia || SOCIAL_MEDIA_LINKS.map(link => ({
    ...link,
    visible: true  // Add visibility property
  }));

  /**
   * Updates a specific social media platform's configuration
   *
   * @param {number} index - Index of the social media to update
   * @param {string} field - Field to update ('url' or 'visible')
   * @param {any} value - New value for the field
   */
  const handleSocialMediaUpdate = (index, field, value) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia[index] = {
      ...updatedSocialMedia[index],
      [field]: value
    };

    onUpdate({ socialMedia: updatedSocialMedia });
  };

  /**
   * Toggles visibility of a social media platform
   *
   * @param {number} index - Index of the social media to toggle
   */
  const toggleSocialMediaVisibility = (index) => {
    const currentVisibility = socialMedia[index].visible;
    handleSocialMediaUpdate(index, 'visible', !currentVisibility);
  };

  /**
   * Gets appropriate icon color based on visibility
   *
   * @param {boolean} isVisible - Whether the social media is visible
   * @returns {string} - CSS color value
   */
  const getIconColor = (isVisible) => {
    return isVisible ? 'var(--green-3, #34C749)' : '#6c757d';
  };

  return (
    <div className="social-media-editor">
      <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">Redes Sociales</h6>

      <div className="card bg-light border-0 p-3 mb-4">
        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="showSocialMedia"
            checked={data.showSocialMedia !== false}
            onChange={() => onUpdate({ showSocialMedia: !data.showSocialMedia })}
          />
          <label className="form-check-label" htmlFor="showSocialMedia">
            Mostrar redes sociales
          </label>
        </div>

        {data.showSocialMedia !== false && (
          <div className="social-media-list">
            <p className="mb-3 text-muted">
              Personaliza los enlaces y la visibilidad de cada red social:
            </p>

            {socialMedia.map((socialItem, index) => (
              <div key={index} className="social-media-item mb-3 p-3 bg-white rounded border">
                <div className="d-flex align-items-center mb-2">
                  <i
                    className={`bi ${socialItem.icon} me-2 fs-4`}
                    style={{ color: getIconColor(socialItem.visible) }}
                  ></i>
                  <div className="d-flex justify-content-between align-items-center flex-grow-1">
                    <span className="fw-medium">{socialItem.label}</span>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id={`visible-${index}`}
                        checked={socialItem.visible !== false}
                        onChange={() => toggleSocialMediaVisibility(index)}
                      />
                      <label className="form-check-label" htmlFor={`visible-${index}`}>
                        {socialItem.visible !== false ? "Visible" : "Oculto"}
                      </label>
                    </div>
                  </div>
                </div>

                <div className="input-group">
                  <span className="input-group-text">URL</span>
                  <input
                    type="url"
                    className="form-control"
                    placeholder={`URL de ${socialItem.label}`}
                    value={socialItem.url || ''}
                    onChange={(e) => handleSocialMediaUpdate(index, 'url', e.target.value)}
                    disabled={socialItem.visible === false}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};