import { useState, useEffect } from "react";
import { getUserDoc, updateUserRole, deleteUserDoc } from "../../services/userService";
import { UserRoleModal } from "./UserRoleModal";
import { Spinner } from "../../../../shared/components/spinner/Spinner";
import { UserDetailsCard } from './UserDetailsCard.jsx'


/**
 * Componente para mostrar y gestionar los detalles de un usuario
 *
 * @param {string} userId - ID del usuario a mostrar
 * @param {string} userType - Tipo de usuario ("customers" o "admins")
 * @param {string} currentUserRole - Rol del usuario actual
 * @param {Function} onBack - Función para volver a la lista
 */


export const UserDetail = ({ userId, userType, currentUserRole, onBack }) => {

  // Estados
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData().then(r => r);
  }, [userId]);

  // Función para cargar datos del usuario
  const loadUserData = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await getUserDoc(userId);

      if (userData) {
        setUser(userData);
      } else {
        alert("Usuario no encontrado");
        onBack();
      }
    } catch (error) {
      console.error("Error cargando usuario:", error);
      alert("Error al cargar datos del usuario");
      onBack();
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
        await loadUserData(); // Recargar datos del usuario
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
        onBack();
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
    setShowRoleModal(true);
  };

  // Mostrar spinner mientras carga
  if (loading) {
    return <Spinner />;
  }

  // Mostrar mensaje si no hay usuario
  if (!user) {
    return (
      <div className="alert alert-warning">
        No se encontró información del usuario
      </div>
    );
  }

  return (
    <>
      <UserDetailsCard
        user={user}
        onBack={onBack}
        onChangeRole={currentUserRole === "superadmin" ? openRoleModal : undefined}
        onDelete={currentUserRole === "superadmin" ? handleDeleteUser : undefined}
      />

      {/* Modal para cambiar rol */}
      {showRoleModal && (
        <UserRoleModal
          user={user}
          onClose={() => setShowRoleModal(false)}
          onSave={(uid, newRole) => {
            handleRoleChange(uid, newRole).then(r => r);
          }}
        />
      )}
    </>
  );
};