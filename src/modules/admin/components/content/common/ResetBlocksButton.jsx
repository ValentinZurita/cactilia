import { createDefaultBlocks } from '../../../utilis/blockHelpers';

/**
 * Componente de botón para restaurar los bloques a su estado original
 * @param {Object} props - Propiedades del componente
 * @param {string} props.pageId - ID de la página actual
 * @param {Function} props.setBlocks - Función para actualizar los bloques
 * @returns {JSX.Element}
 */
export const ResetBlocksButton = ({ pageId, setBlocks }) => {

  // Función para resetear los bloques a sus valores predeterminados
  const handleResetBlocks = () => {
    // Mostrar confirmación antes de resetear
    if (window.confirm('¿Estás seguro que deseas restaurar todos los bloques a su configuración original? Esta acción no se puede deshacer.')) {
      // Obtener los bloques predeterminados para esta página
      const defaultBlocks = createDefaultBlocks(pageId);

      // Actualizar el estado con los bloques predeterminados
      setBlocks(defaultBlocks);

      // Mostrar mensaje de éxito
      alert('Los bloques han sido restaurados a su configuración original.');
    }
  };

  return (
    <button
      className="btn btn-outline-warning"
      onClick={handleResetBlocks}
      title="Restaurar a configuración original"
    >
      <i className="bi bi-arrow-counterclockwise me-2"></i>
      Restaurar Diseño Original
    </button>
  );
};