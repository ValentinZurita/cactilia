/**
 * Componente de vista previa para el bloque de Texto
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.block - Datos del bloque
 * @param {boolean} [props.isPreview=true] - Si es una vista previa (escala reducida)
 * @returns {JSX.Element}
 */
export const TextBlockPreview = ({ block, isPreview = true }) => {
  // Valores por defecto
  const defaults = {
    title: 'Título de la sección',
    content: '<p>Este es un ejemplo de contenido de texto. Aquí puedes incluir información relevante para tu sitio web.</p>',
    alignment: 'center',
    showBg: false
  };

  return (
    <div className={`preview-block ${isPreview ? 'preview-scale' : ''}`}>
      <section className={`py-5 ${block.showBg ? 'bg-light' : ''}`}>
        <div className="container">
          <div className={`text-${block.alignment || defaults.alignment}`}>
            {block.title && <h2 className="mb-4">{block.title}</h2>}
            <div
              dangerouslySetInnerHTML={{
                __html: block.content || defaults.content
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};