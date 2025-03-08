import { useState } from 'react';
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

  return (
    <div className="section-editor">
      {/* Navegación entre secciones */}
      <ul className="nav nav-tabs nav-fill">
        <li className="nav-item">
          <button
            className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}
            onClick={() => onSectionChange('hero')}
          >
            <i className="bi bi-image me-2"></i>
            Hero
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeSection === 'featuredProducts' ? 'active' : ''}`}
            onClick={() => onSectionChange('featuredProducts')}
          >
            <i className="bi bi-star me-2"></i>
            Productos
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeSection === 'farmCarousel' ? 'active' : ''}`}
            onClick={() => onSectionChange('farmCarousel')}
          >
            <i className="bi bi-images me-2"></i>
            Carrusel
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeSection === 'productCategories' ? 'active' : ''}`}
            onClick={() => onSectionChange('productCategories')}
          >
            <i className="bi bi-grid me-2"></i>
            Categorías
          </button>
        </li>
      </ul>

      {/* Editor específico de la sección */}
      <div className="section-editor-content p-4">
        {renderSectionEditor()}
      </div>
    </div>
  );
};