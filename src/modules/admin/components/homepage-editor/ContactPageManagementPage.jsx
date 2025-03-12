// src/modules/admin/components/contact-editor/ContactPageManagementPage.jsx
import React from 'react';
import ContactPageEditor from './ContactPageEditor';

/**
 * Página para la gestión de la página de contacto
 * Contiene el editor completo para personalizar la página
 *
 * @returns {JSX.Element}
 */
export const ContactPageManagementPage = () => {
  return (
    <div className="contact-management-container py-3">
      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-2">Editor de Página de Contacto</h4>
        <p className="text-muted small d-none d-sm-block">Personaliza el contenido de tu página de contacto</p>
      </div>

      <ContactPageEditor />
    </div>
  );
};

export default ContactPageManagementPage;