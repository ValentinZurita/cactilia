import React from 'react';
import { FaqEditor } from './FaqEditor';
import { useFaqManagement } from './useFaqManagement';
import { AlertMessage } from '../shared/AlertMessage';

/**
 * Página de administración para gestionar el contenido de la página de Preguntas Frecuentes (FAQ).
 * Utiliza el hook useFaqManagement para manejar la lógica y el estado.
 */
export const FaqManagementPage = () => {
  const {
    initialData,
    currentData,
    status,
    alertInfo,
    saveDraft,
    publishChanges,
    setCurrentData,
    clearAlert
  } = useFaqManagement();

  const isLoading = ['loading', 'saving', 'publishing'].includes(status);

  // Renderizado de estado de carga inicial
  if (status === 'loading' && !alertInfo.show) {
    // TODO: Considerar reemplazar esto con un componente Spinner reutilizable
    return <div className="container mt-4 text-center"><p>Cargando...</p></div>; 
  }

  return (
    <div className="container-fluid mt-3">
      <AlertMessage
        show={alertInfo.show}
        type={alertInfo.type}
        message={alertInfo.message}
        onClose={clearAlert}
      />

      <h2 className="mb-4">Gestionar Preguntas Frecuentes (FAQ)</h2>

      {/* Renderizar editor solo cuando no esté en estado inicial de carga O si hay datos */}
      {(status !== 'loading' || initialData) && (
        <FaqEditor
          initialData={initialData}
          onSave={async (data) => {
            setCurrentData(data); // Actualizar estado del hook con los datos del editor
            await saveDraft(data);
          }}
          onPublish={async () => {
            // Asegurarse de que currentData existe antes de publicar
            if (!currentData) return; 
            await publishChanges(currentData);
          }}
          isLoading={isLoading}
          // Pasar el mensaje de error del hook al editor
          error={status === 'error' ? alertInfo.message : null} 
        />
      )}
    </div>
  );
}; 