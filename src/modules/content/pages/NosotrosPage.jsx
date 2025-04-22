import React from 'react';
import { usePublicPageData } from '../hooks/usePublicPageData';
import { Logo } from '../../../shared/components/logo/Logo';
import { Spinner } from '../../../shared/components/spinner/Spinner'; // Asumiendo un Spinner genérico

/**
 * Página pública "Nosotros".
 * Carga y muestra el contenido gestionado desde el admin.
 */
export const NosotrosPage = () => {
  const { pageData, status, error, isPreview } = usePublicPageData('nosotros');

  // --- Renderizado Condicional --- 

  if (status === 'loading') {
    return (
      <div className="container text-center py-5">
        <Spinner />
        <p className="mt-2">Cargando...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container text-center py-5">
        <div className="mb-4"><Logo /></div>
        <h1 className="h3 mb-3">Nosotros</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        <div className="alert alert-warning d-inline-block">
          {error || 'Ocurrió un error inesperado al cargar la página.'}
        </div>
      </div>
    );
  }

  // --- Renderizado Principal (status === 'success') --- 

  // Contenido principal como texto plano por seguridad inicial
  // Si se usa un RTE en el admin que genera HTML seguro, se podría usar
  // dangerouslySetInnerHTML={{ __html: pageData?.mainContent }} 
  // ¡PERO SOLO SI EL HTML ES SANITIZADO O CONFIABLE!
  const renderMainContent = () => {
      // Dividir por saltos de línea y renderizar como párrafos
      const paragraphs = pageData?.mainContent?.split('\n').filter(p => p.trim() !== '');
      if (!paragraphs || paragraphs.length === 0) {
          return <p className="text-muted">Contenido no disponible.</p>;
      }
      return paragraphs.map((p, index) => <p key={index}>{p}</p>);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <Logo />
      </div>

      <div className="text-center mb-5">
        <h1 className="h2 mb-3">{pageData?.pageTitle || 'Nosotros'}</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        {pageData?.pageDescription && 
          <p className="lead text-muted">{pageData.pageDescription}</p>
        }
      </div>

      {/* Área de Contenido Principal */}
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-7">
          {renderMainContent()}
        </div>
      </div>
      
    </div>
  );
}; 