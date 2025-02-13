
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCategories, deleteCategory } from "../services/categoryService";
import { CategoryForm } from "../components/dashboard/CategoryForm";

export const CategoryManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (mode === "edit" && id) {
      // Find the category to edit
      const cat = categories.find((c) => c.id === id);
      setEditingCategory(cat || null);
    } else {
      setEditingCategory(null);
    }
  }, [mode, id, categories]);

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

  const handleCategorySaved = () => {
    loadCategories();
    navigate("/admin/categories/view");
  };

  const handleDeleteCategory = async (catId) => {
    if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
      const { ok, error } = await deleteCategory(catId);
      if (!ok) {
        alert("Error eliminando categoría: " + error);
        return;
      }
      alert("Categoría eliminada con éxito");
      loadCategories();
      navigate("/admin/categories/view");
    }
  };

  // Render "view" mode
  const renderViewMode = () => {
    if (loading) return <p>Cargando categorías...</p>;

    return (
      <table className="table table-striped">
        <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Activa</th>
          <th>Acciones</th>
        </tr>
        </thead>
        <tbody>
        {categories.map((cat) => (
          <tr key={cat.id}>
            <td>{cat.id}</td>
            <td>{cat.nombre}</td>
            <td>{cat.descripcion}</td>
            <td>{cat.activa ? "Sí" : "No"}</td>
            <td>
              {/* Edit mode -> /admin/categories/edit/:id */}
              <button
                className="btn btn-warning btn-sm me-2"
                onClick={() => navigate(`/admin/categories/edit/${cat.id}`)}
              >
                Editar
              </button>
              {/* Delete mode -> /admin/categories/delete/:id */}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => navigate(`/admin/categories/delete/${cat.id}`)}
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

  // Render "create" mode
  const renderCreateMode = () => (
    <CategoryForm onCategorySaved={handleCategorySaved} />
  );

  // Render "edit" mode
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

  // Render "delete" mode
  const renderDeleteMode = () => {
    if (!editingCategory)
      return <p>Cargando información de la categoría...</p>;

    return (
      <div>
        <h3>Eliminar Categoría</h3>
        <p>
          ¿Estás seguro de eliminar{" "}
          <strong>{editingCategory.nombre}</strong>?
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