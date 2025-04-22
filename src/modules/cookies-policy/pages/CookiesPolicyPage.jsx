import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { usePageContent } from '../../../hooks/usePageContent';
import { Logo } from '../../../shared/components/logo/Logo';
import DOMPurify from 'dompurify';
import { Spinner } from '../../../shared/components/spinner/Spinner';

const COOKIES_PAGE_ID = 'cookies-policy';
const DEFAULT_COOKIES_CONTENT = {
  pageTitle: 'Política de Cookies',
  pageDescription: 'Información sobre el uso de cookies en nuestro sitio web.',
  mainContent: '',
};

/**
 * Página pública que muestra la Política de Cookies.
 * Carga contenido dinámico, gestiona SEO y sanitiza HTML.
 */
export const CookiesPolicyPage = () => {
  const { pageData, loading, error, isPreview } = usePageContent(
    COOKIES_PAGE_ID,
    DEFAULT_COOKIES_CONTENT
  );

  const sanitizedMainContent = useMemo(() => {
    if (pageData?.mainContent) {
      return DOMPurify.sanitize(pageData.mainContent);
    }
    return '';
  }, [pageData?.mainContent]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <Spinner />
      </div>
    );
  }

  const { pageTitle, pageDescription } = pageData;

  return (
    <div className="container py-5">
      {!isPreview && (
        <Helmet>
          <title>{`${pageTitle} - Cactilia`}</title>
          <meta name="description" content={pageDescription} />
        </Helmet>
      )}

      <div className="text-center mb-5">
        <Logo />
      </div>

      <div className="text-center mb-5">
        <h1 className="h2 mb-3">{pageTitle}</h1>
        {isPreview && <p className="text-warning small mb-3 fw-bold">(Modo Previsualización)</p>}
        {pageDescription && <p className="lead text-muted">{pageDescription}</p>}
        {error && <div className="alert alert-warning mt-3 d-inline-block">Error: {error}</div>}
      </div>

      {sanitizedMainContent ? (
        <div dangerouslySetInnerHTML={{ __html: sanitizedMainContent }} />
      ) : (
        !error && <p className="text-center text-muted">El contenido de la política de cookies aún no ha sido definido.</p>
      )}
    </div>
  );
}; 