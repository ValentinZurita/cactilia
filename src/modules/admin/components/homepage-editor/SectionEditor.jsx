import { HeroSectionEditor } from './HeroSectionEditor.jsx'
import * as PropTypes from 'prop-types'


function FeaturedProductsEditor(props) {
  return null
}

FeaturedProductsEditor.propTypes = {
  data: PropTypes.any,
  onUpdate: PropTypes.func,
}

function FarmCarouselEditor(props) {
  return null
}

FarmCarouselEditor.propTypes = {
  data: PropTypes.any,
  onUpdate: PropTypes.func,
}

function ProductCategoriesEditor(props) {
  return null
}

ProductCategoriesEditor.propTypes = {
  data: PropTypes.any,
  onUpdate: PropTypes.func,
}

/**
 * Editor de secciones de la página de inicio
 * Permite seleccionar y editar cada sección de la plantilla
 */
export const SectionEditor = ({ sections, activeSection, onSectionChange, onUpdateSection }) => {
  // Renderizar el editor correspondiente según la sección activa
  const renderSectionEditor = () => {
    const sectionData = sections[activeSection];

    if (!sectionData) {
      return <div className="p-4 text-muted">Sección no encontrada</div>;
    }

    switch (activeSection) {
      case 'hero':
        return (
          <HeroSectionEditor
            data={sectionData}
            onUpdate={(newData) => onUpdateSection('hero', newData)}
          />
        );

      case 'featuredProducts':
        return (
          <FeaturedProductsEditor
            data={sectionData}
            onUpdate={(newData) => onUpdateSection('featuredProducts', newData)}
          />
        );

      case 'farmCarousel':
        return (
          <FarmCarouselEditor
            data={sectionData}
            onUpdate={(newData) => onUpdateSection('farmCarousel', newData)}
          />
        );

      case 'productCategories':
        return (
          <ProductCategoriesEditor
            data={sectionData}
            onUpdate={(newData) => onUpdateSection('productCategories', newData)}
          />
        );

      default:
        return <div className="p-4 text-muted">Selecciona una sección para editar</div>;
    }
  };

  // Información sobre cada sección para mostrar con iconos y descripciones
  const sectionInfo = {
    'hero': {
      icon: 'bi-image',
      name: 'Hero',
      description: 'Banner principal'
    },
    'featuredProducts': {
      icon: 'bi-star',
      name: 'Productos',
      description: 'Productos destacados'
    },
    'farmCarousel': {
      icon: 'bi-images',
      name: 'Carrusel',
      description: 'Galería de imágenes'
    },
    'productCategories': {
      icon: 'bi-grid',
      name: 'Categorías',
      description: 'Categorías de productos'
    }
  };

  return (
    <div className="section-editor">
      {/* Navegación entre secciones */}
      <ul className="nav nav-pills nav-fill bg-light p-2">
        {Object.keys(sections).map(sectionKey => (
          <li className="nav-item" key={sectionKey}>
            <button
              className={`nav-link ${activeSection === sectionKey ? 'active' : ''}`}
              onClick={() => onSectionChange(sectionKey)}
            >
              <div className="d-flex flex-column align-items-center py-1">
                <i className={`bi ${sectionInfo[sectionKey]?.icon || 'bi-square'} mb-1`}></i>
                <span>{sectionInfo[sectionKey]?.name || sectionKey}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {/* Título de la sección activa */}
      <div className="bg-light p-3 border-bottom">
        <h6 className="mb-0 fw-bold d-flex align-items-center">
          <i className={`bi ${sectionInfo[activeSection]?.icon || 'bi-square'} me-2 text-primary`}></i>
          {sectionInfo[activeSection]?.name || activeSection}
          <span className="ms-2 text-muted fw-normal small">
            {sectionInfo[activeSection]?.description || ''}
          </span>
        </h6>
      </div>

      {/* Editor específico de la sección */}
      <div className="section-editor-content p-4">
        {renderSectionEditor()}
      </div>
    </div>
  );
};