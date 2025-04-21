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

  // Estado de carga
  if (status === 'loading') {
    // return <LoadingSpinner />;
    return (
      <div className="container text-center py-5">
        <p>Cargando...</p>
      </div>
    );
  }

  // Estado de error (incluye no encontrar datos)
  if (status === 'error') {
    return (
      <div className="container text-center py-5">
        <div className="mb-4"><Logo /></div> {/* Mostrar logo incluso en error */}
        <h1 className="h3 mb-3">Preguntas Frecuentes</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        <div className="alert alert-warning d-inline-block">{error || 'Ocurrió un error inesperado.'}</div>
      </div>
    );
  }

  // Estado éxito, pero sin datos o sin items (esto no debería pasar si el status es 'success' 
  // gracias a la lógica del hook, pero por seguridad se puede mantener)
  if (status === 'success' && (!faqData || !faqData.faqItems || faqData.faqItems.length === 0)) {
    return (
      <div className="container text-center py-5">
        <div className="mb-4"><Logo /></div> {/* Mostrar logo incluso en caso de error */}
        <h1 className="h3 mb-3">Preguntas Frecuentes</h1>
        {isPreview && <p className="text-warning small mb-3">(Modo Previsualización)</p>}
        <div className="alert alert-warning d-inline-block">No hay preguntas frecuentes disponibles en este momento.</div>
      </div>
    );
  }
  
  // Estado éxito con datos
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

      <FaqAccordion items={faqData?.faqItems} />
    </div>
  );
}; 