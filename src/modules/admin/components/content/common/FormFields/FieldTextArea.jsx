
/**
 * Campo de texto multilínea
 * @param {Object} props - Propiedades del componente
 * @param {string} props.name - Nombre del campo
 * @param {string} props.label - Etiqueta del campo
 * @param {string} props.value - Valor del campo
 * @param {Function} props.onChange - Función a llamar cuando cambia el valor
 * @param {string} [props.placeholder] - Texto de placeholder
 * @param {number} [props.rows=4] - Número de filas visibles
 * @param {boolean} [props.required] - Si el campo es obligatorio
 * @param {string} [props.help] - Texto de ayuda
 * @param {boolean} [props.htmlEditor] - Si debe mostrar un editor HTML básico
 * @returns {JSX.Element}
 */
export const FieldTextarea = ({
                                name,
                                label,
                                value = '',
                                onChange,
                                placeholder = '',
                                rows = 4,
                                required = false,
                                help = '',
                                htmlEditor = false,
                                disabled = false
                              }) => {
  // Botones para editor HTML básico
  const htmlButtons = [
    { icon: 'type-bold', tag: '<strong>|</strong>', title: 'Negrita' },
    { icon: 'type-italic', tag: '<em>|</em>', title: 'Cursiva' },
    { icon: 'type-underline', tag: '<u>|</u>', title: 'Subrayado' },
    { icon: 'link', tag: '<a href="#">|</a>', title: 'Enlace' },
    { icon: 'list-ul', tag: '<ul>\n  <li>|</li>\n</ul>', title: 'Lista' },
    { icon: 'paragraph', tag: '<p>|</p>', title: 'Párrafo' },
    { icon: 'type-h2', tag: '<h2>|</h2>', title: 'Título H2' }
  ];

  // Manejar inserción de etiquetas HTML
  const handleInsertTag = (tag) => {
    // Obtener el textarea
    const textarea = document.getElementById(name);
    if (!textarea) return;

    // Guardar posición del cursor
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Texto seleccionado
    const selectedText = value.substring(start, end);

    // Insertar etiqueta con el texto seleccionado
    const tagWithText = tag.replace('|', selectedText || '');

    // Nuevo valor
    const newValue = value.substring(0, start) + tagWithText + value.substring(end);

    // Actualizar valor
    onChange(newValue);

    // Establecer foco después de insertar
    setTimeout(() => {
      textarea.focus();

      // Calcular nueva posición del cursor
      const cursorPosition = selectedText
        ? start + tagWithText.indexOf(selectedText) + selectedText.length
        : start + tagWithText.indexOf('|');

      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 10);
  };

  return (
    <div className="mb-3">
      <label htmlFor={name} className="form-label">
        {label}
        {required && <span className="text-danger ms-1">*</span>}
      </label>

      {/* Barra de herramientas HTML si está habilitado */}
      {htmlEditor && (
        <div className="html-toolbar btn-toolbar mb-1 bg-light rounded p-1">
          {htmlButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => handleInsertTag(button.tag)}
              title={button.title}
              disabled={disabled}
            >
              <i className={`bi bi-${button.icon}`}></i>
            </button>
          ))}
        </div>
      )}

      <textarea
        id={name}
        name={name}
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || label}
        rows={rows}
        disabled={disabled}
      ></textarea>

      {help && <div className="form-text text-muted small">{help}</div>}

      {/* Vista previa HTML si está habilitado */}
      {htmlEditor && value && (
        <div className="mt-2">
          <label className="form-label small text-muted">Vista previa:</label>
          <div
            className="border rounded p-2 bg-white overflow-auto"
            style={{ maxHeight: '150px' }}
            dangerouslySetInnerHTML={{ __html: value }}
          ></div>
        </div>
      )}
    </div>
  );
};