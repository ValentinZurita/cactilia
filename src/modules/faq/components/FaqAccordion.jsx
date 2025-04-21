import React from 'react';

/**
 * Componente que renderiza la estructura de acordeón de Bootstrap
 * para una lista de items de FAQ.
 *
 * @param {object} props
 * @param {Array<object>} props.items - Array de objetos FAQ, cada uno con { id, question, answer, order? }.
 * @returns {JSX.Element | null} El acordeón renderizado o null si no hay items.
 */
export const FaqAccordion = ({ items }) => {
  if (!items || items.length === 0) {
    return null; // O un mensaje indicando que no hay items
  }

  // Ordenar items si tienen la propiedad 'order'
  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="accordion" id="faqAccordion">
      {sortedItems.map((item, index) => {
        const isCollapsed = index !== 0; // Asume que el primero está abierto
        const collapseId = `collapse-${item.id || index}`;
        const headingId = `heading-${item.id || index}`;

        return (
          <div className="accordion-item mb-2" key={item.id || index}>
            <h2 className="accordion-header" id={headingId}>
              <button
                className={`accordion-button d-flex justify-content-between ${isCollapsed ? 'collapsed' : ''}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${collapseId}`}
                aria-expanded={!isCollapsed}
                aria-controls={collapseId}
              >
                <span className="fw-semibold me-3">{item.question}</span>
                <i className={`bi ${isCollapsed ? 'bi-plus-circle' : 'bi-dash-circle'}`}></i>
              </button>
            </h2>
            <div
              id={collapseId}
              className={`accordion-collapse collapse ${!isCollapsed ? 'show' : ''}`}
              aria-labelledby={headingId}
              data-bs-parent="#faqAccordion"
            >
              <div className="accordion-body p-3">
                {/* Considerar sanitizar si la respuesta puede contener HTML */} 
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 