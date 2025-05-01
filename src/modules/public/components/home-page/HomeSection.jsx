import React from 'react';
import { ProductsHeader } from "./ProductsHeader.jsx";

/**
 * Componente HomeSection
 *
 * Un componente de layout reutilizable y totalmente responsivo para diferentes 
 * secciones de la página de inicio. Optimizado para todos los tamaños de dispositivo.
 *
 * Características:
 * - Diseño "Mobile-first" con responsividad completa.
 * - Renderiza dinámicamente título, subtítulo y un icono opcional.
 * - Soporta espaciado vertical y altura personalizables.
 * - Estilo de fondo opcional (gris claro).
 * - Utiliza Bootstrap para el layout y la responsividad.
 *
 * Props:
 * @param {string} title - Texto del título de la sección.
 * @param {string} subtitle - Texto del subtítulo de la sección.
 * @param {string|null} icon - Nombre de clase de icono de Bootstrap (opcional).
 * @param {boolean} showBg - Si es true, aplica un fondo gris claro (`bg-light`).
 * @param {string} spacing - Controla el espaciado vertical (ej. "py-6", por defecto).
 * @param {string} height - Define la altura de la sección (ej. "auto", "min-vh-50", por defecto "auto").
 * @param {ReactNode} children - Contenido que se renderizará dentro de la sección.
 */
export const HomeSection = React.memo(({
                              title,
                              subtitle,
                              icon,
                              showBg = false,
                              spacing = "py-6",
                              height = "auto",
                              children,
                            }) => {
  // Clase de altura responsive: aplica altura mínima en pantallas grandes si se especifica,
  // de lo contrario, altura automática.
  // const heightClass = height === "auto" ? "auto" : "min-vh-50 " + height; // Variable no usada actualmente

  return (
    // Contenedor de la sección con clases responsivas
    <section
      className={`home-section ${spacing} ${showBg ? "bg-light" : ""} d-flex flex-column justify-content-center align-items-center w-100`}
      style={{ minHeight: height === "auto" ? "auto" : height }} // Aplicar minHeight si no es auto
    >
      {/* Encabezado de la sección (Icono, Título, Subtítulo) */}
      <ProductsHeader icon={icon} title={title} subtitle={subtitle} />

      {/* Contenedor del contenido principal */}
      <div className="container px-3 px-sm-4 d-flex flex-column justify-content-center">
        <div className="w-100">{children}</div>
      </div>
    </section>
  );
});

// Optional: Add display name
HomeSection.displayName = 'HomeSection';