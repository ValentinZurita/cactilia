/**
 * Selector de página a editar
 * @param {Object} props - Propiedades del componente
 * @param {string} props.selectedPage - ID de la página seleccionada
 * @param {Function} props.onPageChange - Función para cambiar de página
 * @param {Array} [props.availablePages] - Páginas disponibles
 * @returns {JSX.Element}
 */
export const PageSelector = ({ selectedPage, onPageChange, availablePages = [] }) => {

  // Páginas disponibles por defecto
  const defaultPages = [
    { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
    { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
    { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
  ];

  // Usar páginas proporcionadas o las predeterminadas
  const pagesToRender = availablePages.length > 0 ? availablePages : defaultPages;


  return (
    <div className="page-selector mb-4">

      {/* Selector de página con botones */}
      <div className="btn-group" role="group">

        {/* Botones para cada página */}
        {pagesToRender.map((page) => (

          <button
            key={page.id}
            type="button"
            className={`btn ${selectedPage === page.id ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => onPageChange(page.id)}
          >

            {/* Icono y nombre de la página */}
            <i className={`${page.icon} me-2`}></i>
            {page.name}
          </button>

        ))}
      </div>
    </div>
  );
};