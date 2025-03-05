import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersByRole, updateUserRole, deleteUserDoc } from "../../services/userService";
import { UserRoleModal } from "./UserRoleModal";
import { Spinner } from "../../../../shared/components/spinner/Spinner";
import { TableView } from './TableView.jsx'
import { SearchBar } from '../shared/SearchBar.jsx'


/**
 * Componente que muestra la lista de usuarios filtrada por rol
 *
 * @param {string} userType - Tipo de usuarios a mostrar ("customers" o "admins")
 * @param {string[]} roleFilter - Roles a filtrar (ej. ["user"] o ["admin", "superadmin"])
 * @param {string} currentUserRole - Rol del usuario actual
 * @param {Function} onViewDetail - Función para navegar al detalle
 */
export const UsersList = ({ userType, roleFilter, currentUserRole, onViewDetail }) => {
  // Estados
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const navigate = useNavigate();

  // Cargar usuarios al iniciar
  useEffect(() => {
    loadUsers();
  }, [userType, roleFilter]);

  // Función para cargar usuarios
  const loadUsers = async () => {
    setLoading(true);

    try {
      const { ok, data, error } = await getUsersByRole(roleFilter);

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
        await loadUsers();
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
        await loadUsers();
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

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Filtrar usuarios según término de búsqueda
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Definir columnas para la tabla
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
      renderCell: (user) => (
        <span
          style={{
            maxWidth: '200px',
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {user.email}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Acciones',
      renderCell: (user) => (
        <div className="d-flex gap-2  ">
          {/* Ver detalles */}
          <button
            className="btn btn-outline-primary btn-sm me-2"
            onClick={() => onViewDetail(user.id)}
            title="Ver detalles"
          >
            <i className="bi bi-eye"></i>
          </button>

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

  if (loading && users.length === 0) {
    return <Spinner />;
  }

  return (
    <>
      {/* Barra de búsqueda refactorizada */}
      <div className="mb-4">
        <SearchBar
          value={searchTerm}
          onChange={handleSearchChange}
          onClear={handleClearSearch}
          placeholder={`Buscar ${userType === "admins" ? "administradores" : "clientes"}...`}
          size="lg"
        />
      </div>

      {/* Selector de tipo de usuario */}
      <div className="mb-4">
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${userType === "customers" ? "active" : ""}`}
              onClick={() => navigate("/admin/users/customers")}
            >
              <i className="bi bi-people me-2"></i>
              Clientes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${userType === "admins" ? "active" : ""}`}
              onClick={() => navigate("/admin/users/admins")}
            >
              <i className="bi bi-shield-lock me-2"></i>
              Administradores
            </button>
          </li>
        </ul>
      </div>

      {/* Tabla de usuarios */}
      <TableView
        data={filteredUsers}
        columns={columns}
        loading={loading}
        tableClass="table-striped table-hover border shadow-sm"
        theadClass="table-dark"
        style={{ borderRadius: "12px", overflow: "hidden" }}
      />

      {/* Modal para cambiar rol */}
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