import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../services/categoryService";
import { CategoryForm } from '../components/dashboard/index.js'
import placeholder from '../../../shared/assets/images/placeholder.jpg'
import { TableView } from '../components/dashboard/TableView.jsx'
import { SearchBar } from '../components/shared/SearchBar.jsx'


/**
 * CategoryManagementPage
 * Handles the viewing, creation, editing, and deletion of categories,
 * @returns {JSX.Element}
 * @constructor
 * @example
 * <CategoryManagementPage />
 */


export const CategoryManagementPage = () => {


  // Get the mode and id from the URL
  const { mode, id } = useParams();
  const navigate = useNavigate();


  // States
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");


  // Load the categories when the page loads
  useEffect(() => {
    loadCategories().then(() => {
      console.log("Categories loaded");
    });
  }, []);


  // Load the category to edit if we're in 'edit' mode
  useEffect(() => {
    if (mode === "edit" && id) {
      // Find the category to edit
      const cat = categories.find((c) => c.id === id);
      setEditingCategory(cat || null);
    } else {
      setEditingCategory(null);
    }
  }, [mode, id, categories]);


  // Load the categories
  const loadCategories = async () => {
    setLoading(true);
    const { ok, data, error } = await getCategories();
    if (!ok) {
      alert("Error fetching categories: " + error);
      setLoading(false);
      return;
    }
    setCategories(data);
    setLoading(false);
  };


  // Handle the category saved event
  const handleCategorySaved = () => {
    loadCategories().then(() => {
      console.log("Categories loaded");
    });
    navigate("/admin/categories/view");
  };


  // Handle the category deletion
  const handleDeleteCategory = async (catId) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      const { ok, error } = await deleteCategory(catId);
      if (!ok) {
        alert("Error eliminando categoría: " + error);
        return;
      }
      alert("Categoría eliminada con éxito");
      loadCategories().then(() => {
        console.log("Categories loaded");
      });
      navigate("/admin/categories/view");
    }
  };

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
  };


  // 🆕 Filtered categories based on search term
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );





  /*
    +---------------------------------------------+
    |                                             |
    |          Render View Mode                   |
    |                                             |
    +---------------------------------------------+
   */


  const renderViewMode = () => {
    if (loading) return <p>Cargando categorías...</p>;

    // 🆕 Definimos las columnas que mostrará la tabla
    const columns = [
      {
        accessor: 'image',
        header: 'Imagen',
        cell: (cat) => (
          <img
            src={cat.mainImage || placeholder}
            alt={cat.name}
            className="img-thumbnail"
            style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
          />
        )
      },
      {
        accessor: 'name',
        header: 'Nombre',
        cell: (cat) => cat.name
      },
      {
        accessor: 'description',
        header: 'Descripción',
        cell: (cat) => cat.description
      },
      {
        accessor: 'active',
        header: 'Activa',
        cell: (cat) => (cat.active ? "Sí" : "No")
      },
      {
        accessor: 'actions',
        header: 'Acciones',
        cell: (cat) => (
          <>
            {/* Edit mode -> /admin/categories/edit/:id */}
            <button
              className="btn btn-outline-primary btn-sm me-3"
              onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            {/* Delete mode -> /admin/categories/delete/:id */}
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => handleDeleteCategory(cat.id)}
            >
              <i className="bi bi-trash"></i>
            </button>
          </>
        )
      }
    ];

    // 🆕 Retornamos el TableView con la data de categorías
    return (
      <>
        {/* Barra de búsqueda refactorizada */}
        <div className="mb-4">
          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            placeholder="Buscar categorías..."
            size="lg"
          />
        </div>

        {/* TableView */}
        <TableView
          data={filteredCategories}
          columns={columns}
          loading={loading}
          tableClass="table-striped table-hover border shadow-sm"
          theadClass="table-dark"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        />
      </>
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
    <CategoryForm onCategorySaved={handleCategorySaved} />
  );




  /*
    +---------------------------------------------+
    |                                             |
    |          Render Edit Mode                   |
    |                                             |
    +---------------------------------------------+
   */


  const renderEditMode = () => {
    if (!editingCategory)
      return <p>Cargando información de la categoría...</p>;

    return (
      <CategoryForm
        editingCategory={editingCategory}
        onCategorySaved={handleCategorySaved}
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
    if (!editingCategory)
      return <p>Cargando información de la categoría...</p>;

    return (
      <div>
        <h3>Eliminar Categoría</h3>
        <p>
          ¿Estás seguro de eliminar{" "}
          <strong>{editingCategory.name}</strong>?
        </p>
        <button
          className="btn btn-danger"
          onClick={() => handleDeleteCategory(editingCategory.id)}
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
      <h2>Gestión de Categorías</h2>

      {mode === "view" && renderViewMode()}
      {mode === "create" && renderCreateMode()}
      {mode === "edit" && renderEditMode()}
      {mode === "delete" && renderDeleteMode()}
    </div>
  );
};