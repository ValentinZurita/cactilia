import React from 'react'
import { CookiesPolicyEditor } from './CookiesPolicyEditor'
import { useCookiesPolicyManagement } from './useCookiesPolicyManagement'
import { AlertMessage } from '../shared/AlertMessage'
// import { Spinner } from '../../../../shared/package/spinner/Spinner.jsx';

/**
 * Page component for managing the Cookies Policy content.
 */
export const CookiesPolicyManagementPage = () => {
  const {
    pageData,
    status,
    alertInfo,
    saveDraft,
    publishChanges,
    clearAlert,
  } = useCookiesPolicyManagement()

  const isLoading = ['loading', 'saving', 'publishing'].includes(status)

  // Initial loading state (don't show editor yet)
  if (status === 'loading' && !alertInfo.show) {
    return <div className="container mt-4 text-center"><p>Cargando...</p></div>
  }

  return (
    <div className="container-fluid mt-3">
      <AlertMessage
        show={alertInfo.show}
        type={alertInfo.type}
        message={alertInfo.message}
        onClose={clearAlert}
      />

      <h2 className="mb-4">Gestionar Política de Cookies</h2>

      {/* Render editor if not in initial loading state OR if data is already available */}
      {(status !== 'loading' || pageData) && (
        <CookiesPolicyEditor
          initialData={pageData}
          onSave={saveDraft}
          onPublish={publishChanges}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}