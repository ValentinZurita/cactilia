import React from 'react'
import { useGenericContentManagement } from './useGenericContentManagement'
import { GenericContentEditor } from './GenericContentEditor'
import { AlertMessage } from './AlertMessage'
// Importar aquí un Spinner si se tiene uno genérico
// import { Spinner } from '../../../../shared/package/spinner/Spinner';

/**
 * Página genérica de administración para gestionar contenido estático simple.
 *
 * @param {object} props
 * @param {string} props.pageId - ID único de la página a gestionar (ej: 'cookies-policy').
 * @param {string} props.pageTitleAdmin - Título a mostrar en la cabecera de la página de admin.
 * @param {object} [props.defaultContent={}] - Contenido por defecto si la página no existe.
 * @param {string} [props.contentLabel] - Etiqueta opcional para el campo de contenido principal.
 * @param {string} [props.contentPlaceholder] - Placeholder opcional para el campo de contenido principal.
 */
export const GenericContentPage = ({
                                     pageId,
                                     pageTitleAdmin,
                                     defaultContent = {},
                                     contentLabel, // Pasar estas props al editor si se proporcionan
                                     contentPlaceholder,
                                   }) => {
  const {
    pageData, // Este es el estado que maneja el hook
    status,
    alertInfo,
    saveDraft,
    publishChanges,
    setPageData, // Para que el editor notifique cambios al hook
    clearAlert,
  } = useGenericContentManagement(pageId, defaultContent)

  const isLoading = ['loading', 'saving', 'publishing'].includes(status)

  // Estado de carga inicial (mientras pageData es null y no hay error)
  if (status === 'loading' && !alertInfo.show) {
    // TODO: Reemplazar con un componente Spinner estándar
    return <div className="container mt-4 text-center"><p>Cargando...</p></div>
  }

  return (
    <div className="container-fluid mt-3">
      {/* Mostrar Alertas */}
      <AlertMessage
        show={alertInfo.show}
        type={alertInfo.type}
        message={alertInfo.message}
        onClose={clearAlert}
      />

      {/* Título de la Página de Administración */}
      <h2 className="mb-4">{pageTitleAdmin || `Gestionar Contenido: ${pageId}`}</h2>

      {/* Renderizar Editor Genérico si no está en carga inicial O si ya hay datos */}
      {/* (pageData puede tener los valores por defecto si la carga inicial no encontró nada) */}
      {(status !== 'loading' || pageData) && (
        <GenericContentEditor
          pageId={pageId} // Pasar pageId para la URL de previsualización
          initialData={pageData} // Los datos cargados o por defecto del hook
          onSave={saveDraft} // Pasar la función de guardar del hook
          onPublish={publishChanges} // Pasar la función de publicar del hook
          isLoading={isLoading} // Pasar el estado de carga
          onDataChange={setPageData} // Pasar el setter para que el editor actualice el hook
          contentLabel={contentLabel} // Pasar props opcionales de personalización
          contentPlaceholder={contentPlaceholder}
        />
      )}
    </div>
  )
}