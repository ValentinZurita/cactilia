import React, { useMemo } from 'react';
import { useCookiesPolicyPageData } from '../hooks/useCookiesPolicyPageData';
import { Logo } from '../../../shared/components/logo/Logo';
import DOMPurify from 'dompurify'; // Importar para sanitizar HTML
// import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

/**
 * Página pública que muestra la Política de Cookies.
 */
export const CookiesPolicyPage = () => {
  const { pageData, status, error, isPreview } = useCookiesPolicyPageData();

  // Sanitizar el contenido principal una vez que los datos carguen
  const sanitizedMainContent = useMemo(() => {
    // Asegurarse de que pageData y mainContent existan
    if (pageData?.mainContent) {
        // Configurar DOMPurify (opcional, puedes ajustar según necesidades)
        // Por defecto, es bastante seguro
      return DOMPurify.sanitize(pageData.mainContent);
    }
    return ''; // Devolver string vacío si no hay contenido
  }, [pageData?.mainContent]);

  // Estado de carga
  if (status === 'loading') {
    return (
      <div className="container text-center py-5">
        {/* <LoadingSpinner /> */}
        <p>Cargando...</p>
      </div>
    );
  }

  // Estado de error
  if (status === 'error') {
    return (
      <div className="container text-center py-5">
        <div className="mb-4"><Logo /></div>
        <h1 className="h3 mb-3">Política de Cookies</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        <div className="alert alert-warning d-inline-block">{error || 'Ocurrió un error inesperado.'}</div>
      </div>
    );
  }

  // Estado éxito (incluso si pageData es null o no tiene contenido, 
  // se mostrará un estado "vacío" controlado abajo)
  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <Logo />
      </div>

      <div className="text-center mb-5">
        <h1 className="h2 mb-3">{pageData?.pageTitle || 'Política de Cookies'}</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        {pageData?.pageDescription && <p className="lead text-muted">{pageData.pageDescription}</p>}
      </div>

      {/* Contenido principal sanitizado */}
      {sanitizedMainContent ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedMainContent }} />
      ) : (
        status === 'success' && <p className="text-center text-muted">El contenido de la política de cookies aún no ha sido definido.</p>
      )}
    </div>
  );
}; 