import '../../../../styles/pages/userProfile.css';

/**
 * ProfileCard - Componente de tarjeta para secciones del perfil
 * Con estilo mejorado y opción para habilitar/deshabilitar hover
 *
 * @param {Object} props - Propiedades del componente
 * @param {ReactNode} props.children - Contenido de la tarjeta
 * @param {string} props.title - Título de la tarjeta (opcional)
 * @param {string} props.className - Clases adicionales (opcional)
 * @param {boolean} props.clickable - Si la tarjeta debe tener efecto hover (opcional)
 */
export const ProfileCard = ({ children, title, className = '', clickable = false }) => {
  return (

    <div className={`profile-card ${clickable ? 'clickable' : ''} ${className}`}>

      {/** Si hay un título, mostrarlo */}
      {title && (
        <div className="card-header">
          <h6 className="mb-0">{title}</h6>
        </div>
      )}

      {/** Contenido de la tarjeta */}
      <div className="card-body">
        {children}
      </div>

    </div>
  );
};