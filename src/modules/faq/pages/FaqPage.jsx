import React from 'react'; // Quitar useState, useEffect
import { useFaqPageData } from '../hooks/useFaqPageData'; // Importar el nuevo hook
import { FaqAccordion } from '../components/FaqAccordion'; // Importar el nuevo componente
import { Logo } from '../../../shared/components/logo/Logo'; // Importar Logo
// Importar Spinner si se usa
// import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

/**
 * Página pública que muestra las Preguntas Frecuentes (FAQ).
 * Diseño limpio y minimalista con el logo.
 */
export const FaqPage = () => {
  const { faqData, status, error, isPreview } = useFaqPageData();

  // --- Renderizado Condicional --- 

  if (status === 'loading') {
    return (
      <div className="container text-center py-5">
        {/* Considerar <Spinner /> */}
        <p>Cargando...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container text-center py-5">
        <div className="mb-4"><Logo /></div>
        <h1 className="h3 mb-3">Preguntas Frecuentes</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        <div className="alert alert-warning d-inline-block">{error || 'Ocurrió un error inesperado.'}</div>
      </div>
    );
  }

  // --- Renderizado Principal (status === 'success') --- 

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <Logo />
      </div>

      <div className="text-center mb-5">
        <h1 className="h2 mb-3">{faqData?.pageTitle || 'Preguntas Frecuentes'}</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        {faqData?.pageDescription && <p className="lead text-muted">{faqData.pageDescription}</p>}
      </div>

      {/* FaqAccordion maneja internamente el caso de items vacíos */}
      <FaqAccordion items={faqData?.faqItems} />

    </div>
  );
}; 