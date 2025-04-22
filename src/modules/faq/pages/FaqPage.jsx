import React from 'react'; 
import { Helmet } from 'react-helmet-async'; // 1. Importar Helmet
// import { useFaqPageData } from '../hooks/useFaqPageData'; // Ya no se usa
import { usePageContent } from '../../../hooks/usePageContent'; // 2. Importar el hook genérico
import { FaqAccordion } from '../components/FaqAccordion';
import { Logo } from '../../../shared/components/logo/Logo';
// Asumiendo que tienes un Spinner reutilizable
import { Spinner } from '../../../shared/components/spinner/Spinner'; 

// 3. Definir el ID y contenido por defecto para esta página
const FAQ_PAGE_ID = 'faq'; 
const DEFAULT_FAQ_CONTENT = {
  pageTitle: 'Preguntas Frecuentes',
  pageDescription: 'Encuentra respuestas a las preguntas más comunes sobre nuestros productos y servicios.',
  faqItems: [],
};

/**
 * Página pública que muestra las Preguntas Frecuentes (FAQ).
 * Carga contenido dinámico y gestiona el SEO con Helmet.
 */
export const FaqPage = () => {
  // 4. Usar el hook usePageContent - UNA SOLA VEZ
  const { pageData, loading, error, isPreview } = usePageContent(FAQ_PAGE_ID, DEFAULT_FAQ_CONTENT);

  // --- Renderizado Condicional --- 

  if (loading) {
    return (
      <div className="container text-center py-5">
        <Spinner /> {/* Usar Spinner */} 
      </div>
    );
  }

  // Nota: pageData siempre tendrá un valor (los datos reales o los por defecto) 
  // gracias a la lógica del hook, incluso si hay error.

  // 5. Extraer datos (ya sea los cargados o los por defecto)
  // pageData y isPreview ya están disponibles desde la llamada única al hook
  const { pageTitle, pageDescription, faqItems } = pageData;

  return (
    <div className="container py-5">
      {/* 6. Añadir Helmet para SEO (Condicionalmente, si no es preview) */}
      {!isPreview && (
        <Helmet>
          <title>{`${pageTitle} - Cactilia` /* Ajusta "Cactilia" al nombre de tu sitio */}</title>
          <meta name="description" content={pageDescription} />
          {/* Puedes añadir más meta tags aquí si es necesario */} 
        </Helmet>
      )}

      <div className="text-center mb-5">
        <Logo />
      </div>

      <div className="text-center mb-5">
        {/* Usar los datos extraídos */} 
        <h1 className="h2 mb-3">{pageTitle}</h1>
        {/* ---> Mostrar indicador si isPreview es true <--- */} 
        {isPreview && <p className="text-warning small mb-3 fw-bold">(Modo Previsualización)</p>}
        {pageDescription && <p className="lead text-muted">{pageDescription}</p>}
        {error && <div className="alert alert-warning mt-3 d-inline-block">Error: {error}</div>} {/* Mostrar error si existe */} 
      </div>

      {/* Pasar los items al componente Accordion */} 
      <FaqAccordion items={faqItems} />

    </div>
  );
}; 