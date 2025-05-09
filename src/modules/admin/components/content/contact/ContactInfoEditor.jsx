/**
 * Editor de información de contacto (teléfono, email, dirección, horario).
 *
 * @param {Object}   props
 * @param {Object}   [props.data={}]   - Datos de la sección (phone, email, address, etc.).
 * @param {Function} props.onUpdate    - Función para actualizar la configuración.
 */

export function ContactInfoEditor({ data = {}, onUpdate }) {


  // =========================================================================
  // 1. Render principal: separamos en helpers para mejorar la legibilidad
  // =========================================================================
  return (
    <div className="contact-info-editor">
      <div className="mb-4">
        {renderHeader()}
        {/* Remove direct contact field rendering */}
        {/* {renderContactFields()} */}

        {/* Add informational message */}
        <div className="alert alert-info mt-3" role="alert">
          <i className="bi bi-info-circle-fill me-2"></i>
          La información principal de contacto (teléfono, email, dirección, horario) se gestiona ahora desde la sección "Información de la Empresa" &gt; "Contacto".
        </div>

        {/* Keep options like showing social media if they exist (assuming they are part of 'data') */}
        {/* Example: renderShowSocialMediaToggle() */} 

      </div>
    </div>
  );

  // =========================================================================
  // 2. Funciones locales de render (helpers)
  // =========================================================================

  /**
   * Renderiza el encabezado (título y división de la sección).
   */
  function renderHeader() {
    return (
      <>
        <h6 className="fw-bold mb-3 border-bottom pb-2 text-primary">
          Datos de Contacto (Vista en Página Pública)
        </h6>
      </>
    );
  }

}
