import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUsersByRole,
  updateUserRole,
  deleteUserDoc,
  getUserDoc
} from "../services/userService";
import { getUserRole } from "../../../firebase/authUtils";
import { UserDetailsCard } from "../components/dashboard/UserDetailsCard";
import { TableView } from "../components/dashboard/TableView";
import { UserRoleModal } from "../components/dashboard/UserRoleModal.jsx";
import { Spinner } from "../../../shared/components/spinner/Spinner";




/**
 * Componente principal para la gestión de usuarios
 * Maneja las operaciones CRUD para usuarios normales y administradores
 */

export const UserManagementPage = () => {

  // Obtener modo y tipo de la URL
  const { mode, type = "customers", id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("user");

  // Determinar qué tipos de usuarios mostrar según el tipo en la URL
  const rolesToFetch = type === "admins" ? ["admin", "superadmin"] : ["user"];

  // Obtener el rol del usuario actual
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      const role = await getUserRole();
      setCurrentUserRole(role);
    };

    checkCurrentUserRole();
  }, []);

  // Cargar usuario cuando estamos en modo de detalle
  useEffect(() => {
    if (mode === "view" && id) {
      const loadUserDetail = async () => {
        setLoading(true);
        try {
          const userData = await getUserDoc(id);
          if (userData) {
            setCurrentUser(userData);
          } else {
            alert("Usuario no encontrado");
            navigate(`/admin/users/${type}`);
          }
        } catch (error) {
          console.error("Error cargando detalles del usuario:", error);
          alert("Error cargando datos del usuario");
        } finally {
          setLoading(false);
        }
      };

      loadUserDetail();
    } else if (mode !== "view") {
      // Cargar lista de usuarios cuando no estamos en modo detalle
      loadUsers();
    }
  }, [mode, type, id, navigate]);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true);

    try {
      const { ok, data, error } = await getUsersByRole(rolesToFetch);

      if (!ok) {
        throw new Error(error || "Error desconocido");
      }

      setUsers(data);
    } catch (error) {
      console.error("Error obteniendo usuarios por rol:", error);
      alert(`Error cargando usuarios: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cambio de rol
  const handleRoleChange = async (uid, newRole) => {
    if (window.confirm(`¿Estás seguro de cambiar el rol del usuario a ${newRole}?`)) {
      try {
        setLoading(true);
        const { ok, error } = await updateUserRole(uid, newRole);

        if (!ok) {
          throw new Error(error || "Error desconocido");
        }

        alert("Rol actualizado correctamente");
        if (mode === "view") {
          // Si estamos en vista de detalle, actualizar el usuario actual
          const updatedUser = await getUserDoc(uid);
          setCurrentUser(updatedUser);
        } else {
          // Si estamos en vista de lista, recargar la lista
          await loadUsers();
        }
      } catch (error) {
        console.error("Error actualizando rol:", error);
        alert(`Error actualizando rol: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para eliminar usuario
  const handleDeleteUser = async (uid) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.")) {
      try {
        setLoading(true);
        const { ok, error } = await deleteUserDoc(uid);

        if (!ok) {
          throw new Error(error || "Error desconocido");
        }

        alert("Usuario eliminado correctamente");
        if (mode === "view") {
          // Si estamos en vista de detalle, volver a la lista
          navigate(`/admin/users/${type}`);
        } else {
          // Si estamos en vista de lista, recargar la lista
          await loadUsers();
        }
      } catch (error) {
        console.error("Error eliminando usuario:", error);
        alert(`Error eliminando usuario: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para abrir el modal de cambio de rol
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setShowRoleModal(true);
  };

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar tabla de usuarios
  const renderUsersTable = () => {
    if (loading) return <Spinner />;

    const columns = [
      {
        key: 'avatar',
        header: 'Avatar',
        renderCell: (user) => (
          <img
            src={user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email || 'User')}
            alt={user.displayName}
            className="rounded-circle"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
        )
      },
      {
        key: 'name',
        header: 'Nombre',
        renderCell: (user) => user.displayName || 'Sin nombre'
      },
      {
        key: 'email',
        header: 'Email',
        renderCell: (user) => user.email
      },
      {
        key: 'role',
        header: 'Rol',
        renderCell: (user) => (
          <span className={`badge ${getRoleBadgeColor(user.role)}`}>
            {user.role || 'user'}
          </span>
        )
      },
      {
        key: 'actions',
        header: 'Acciones',
        renderCell: (user) => (
          <div className="d-flex gap-2">
            {/* Ver detalles */}
            <button
              className="btn btn-sm btn-outline-info"
              onClick={() => navigate(`/admin/users/${type}/view/${user.id}`)}
              title="Ver detalles"
            >
              <i className="bi bi-eye"></i>
            </button>

            {/* Cambiar rol (solo para superadmin) */}
            {currentUserRole === "superadmin" && (
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => openRoleModal(user)}
                title="Cambiar rol"
              >
                <i className="bi bi-person-gear"></i>
              </button>
            )}

            {/* Eliminar (solo para superadmin) */}
            {currentUserRole === "superadmin" && (
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleDeleteUser(user.id)}
                title="Eliminar usuario"
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        )
      }
    ];

    return (
      <>
        {/* Barra de búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control form-control-lg border shadow-sm rounded-3"
            placeholder={`🔍 Buscar ${type === "admins" ? "administradores" : "clientes"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Selector de tipo de usuario */}
        <div className="mb-4">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${type === "customers" ? "active" : ""}`}
                onClick={() => navigate("/admin/users/customers")}
              >
                <i className="bi bi-people me-2"></i>
                Clientes
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${type === "admins" ? "active" : ""}`}
                onClick={() => navigate("/admin/users/admins")}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Administradores
              </button>
            </li>
          </ul>
        </div>

        <TableView
          data={filteredUsers}
          columns={columns}
          loading={loading}
          tableClass="table-striped table-hover border shadow-sm"
          theadClass="table-dark"
          style={{ borderRadius: "12px", overflow: "hidden" }}
        />

        {/* Modal para cambiar rol - renderizado condicionalmente */}
        {showRoleModal && selectedUser && (
          <UserRoleModal
            user={selectedUser}
            onClose={() => setShowRoleModal(false)}
            onSave={(uid, newRole) => {
              handleRoleChange(uid, newRole);
            }}
          />
        )}
      </>
    );
  };

  // Renderizar vista de detalle de usuario
  const renderUserDetail = () => {
    if (loading) return <Spinner />;

    if (!currentUser) {
      return (
        <div className="alert alert-warning">
          No se encontró información del usuario
        </div>
      );
    }

    return (
      <>
        <UserDetailsCard
          user={currentUser}
          onBack={() => navigate(`/admin/users/${type}`)}
          onChangeRole={currentUserRole === "superadmin" ? openRoleModal : undefined}
          onDelete={currentUserRole === "superadmin" ? handleDeleteUser : undefined}
        />

        {/* Modal para cambiar rol - renderizado condicionalmente */}
        {showRoleModal && (
          <UserRoleModal
            user={selectedUser || currentUser}
            onClose={() => setShowRoleModal(false)}
            onSave={(uid, newRole) => {
              handleRoleChange(uid, newRole);
            }}
          />
        )}
      </>
    );
  };

  // Renderizar según el modo
  return (
    <div className="container-fluid px-0">
      <h2 className="mb-4">
        {type === "admins" ? "Gestión de Administradores" : "Gestión de Clientes"}
        {mode === "view" && " - Detalles"}
      </h2>

      {mode === "view" ? renderUserDetail() : renderUsersTable()}
    </div>
  );
};

// Utilidad para determinar el color del badge según el rol
const getRoleBadgeColor = (role) => {
  switch (role) {
    case "superadmin":
      return "bg-danger";
    case "admin":
      return "bg-warning text-dark";
    case "user":
      return "bg-success";
    default:
      return "bg-secondary";
  }
};