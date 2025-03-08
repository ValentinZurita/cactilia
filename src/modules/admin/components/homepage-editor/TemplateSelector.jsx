import { templatesData } from './templateData.js'

/**
 * Selector de plantillas predefinidas para la página de inicio
 */
export const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div className="template-selector">
      <div className="mb-3">
        <p className="text-muted small">
          Selecciona una plantilla para tu página de inicio. Cada plantilla tiene una estructura
          predefinida que puedes personalizar.
        </p>
      </div>

      <div className="row g-3">
        {templatesData.map((template) => (
          <div key={template.id} className="col-md-6">
            <div
              className={`card template-card h-100 ${selectedTemplate === template.id ? 'border-primary' : 'border'}`}
              onClick={() => onSelectTemplate(template.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="position-relative">
                <img
                  src={template.thumbnail}
                  className="card-img-top"
                  alt={template.name}
                  style={{ height: '120px', objectFit: 'cover' }}
                />

                {/* Insignia de seleccionado */}
                {selectedTemplate === template.id && (
                  <div className="position-absolute top-0 end-0 bg-primary text-white m-2 px-2 py-1 rounded">
                    <i className="bi bi-check-circle me-1"></i>
                    Seleccionada
                  </div>
                )}
              </div>

              <div className="card-body">
                <h6 className="card-title">{template.name}</h6>
                <p className="card-text small text-muted">{template.description}</p>
              </div>

              <div className="card-footer bg-transparent border-top-0 text-end">
                <button
                  className={`btn btn-sm ${selectedTemplate === template.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template.id);
                  }}
                >
                  {selectedTemplate === template.id ? 'Seleccionada' : 'Seleccionar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};