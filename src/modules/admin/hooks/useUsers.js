import { useState } from "react";
import {
  getUsersByRole,
  getAllUsers,
  updateUserRole,
  deleteUserDoc
} from "../services/userService";

/**
 * Hook personalizado para gestionar usuarios en el panel de administración
 * @returns {Object} - Funciones y estados para manipular usuarios
 */
export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga usuarios filtrados por roles
   * @param {Array} roles - Roles a filtrar ['user', 'admin', 'superadmin']
   */
  const loadUsers = async (roles = ['user']) => {
    setLoading(true);
    setError(null);

    try {
      const { ok, data, error: resultError } = await getUsersByRole(roles);

      if (!ok) {
        throw new Error(resultError || 'Error al cargar usuarios');
      }

      setUsers(data);
    } catch (err) {
      console.error('Error en useUsers.loadUsers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza el rol de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} newRole - Nuevo rol ('user', 'admin', 'superadmin')
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const changeUserRole = async (userId, newRole) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateUserRole(userId, newRole);

      if (!result.ok) {
        throw new Error(result.error || 'Error al actualizar rol');
      }

      // Actualizar el usuario en la lista local
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      return { ok: true };
    } catch (err) {
      console.error('Error en useUsers.changeUserRole:', err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un usuario
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const removeUser = async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteUserDoc(userId);

      if (!result.ok) {
        throw new Error(result.error || 'Error al eliminar usuario');
      }

      // Eliminar usuario de la lista local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      return { ok: true };
    } catch (err) {
      console.error('Error en useUsers.removeUser:', err);
      setError(err.message);
      return { ok: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene un usuario por su ID
   * @param {string} userId - ID del usuario
   * @returns {Object|null} - Usuario encontrado o null
   */
  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || null;
  };

  return {
    users,
    loading,
    error,
    loadUsers,
    changeUserRole,
    removeUser,
    getUserById
  };
};