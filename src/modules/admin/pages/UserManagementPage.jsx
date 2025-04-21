import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserRole } from "../../../config/firebase/authUtils";
import { Spinner } from "../../../shared/components/spinner/Spinner";

// Componentes
import { UserDetail } from '../components/dashboard/UserDetail.jsx'
import { UsersList } from '../components/dashboard/UsersList.jsx'


/**
 * Componente principal para la gestión de usuarios
 * Actúa como un contenedor y coordinador entre la lista y el detalle
 */

export const UserManagementPage = () => {

  // Obtener parámetros y navegación
  const { mode, type = "customers", id } = useParams();
  const navigate = useNavigate();

  // Estados básicos
  const [loading, setLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState("user");

  // Obtener el rol del usuario actual (admin/superadmin)
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      try { // Added try-catch for safety
        const role = await getUserRole();
        setCurrentUserRole(role || "user"); // Default to 'user' if role is null/undefined
      } catch (error) {
        console.error("Error getting user role:", error);
        setCurrentUserRole("user"); // Default on error
      } finally {
        setLoading(false);
      }
    };

    checkCurrentUserRole();
  }, []);

  // Función auxiliar para navegar
  const navigateToList = () => {
    navigate(`/admin/users/${type}`);
  };

  // Función auxiliar para navegar al detalle
  const navigateToDetail = (userId) => {
    navigate(`/admin/users/${type}/view/${userId}`);
  };

  // Renderizado según estado de carga
  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <h2 className="mb-4">
          {type === "admins" ? "Gestión de Administradores" : "Gestión de Clientes"}
          {mode === "view" && " - Detalles"}
        </h2>

      {/* Renderizado condicional basado en el modo */}
      {mode === "view" ? (
        <UserDetail
          userId={id}
          userType={type}
          currentUserRole={currentUserRole}
          onBack={navigateToList}
        />
      ) : (
        <UsersList
          userType={type}
          roleFilter={type === "admins" ? ["admin", "superadmin"] : ["user"]}
          currentUserRole={currentUserRole}
          onViewDetail={navigateToDetail}
        />
      )}
    </div>
  );
};