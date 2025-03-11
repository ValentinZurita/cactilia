import ShopPageEditor from './ShopPageEditor.jsx'

/**
 * Página para la gestión de la página de tienda
 * Versión rediseñada con enfoque mobile-first completo
 */
export const ShopPageManagementPage = () => {
  return (
    <div className="shop-management-container py-3">
      <div className="mb-4 px-2">
        <h4 className="fw-bold mb-2">Editor de Página de Tienda</h4>
        <p className="text-muted small d-none d-sm-block">Personaliza el banner de la página de tienda</p>
      </div>

      <ShopPageEditor />
    </div>
  );
};