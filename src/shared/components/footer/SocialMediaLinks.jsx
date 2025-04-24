import React, { useState, useEffect } from 'react';
// Remove static import
// import { SOCIAL_MEDIA_LINKS } from '../../constants/index.js';
// Import Firestore service function
import { getSocialMediaLinks } from '../../../services/firebase/firestoreService'; 

export const SocialMediaLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      const linksFromDb = await getSocialMediaLinks();
      // Filter for visible links before setting state
      const visibleLinks = linksFromDb.filter(link => link.visible !== false);
      setSocialLinks(visibleLinks);
      setLoading(false);
    };

    fetchLinks();
  }, []);

  // Optional: Show a loading state or nothing while fetching
  if (loading) {
    // Simple loading indicator or return null
    return (
        <div className="col d-flex flex-column align-items-md-start align-items-start">
            <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>
            <div className="d-flex align-items-start" style={{ height: '2.5rem'}}> {/* Placeholder height */} 
                <span className="spinner-border spinner-border-sm text-white-50" role="status" aria-hidden="true"></span>
            </div>
        </div>
    );
  }
  
  // Don't render the section if there are no visible links
  if (socialLinks.length === 0) {
      return null; 
  }

  return (
    <div className="col d-flex flex-column align-items-md-start align-items-start">
      <h5 className="text-uppercase fw-bold text-start">Síguenos</h5>
      <div className="d-flex align-items-start">
        {/* Map over the state variable fetched from Firestore */}
        {socialLinks.map((social) => (
          // Use social.id as key if available and unique, otherwise index is fallback
          <a key={social.id || social.url} href={social.url} className="text-white mx-2" target="_blank" rel="noopener noreferrer">
            <i className={`bi ${social.icon} fs-3`}></i>
          </a>
        ))}
      </div>
    </div>
  );
};