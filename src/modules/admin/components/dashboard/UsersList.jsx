import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsersByRole, deleteUserDoc } from "../../services/userService";
import { Spinner } from "../../../../shared/components/spinner/Spinner";
import { TableView } from './TableView.jsx'
import { SearchBar } from '../../common/components/SearchBar.jsx'
import NavigationTabs from "../../common/components/NavigationTabs.jsx";
import { ActionButton } from "../../common/components/ActionButton.jsx";
import { UserRole } from "./UserDetailHelpers.jsx";
import { ActionButtonsContainer } from '../../common/components/ActionButtonsContainer.jsx';
import { UserAvatar } from '../../common/components/UserAvatar.jsx';


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

      setUsers(data || []);
    } catch (error) {
      console.error("Error obteniendo usuarios por rol:", error);
      alert(`Error cargando usuarios: ${error.message}`);
    } finally {
      setLoading(false);
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

  // Manejar cambio en la búsqueda
  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
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

  // Función para manejar cambio de pestaña
  const handleTabChange = (tabId) => {
    navigate(`/admin/users/${tabId}`);
  };

  // Definir columnas para la tabla (Refactorizado)
  const columns = [
    {
      key: 'avatar',
      header: '', // Sin cabecera para avatar
      renderCell: (user) => (
        <UserAvatar user={user} size="sm" />
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

    // *** Columna Rol ***
    {
        key: 'role',
        header: 'Rol',
        renderCell: (user) => <UserRole role={user.role} /> 
    },

    {
      key: 'actions',
      header: <span className="text-end d-block">Acciones</span>,
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      renderCell: (user) => (
        <ActionButtonsContainer size="sm" ariaLabel={`Acciones para ${user.displayName || user.email}`}>
          <ActionButton
            iconClass="bi bi-eye"
            variant="light"
            textColor="secondary"
            size="sm"
            onClick={() => onViewDetail(user.id)}
            title="Ver detalles"
            isFirst={true}
          />

          {currentUserRole === "superadmin" && (
            <ActionButton
              iconClass="bi bi-trash"
              variant="light"
              textColor="secondary"
              hoverTextColor="danger"
              size="sm"
              onClick={() => handleDeleteUser(user.id)}
              title="Eliminar usuario"
              confirmMessage={`¿Estás seguro de eliminar a ${user.displayName || user.email}?`}
              isLast={true}
            />
          )}
        </ActionButtonsContainer>
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
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          placeholder={`Buscar ${userType === "admins" ? "administradores" : "clientes"}...`}
        />
      </div>

      {/* Selector de tipo de usuario */}
      <div className="mb-4">
        <NavigationTabs
          activeSection={userType}
          onSectionChange={handleTabChange}
          tabs={[
            { id: 'customers', label: 'Clientes', icon: 'bi-people' },
            { id: 'admins', label: 'Administradores', icon: 'bi-shield-lock' },
          ]}
        />
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
    </>
  );
};