import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { ProductForm } from '../components/dashboard/index.js'
import placeholder from '../../../shared/assets/images/placeholder.jpg'


/**
 * ProductManagementPage
 * Handles the viewing, creation, editing, and deletion of products,
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <ProductManagementPage />
 */


export const ProductManagementPage = () => {


  // Get the mode and id from the URL
  const { mode, id } = useParams();
  const navigate = useNavigate();


  // States
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);


  // Load the products when the page loads
  useEffect(() => {
    loadProducts();
  }, []);


  // Load the product to edit if we're in 'edit' mode
  useEffect(() => {
    if (mode === "edit" && id) {
      const prod = products.find((p) => p.id === id); // Find the product to edit
      setEditingProduct(prod || null);
    } else {
      setEditingProduct(null);
    }
  }, [mode, id, products]);


  // Load the products
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

  // Handle the product saved event
  const handleProductSaved = () => {
    loadProducts(); // Reload the products
    navigate("/admin/products/view"); // Redirect to the view mode
  };

  // Handle the product delete event
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


  /*
    +---------------------------------------------+
    |                                             |
    |          Render View Mode                   |
    |                                             |
    +---------------------------------------------+
   */

  const renderViewMode = () => {
    if (loading) return <p>Cargando productos...</p>;

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover border shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <thead className="table-dark">
          <tr>
            <th className="py-3 px-2">Imagen</th>
            <th className="py-3 px-2">Nombre</th>
            <th className="py-3 px-2">Precio</th>
            <th className="py-3 px-2">Stock</th>
            <th className="py-3 px-2">Activo</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
          </thead>
          <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              {/* 🖼️ Imagen principal */}
              <td className="align-middle">
                <img
                  src={prod.mainImage || placeholder}
                  alt={prod.name}
                  className="img-thumbnail"
                  style={{
                    width: "60px",
                    height: "60px",
                    objectFit: "cover",
                  }}
                />
              </td>
              {/* 🆎 Datos del producto */}
              <td className="align-middle">{prod.name}</td>
              <td className="align-middle">${prod.price.toFixed(2)}</td>
              <td className="align-middle">{prod.stock}</td>
              <td className="align-middle">{prod.active ? "Sí" : "No"}</td>

              {/* 🛠️ Acciones */}
              <td className="align-middle">
                <button
                  className="btn btn-outline-primary btn-sm me-2"
                  onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
                  title="Editar producto"
                >
                  <i className="bi bi-pencil"></i>
                </button>

                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteProduct(prod.id)}
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    );
  };


  /*
    +---------------------------------------------+
    |                                             |
    |          Render Create Mode                 |
    |                                             |
    +---------------------------------------------+
   */

  const renderCreateMode = () => (
    <ProductForm onProductSaved={handleProductSaved} />
  );


  /*
    +---------------------------------------------+
    |                                             |
    |          Render Edit Mode                   |
    |                                             |
    +---------------------------------------------+
   */

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


  /*
    +---------------------------------------------+
    |                                             |
    |          Render Delete Mode                 |
    |                                             |
    +---------------------------------------------+
   */

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


  /*
    +---------------------------------------------+
    |                                             |
    |          RENDER THE MAIN COMPONENT          |
    |                                             |
    +---------------------------------------------+
   */

  return (
    <div>

      {/* Título */}
      <h2>Gestión de Productos</h2>

      {/* Renderizar el modo */}
      {mode === "view" && renderViewMode()}
      {mode === "create" && renderCreateMode()}
      {mode === "edit" && renderEditMode()}
      {mode === "delete" && renderDeleteMode()}

    </div>
  );
};