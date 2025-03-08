import { PageSelector } from './PageSelector.jsx'

/**
 * PageSelectorView: Renderiza el selector de páginas.
 * Aquí no hay lógica, solo un contenedor por si quisieras
 * agregar estilos extra, títulos, etc.
 */
export const PageSelectorView = ({ selectedPage, onPageChange, availablePages }) => {
  return (
    <PageSelector
      selectedPage={selectedPage}
      onPageChange={onPageChange}
      availablePages={availablePages}
    />
  );
};