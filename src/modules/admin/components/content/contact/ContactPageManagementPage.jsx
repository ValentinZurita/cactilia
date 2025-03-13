// src/modules/admin/components/contact-editor/ContactPageManagementPage.jsx
import React from 'react';
import ContactPageEditor from './ContactPageEditor.jsx';

/**
 * Contact Page Management Page
 * A container component for the contact page editor
 *
 * This component serves as the page-level wrapper for the
 * contact page editor, providing the layout and contextual information
 *
 * @returns {JSX.Element}
 */
const ContactPageManagementPage = () => {
  return (
    <div className="contact-management-container py-3">
      {/* Header with title and description */}
      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-2">Editor de Página de Contacto</h4>
        <p className="text-muted small d-none d-sm-block">
          Personaliza la información y elementos de tu página de contacto
        </p>
      </div>

      {/* The main editor component */}
      <ContactPageEditor />
    </div>
  );
};

export default ContactPageManagementPage;