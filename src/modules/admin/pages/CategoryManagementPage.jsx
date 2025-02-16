import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../services/categoryService";
import { CategoryForm } from '../components/dashboard/index.js'
import placeholder from '../../../shared/assets/images/placeholder.jpg'


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



  /*
    +---------------------------------------------+
    |                                             |
    |          Render View Mode                   |
    |                                             |
    +---------------------------------------------+
   */


  const renderViewMode = () => {
    if (loading) return <p>Cargando categorías...</p>;

    return (
      <div className="table-responsive">
        <table className="table table-striped table-hover border shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <thead className="table-dark">
          <tr>
            <th className="py-3 px-2">Imagen</th>
            <th className="py-3 px-2">Nombre</th>
            <th className="py-3 px-2">Descripción</th>
            <th className="py-3 px-2">Activa</th>
            <th className="py-3 px-2">Acciones</th>
          </tr>
          </thead>
          <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              {/* Miniatura de la imagen principal */}
              <td className="align-middle">
                <img
                  src={cat.mainImage || placeholder}
                  alt={cat.name}
                  className="img-thumbnail"
                  style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }}
                />
              </td>
              <td className="align-middle">{cat.name}</td>
              <td className="align-middle">{cat.description}</td>
              <td className="align-middle">{cat.active ? "Sí" : "No"}</td>
              <td className="align-middle">
                {/* Edit mode -> /admin/categories/edit/:id */}
                <button
                  className="btn btn-outline-dark btn-sm me-3"
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