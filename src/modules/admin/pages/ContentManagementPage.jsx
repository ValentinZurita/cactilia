import React, { useState } from 'react';
import { PageContentManager } from '../components/content/PageContentManager';

/**
 * Página de gestión de contenido
 * Permite configurar el contenido de las diferentes páginas del sitio
 *
 * @returns {JSX.Element}
 */
export const ContentManagementPage = () => {
  // Estado para la página seleccionada
  const [selectedPage, setSelectedPage] = useState('home');

  // Lista de páginas disponibles
  const availablePages = [
    { id: 'home', name: 'Página Principal', icon: 'bi-house-door' },
    { id: 'about', name: 'Acerca de Nosotros', icon: 'bi-info-circle' },
    { id: 'contact', name: 'Contacto', icon: 'bi-envelope' },
  ];

  return (
    <div className="content-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Gestión de Contenido</h2>

        {/* Selector de página */}
        <div className="page-selector">
          <div className="btn-group" role="group">
            {availablePages.map((page) => (
              <button
                key={page.id}
                type="button"
                className={`btn ${selectedPage === page.id ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setSelectedPage(page.id)}
              >
                <i className={`${page.icon} me-2`}></i>
                {page.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explicación */}
      <div className="alert alert-info mb-4">
        <div className="d-flex">
          <div className="me-3">
            <i className="bi bi-info-circle-fill fs-3"></i>
          </div>
          <div>
            <h5>Gestión de Contenido</h5>
            <p className="mb-0">
              Aquí puedes gestionar el contenido de las páginas del sitio.
              Arrastra los bloques para cambiar su orden, edita sus propiedades o añade nuevos bloques.
              Recuerda guardar los cambios antes de salir.
            </p>
          </div>
        </div>
      </div>

      {/* Gestor de contenido para la página seleccionada */}
      <PageContentManager pageId={selectedPage} />
    </div>
  );
};