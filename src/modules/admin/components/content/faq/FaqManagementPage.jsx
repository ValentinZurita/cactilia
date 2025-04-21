import React from 'react'; // Quitar useState, useEffect
import { FaqEditor } from './FaqEditor';
import { useFaqManagement } from './useFaqManagement'; // Importar el nuevo hook
// Importar Spinner si se usa
// import { Spinner } from '../../../../shared/components/spinner/Spinner.jsx';

/**
 * Página de administración para gestionar el contenido de la página de Preguntas Frecuentes (FAQ).
 * Utiliza el hook useFaqManagement para manejar la lógica y el estado.
 */
export const FaqManagementPage = () => {
  const {
    initialData,
    currentData,
    status,
    error,
    saveDraft,
    publishChanges,
    setCurrentData // Necesario para que FaqEditor actualice el estado del hook
  } = useFaqManagement();

  // Mapeo de status a isLoading para los componentes hijos
  const isLoading = status === 'saving' || status === 'publishing' || status === 'loading';

  // Renderizado condicional basado en el estado
  if (status === 'loading') {
    return <div className="container mt-4 text-center"><p>Cargando...</p></div>; // O <Spinner />
  }

  // Nota: El error se pasa ahora al FaqEditor para mostrarse allí
  // if (status === 'error') {
  //   return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  // }

  return (
    <div className="container-fluid mt-3">
      <h2 className="mb-4">Gestionar Preguntas Frecuentes (FAQ)</h2>

      {/* Renderizar el editor solo si hay datos iniciales (o un estado idle después de cargar) */}
      {(initialData || status === 'idle') && (
        <FaqEditor
          initialData={initialData} // Pasa los datos iniciales/actualizados
          // FaqEditor necesita actualizar currentData en el hook
          // Se podría hacer en onSave o en cada cambio interno de FaqEditor
          // Optamos por hacerlo en onSave/onPublish para simplificar
          onSave={async (data) => {
            setCurrentData(data); // Actualiza el estado del hook
            await saveDraft(data); // Llama a la función del hook
            // Aquí podrías añadir feedback de éxito (toast)
          }}
          onPublish={async () => {
            if (!currentData) return; // Asegurarse que hay datos actuales
            await publishChanges(currentData); // Llama a la función del hook
             // Aquí podrías añadir feedback de éxito (toast)
          }}
          isLoading={isLoading}
          error={status === 'error' ? error : null} // Pasar el error solo si el status es 'error'
        />
      )}
    </div>
  );
}; 