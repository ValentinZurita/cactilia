import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../services/productService";
import { ProductForm } from '../components/dashboard/index.js'
import placeholder from '../../../shared/assets/images/placeholder.jpg'
import { TableView } from '../components/dashboard/TableView.jsx'
import { SearchBar } from '../components/shared/SearchBar.jsx'



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
  const [searchTerm, setSearchTerm] = useState("");


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

  // Handle product edit button click
  const handleEditProduct = (productId) => {
    navigate(`/admin/products/edit/${productId}`);
  };

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
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

    // Filtrar productos según el término de búsqueda
    const filteredProducts = products.filter((prod) =>
      prod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Definir columnas para la tabla
    const columns = [
      {
        header: "Imagen",
        accessor: "mainImage",
        cell: (row) => (
          <div className="product-image-cell">
            <img
              src={row.mainImage || placeholder}
              alt={row.name}
              className="img-thumbnail"
              style={{ width: "60px", height: "60px", objectFit: "cover" }}
            />
          </div>
        ),
      },
      {
        header: "Nombre",
        accessor: "name",
      },
      {
        header: "Categoría",
        accessor: "category",
      },
      {
        header: "Precio",
        accessor: "price",
        cell: (row) => `$${parseFloat(row.price).toFixed(2)}`,
      },
      {
        header: "Stock",
        accessor: "stock",
      },
      {
        header: "Regla de envío",
        accessor: "shippingRuleInfo",
        cell: (row) => {
          if (!row.shippingRuleId) return (
            <span className="text-muted small">No asignada</span>
          );
          
          if (row.shippingRuleInfo) {
            const isActive = row.shippingRuleInfo.active;
            return (
              <span className={`badge ${isActive ? 'bg-success' : 'bg-secondary'} bg-opacity-15 
                             ${isActive ? 'text-success' : 'text-secondary'} px-2 py-1 rounded-pill`}>
                {row.shippingRuleInfo.name}
              </span>
            );
          }
          
          return (
            <span className="text-warning small">Regla no encontrada</span>
          );
        }
      },
      {
        header: "Estado",
        accessor: "active",
        cell: (row) => (
          <span className={`badge ${row.active ? 'bg-success' : 'bg-secondary'} py-2 px-3 rounded-pill`}>
            {row.active ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        header: "Acciones",
        accessor: "actions",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleEditProduct(row.id)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteProduct(row.id)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
        ),
      },
    ];

    // Renderizar barra de búsqueda y tabla
    return (
      <div className="mb-4">
        {/* Barra de búsqueda refactorizada */}
        <div className="mb-4">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Buscar productos por nombre..."
            size="lg"
          />
        </div>

        {/* Tabla de productos */}
        <TableView
          data={filteredProducts}
          columns={columns}
          loading={loading}
          tableClass="table-striped table-hover border shadow-sm"
          theadClass="table-dark"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        />
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