import HomePageEditor from './HomePageEditor.jsx'

/**
 * Página para la gestión de la página de inicio
 * Actúa como contenedor para el editor
 */
export const HomePageManagementPage = () => {
  return (
    <div className="homepage-management-container">
      <h2 className="mb-4">
        <i className="bi bi-house me-2 text-primary"></i>
        Gestión de Página de Inicio
      </h2>

      <div className="alert alert-info mb-4">
        <div className="d-flex">
          <i className="bi bi-info-circle-fill fs-4 me-3"></i>
          <div>
            <p className="mb-1">
              <strong>Personaliza tu página de inicio</strong>
            </p>
            <p className="mb-0">
              Modifica las secciones de la página según tus necesidades. Puedes cambiar los textos,
              imágenes y colores, o seleccionar una plantilla predefinida.
            </p>
          </div>
        </div>
      </div>

      <HomePageEditor />
    </div>
  );
};