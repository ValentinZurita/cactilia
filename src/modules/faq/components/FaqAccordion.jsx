import React from 'react';

/**
 * Componente que renderiza la estructura de acordeón de Bootstrap
 * para una lista de items de FAQ (estilo minimalista por defecto).
 *
 * @param {object} props
 * @param {Array<object>} props.items - Array de objetos FAQ, cada uno con { id, question, answer, order? }.
 * @returns {JSX.Element | null} El acordeón renderizado o null si no hay items.
 */
export const FaqAccordion = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-center text-muted">No hay preguntas frecuentes disponibles.</p>; // Mensaje si está vacío
  }

  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    // Usar el acordeón por defecto sin clases extra como mb-2
    <div className="accordion" id="faqAccordion">
      {sortedItems.map((item, index) => {
        const isCollapsed = index !== 0;
        const collapseId = `collapse-${item.id || index}`;
        const headingId = `heading-${item.id || index}`;

        return (
          <div className="accordion-item" key={item.id || index}> 
            <h2 className="accordion-header" id={headingId}>
              <button
                // Clases mínimas para el botón de acordeón
                className={`accordion-button ${isCollapsed ? 'collapsed' : ''}`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${collapseId}`}
                aria-expanded={!isCollapsed}
                aria-controls={collapseId}
              >
                {/* Sin fw-semibold ni iconos extra */}
                {item.question}
              </button>
            </h2>
            <div
              id={collapseId}
              className={`accordion-collapse collapse ${!isCollapsed ? 'show' : ''}`}
              aria-labelledby={headingId}
              data-bs-parent="#faqAccordion"
            >
              {/* Padding por defecto de accordion-body */}
              <div className="accordion-body">
                {item.answer}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}; 