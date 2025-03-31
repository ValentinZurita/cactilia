/**
 * Componente base para secciones en la página de checkout
 * Proporciona estructura y estilos consistentes para cada sección
 *
 * @param {Object} props - Props del componente
 * @param {string} props.title - Título de la sección
 * @param {number} props.stepNumber - Número de paso (1-4)
 * @param {React.ReactNode} props.children - Contenido de la sección
 * @returns {JSX.Element} Sección de checkout formateada
 */
export const CheckoutSection = ({ title, stepNumber, children }) => {
  return (
    <div className="checkout-section mb-4">
      <div className="section-header d-flex align-items-center mb-3">
        {stepNumber && (
          <div className="step-number me-3">
            {stepNumber}
          </div>
        )}
        <h3 className="section-title mb-0">{title}</h3>
      </div>

      <div className="section-content">
        {children}
      </div>
    </div>
  );
};