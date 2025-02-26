/**
 * UserManagementPage.jsx
 * -------------------------------------------------
 * Página para gestionar usuarios:
 *  - Ver lista de usuarios
 *  - Editar roles de usuario (setCustomClaims + Firestore)
 *  - Eliminar usuarios (deleteUserByUID Cloud Function)
 *  - Ver detalles del usuario en un modal responsive
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getAuth } from "firebase/auth";

// Componentes UI
import { TableView } from "../components/dashboard/TableView.jsx";
import { UserDetailsModal } from "../components/dashboard/UserDetalisModal.jsx";

// Servicios
import { getAllUsers, updateUserRoleInFirestore } from "../../auth/services/userService.js";

// Inicializar Firebase Functions
const firebaseApp = getApp();
const functions = getFunctions(firebaseApp, "us-central1");

export const UserManagementPage = () => {
  const { role: currentUserRole } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Cargar usuarios desde Firestore
   */
  const loadUsers = async () => {
    setLoading(true);
    const { ok, data, error } = await getAllUsers();
    if (!ok) {
      alert("Error cargando usuarios: " + error);
      setLoading(false);
      return;
    }
    setUsers(data);
    setLoading(false);
  };

  /**
   * Mostrar detalles del usuario llamando a la Cloud Function `getUserDetailsByUID`
   */
  const handleShowDetails = async (usr) => {
    setSelectedUser(null);

    if (!auth.currentUser) {
      alert("Debes iniciar sesión para ver los detalles.");
      return;
    }

    try {
      await auth.currentUser.getIdToken(true);

      const getUserDetailsByUID = httpsCallable(functions, "getUserDetailsByUID");
      // Usamos usr.uid, pero si no existe, se muestra un aviso
      const uidToSend = usr.uid || usr.id;
      if (!uidToSend) {
        console.error("El objeto usuario no tiene uid ni id:", usr);
        alert("Error: El usuario no tiene un identificador válido.");
        return;
      }
      console.log("Enviando UID:", uidToSend);
      const res = await getUserDetailsByUID({ uid: uidToSend });
      if (!res.data?.ok) {
        console.error("Error obteniendo detalles del usuario:", res.data.error);
        alert("Error obteniendo detalles del usuario: " + (res.data.error || "desconocido"));
        return;
      }
      // Fusionar datos locales de Firestore con los de Auth
      setSelectedUser({
        ...usr,
        ...res.data.user,
      });
    } catch (error) {
      console.error("Error obteniendo detalles avanzados:", error);
      alert("Error obteniendo detalles avanzados: " + error.message);
    }
  };

  /**
   * Editar el rol de un usuario en Firebase Authentication
   */
  const handleEditRole = async (usr, newRole) => {
    if (currentUserRole !== "superadmin") {
      alert("No tienes permiso para cambiar roles.");
      return;
    }

    if (!window.confirm(`¿Cambiar el rol de ${usr.displayName || "este usuario"} a '${newRole}'?`)) {
      return;
    }

    if (!auth.currentUser) {
      alert("Debes iniciar sesión para cambiar el rol.");
      return;
    }

    try {
      // Determinar el UID correcto
      const uidToSend = usr.uid || usr.id;
      if (!uidToSend) {
        console.error("El objeto usuario no tiene uid ni id:", usr);
        alert("Error: El usuario no tiene un identificador válido.");
        return;
      }
      console.log("Enviando UID para setCustomClaims:", uidToSend);

      // Asignar nuevo rol con la Cloud Function `setCustomClaims`
      const setCustomClaims = httpsCallable(functions, "setCustomClaims");
      const cfRes = await setCustomClaims({ uid: uidToSend, role: newRole });
      if (!cfRes.data?.ok) {
        console.error("Error en setCustomClaims:", cfRes.data);
        alert("Error asignando rol: " + (cfRes.data?.message || "desconocido"));
        return;
      }

      // También actualizar Firestore
      const { ok, error } = await updateUserRoleInFirestore(uidToSend, newRole);
      if (!ok) {
        console.error("Error actualizando rol en Firestore:", error);
        alert("Error actualizando rol en Firestore: " + error);
        return;
      }

      // Actualizar UI: aquí comparamos usando uidToSend
      setUsers((prev) => prev.map((u) => ((u.uid || u.id) === uidToSend ? { ...u, role: newRole } : u)));
      alert(`Rol cambiado a '${newRole}'. El usuario debe cerrar y volver a iniciar sesión.`);
    } catch (error) {
      console.error("Error en handleEditRole:", error);
      alert("Error cambiando rol: " + error.message);
    }
  };

  /**
   * Eliminar un usuario de Firebase Authentication y Firestore
   */
  const handleDeleteUser = async (usr) => {
    if (!window.confirm(`¿Seguro que quieres eliminar a ${usr.displayName || "este usuario"}?`)) {
      return;
    }

    if (!auth.currentUser) {
      alert("Debes iniciar sesión para eliminar un usuario.");
      return;
    }

    try {
      const uidToSend = usr.uid || usr.id;
      if (!uidToSend) {
        console.error("El objeto usuario no tiene uid ni id:", usr);
        alert("Error: El usuario no tiene un identificador válido.");
        return;
      }
      console.log("Enviando UID para deleteUser:", uidToSend);

      const deleteUser = httpsCallable(functions, "deleteUserByUID");
      const res = await deleteUser({ uid: uidToSend });
      if (!res.data?.ok) {
        console.error("Error eliminando usuario:", res.data);
        alert("Error eliminando usuario: " + (res.data?.message || "desconocido"));
        return;
      }
      setUsers((prev) => prev.filter((u) => (u.uid || u.id) !== uidToSend));
      alert("Usuario eliminado correctamente.");
    } catch (error) {
      console.error("Error en handleDeleteUser:", error);
      alert("Error eliminando usuario: " + error.message);
    }
  };

  /**
   * Dropdown para cambiar el rol del usuario
   */
  const RoleDropdown = ({ usr }) => {
    const roles = ["user", "admin", "superadmin"];
    return (
      <select
        className="form-select"
        value={usr.role}
        onChange={(e) => handleEditRole(usr, e.target.value)}
        disabled={currentUserRole !== "superadmin"}
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </option>
        ))}
      </select>
    );
  };

  /**
   * Columnas para la tabla de usuarios
   */
  const columns = [
    { key: "displayName", header: "Nombre", renderCell: (usr) => usr.displayName || "(sin nombre)" },
    { key: "email", header: "Correo", renderCell: (usr) => usr.email },
    { key: "role", header: "Rol", renderCell: (usr) => <RoleDropdown usr={usr} /> },
    {
      key: "actions",
      header: "Acciones",
      renderCell: (usr) => (
        <div className="d-flex gap-2">
          <button className="btn btn-outline-info btn-sm" onClick={() => handleShowDetails(usr)}>
            <i className="bi bi-eye"></i>
          </button>
          <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteUser(usr)}>
            <i className="bi bi-trash"></i>
          </button>
        </div>
      ),
    },
  ];

  const filteredUsers = users.filter(
    (u) =>
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>Gestión de Usuarios</h2>
      <input
        type="text"
        className="form-control form-control-lg mb-3"
        placeholder="🔍 Buscar usuario..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableView data={filteredUsers} columns={columns} loading={loading} />
      <UserDetailsModal user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  );
};