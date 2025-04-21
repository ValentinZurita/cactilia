import React from 'react'; // Quitar useState, useEffect
import { useFaqPageData } from '../hooks/useFaqPageData'; // Importar el nuevo hook
import { FaqAccordion } from '../components/FaqAccordion'; // Importar el nuevo componente
// Importar Spinner si se usa
// import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

/**
 * Página pública que muestra las Preguntas Frecuentes (FAQ).
 * Utiliza el hook useFaqPageData para obtener los datos y el estado.
 * Renderiza el componente FaqAccordion para mostrar los items.
 */
export const FaqPage = () => {
  const { faqData, status, error, isPreview } = useFaqPageData();

  // Estado de carga
  if (status === 'loading') {
    // return <LoadingSpinner />;
    return <div className="container mt-5 text-center"><p>Cargando...</p></div>;
  }

  // Estado de error (incluye no encontrar datos)
  if (status === 'error') {
    return (
      <div className="container mt-5">
        {/* Mostrar un título genérico si falla la carga completa */}
        <h1 className="display-5 mb-3 text-center">Preguntas Frecuentes</h1>
        {isPreview && <p className="text-center text-warning small mb-3">Modo Previsualización (Borrador)</p>}
        <div className="alert alert-warning">{error || 'Ocurrió un error inesperado.'}</div>
      </div>
    );
  }

  // Estado éxito, pero sin datos o sin items (esto no debería pasar si el status es 'success' 
  // gracias a la lógica del hook, pero por seguridad se puede mantener)
  if (status === 'success' && (!faqData || !faqData.faqItems || faqData.faqItems.length === 0)) {
    return (
      <div className="container mt-5">
        <h1 className="display-5 mb-3 text-center">{faqData?.pageTitle || 'Preguntas Frecuentes'}</h1>
        {isPreview && <p className="text-center text-warning small mb-3">Modo Previsualización (Borrador)</p>}
        {faqData?.pageDescription && <p className="lead mb-4 text-center">{faqData.pageDescription}</p>}
        <p className="text-center text-muted">No hay preguntas frecuentes disponibles en este momento.</p>
      </div>
    );
  }
  
  // Estado éxito con datos
  return (
    <div className="container mt-5 mb-5">
      <h1 className="display-5 mb-3 text-center">{faqData.pageTitle}</h1>
      {isPreview && <p className="text-center text-warning small mb-3">Modo Previsualización (Borrador)</p>}
      {faqData.pageDescription && <p className="lead mb-5 text-center">{faqData.pageDescription}</p>}

      <FaqAccordion items={faqData.faqItems} />
      
    </div>
  );
}; 