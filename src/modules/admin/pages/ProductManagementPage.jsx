
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { ProductForm } from '../components/dashboard/index.js'


/**
 * ProductManagementPage
 * Maneja la visualización, creación, edición y eliminación de productos,
 * dependiendo del modo que se obtenga de la URL (params.mode).
 */


export const ProductManagementPage = () => {

  // Obtener el modo y el id de la URL
  const { mode, id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  // Cargar los productos al cargar la página
  useEffect(() => {
    loadProducts();
  }, []);

  // Cargar el producto a editar si estamos en modo 'edit'
  useEffect(() => {
    if (mode === "edit" && id) {
      // Encontrar el producto a editar
      const prod = products.find((p) => p.id === id);
      setEditingProduct(prod || null);
    } else {
      setEditingProduct(null);
    }
  }, [mode, id, products]);

  // Cargar los productos
  const loadProducts = async () => {
    setLoading(true);
    const { ok, data, error } = await getProducts();
    if (!ok) {
      alert("Error al obtener productos: " + error);
      setLoading(false);
      return;
    }
    setProducts(data);
    setLoading(false);
  };

  const handleProductSaved = () => {
    // Al guardar o actualizar un producto recargamos la lista
    loadProducts();
    // y redirigimos al modo 'view'
    navigate("/admin/products/view");
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      const { ok, error } = await deleteProduct(productId);
      if (!ok) {
        alert("Error eliminando producto: " + error);
        return;
      }
      alert("Producto eliminado con éxito");
      loadProducts();
      navigate("/admin/products/view");
    }
  };

  // Renderiza la vista en modo 'view'
  const renderViewMode = () => {
    if (loading) return <p>Cargando productos...</p>;

    return (
      <table className="table table-striped">
        <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Precio</th>
          <th>Stock</th>
          <th>Activo</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {products.map((prod) => (
          <tr key={prod.id}>
            <td>{prod.id}</td>
            <td>{prod.name}</td>
            <td>{prod.price}</td>
            <td>{prod.stock}</td>
            <td>{prod.active ? "Sí" : "No"}</td>
            <td>
              {/* Editar => /admin/products/edit/:id */}
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
              >
                Editar
              </button>
              {/* Eliminar => /admin/products/delete/:id */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => navigate(`/admin/products/delete/${prod.id}`)}
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  };

  // Renderiza la vista en modo 'create'
  const renderCreateMode = () => (
    <ProductForm onProductSaved={handleProductSaved} />
  );

  // Renderiza la vista en modo 'edit'
  const renderEditMode = () => {
    if (!editingProduct) {
      return <p>Cargando información del producto...</p>;
    }
    return (
      <ProductForm
        editingProduct={editingProduct}
        onProductSaved={handleProductSaved}
      />
    );
  };

  // Renderiza la vista en modo 'delete'
  const renderDeleteMode = () => {
    if (!editingProduct) {
      return <p>Cargando información del producto...</p>;
    }
    return (
      <div>
        <h3>Eliminar Producto</h3>
        <p>
          ¿Estás seguro de eliminar <strong>{editingProduct.name}</strong>?
        </p>
        <button
          className="btn btn-danger"
          onClick={() => handleDeleteProduct(editingProduct.id)}
        >
          Eliminar
        </button>
      </div>
    );
  };

  return (
    <div>
      <h2>Gestión de Productos</h2>

      {mode === "view" && renderViewMode()}
      {mode === "create" && renderCreateMode()}
      {mode === "edit" && renderEditMode()}
      {mode === "delete" && renderDeleteMode()}
    </div>
  );
};