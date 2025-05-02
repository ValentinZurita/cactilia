// src/modules/admin/package/content/FeaturedProductsEditor.jsx

/**
 * Editor para la sección de Productos Destacados
 * Versión actualizada con toggles unificados
 */
export const FeaturedProductsEditor = ({ data = {}, onUpdate }) => {
  // Manejador para cambios en campos de texto
  const handleChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  // Manejador para cambios en campos booleanos (toggles)
  const handleToggleChange = (field) => {
    onUpdate({ [field]: !data[field] })
  }

  return (
    <div className="featured-products-editor">
      <div className="mb-4">
        <h6 className="fw-bold mb-3">Contenido Principal</h6>

        {/* Título */}
        <div className="mb-3">
          <label htmlFor="featuredTitle" className="form-label">Título</label>
          <input
            type="text"
            className="form-control"
            id="featuredTitle"
            value={data.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Productos Destacados"
          />
        </div>

        {/* Subtítulo */}
        <div className="mb-3">
          <label htmlFor="featuredSubtitle" className="form-label">Subtítulo</label>
          <input
            type="text"
            className="form-control"
            id="featuredSubtitle"
            value={data.subtitle || ''}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="Ej: Explora nuestra selección especial"
          />
        </div>

        {/* Número Máximo de Productos */}
        <div className="mb-3">
          <label htmlFor="featuredMaxItems" className="form-label">Número Máximo de Productos</label>
          <input
            type="number"
            className="form-control"
            id="featuredMaxItems"
            value={data.maxItems ?? ''} // Usar string vacío si es null/undefined
            onChange={(e) => {
              const value = e.target.value
              // Permitir campo vacío (se interpretará como sin límite o usará default)
              const numValue = value === '' ? null : parseInt(value, 10)
              // Actualizar solo si es un número válido o null
              if (!isNaN(numValue) || numValue === null) {
                // Asegurarse de que no sea negativo si se introduce manualmente
                const finalValue = (numValue !== null && numValue < 1) ? 1 : numValue
                handleChange('maxItems', finalValue)
              }
            }}
            placeholder="Ej: 10 (vacío usa el valor por defecto)"
            min="1" // El input HTML permite valores negativos, el onChange lo corrige a 1
          />
          <div className="form-text">
            Define cuántos productos destacados se mostrarán como máximo en el carrusel (mínimo 1).
          </div>
        </div>

        {/* Icono */}
        <div className="mb-3">
          <label htmlFor="featuredIcon" className="form-label">Icono</label>
          <div className="input-group">
            <span className="input-group-text">
              <i className={`bi ${data.icon || 'bi-star-fill'}`}></i>
            </span>
            <input
              type="text"
              className="form-control"
              id="featuredIcon"
              value={data.icon || 'bi-star-fill'}
              onChange={(e) => handleChange('icon', e.target.value)}
              placeholder="Ej: bi-star-fill"
            />
          </div>
          <div className="form-text">
            Usa clases de <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">Bootstrap
            Icons</a>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold mb-3">Apariencia</h6>

        {/* Fondo - Ahora con toggle en lugar de checkbox */}
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="featuredShowBg"
            checked={data.showBg === true}
            onChange={() => handleToggleChange('showBg')}
          />
          <label className="form-check-label" htmlFor="featuredShowBg">
            Mostrar fondo claro
          </label>
        </div>
      </div>
    </div>
  )
}