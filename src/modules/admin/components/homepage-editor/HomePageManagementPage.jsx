import HomePageEditor from './HomePageEditor.jsx'

/**
 * Página para la gestión de la página de inicio
 * Actúa como contenedor para el editor
 */
export const HomePageManagementPage = () => {
  return (
    <div className="homepage-management-container">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
          <i className="bi bi-house-gear fs-3 text-primary"></i>
        </div>
        <div>
          <h2 className="mb-0 fw-bold">Editor de Página de Inicio</h2>
          <p className="text-muted mb-0">Personaliza cada sección de tu página principal</p>
        </div>
      </div>

      <div className="alert alert-info d-flex mb-4">
        <i className="bi bi-info-circle-fill fs-4 me-3 text-primary"></i>
        <div>
          <p className="mb-1">
            <strong>Instrucciones de uso</strong>
          </p>
          <p className="mb-0">
            Selecciona cada sección para personalizar su contenido, imágenes y opciones de visualización.
            Los cambios se muestran en tiempo real en la vista previa, pero no se aplicarán hasta que hagas clic en "Guardar cambios".
          </p>
        </div>
      </div>

      <HomePageEditor />
    </div>
  );
};