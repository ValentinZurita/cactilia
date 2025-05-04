import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserDoc, deleteUser } from '../../services/userService.js';
import { UserDetailsCard } from '../components/dashboard/UserDetailsCard.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import { LoadingIndicator } from '../common/components/LoadingIndicator.jsx';
import { showToast } from '../../../shared/utils/toastUtils.js';

export const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await getUserDoc(userId);
      if (!userData) {
        throw new Error('Usuario no encontrado.');
      }
      setUser(userData);
    } catch (err) {
      console.error("Error cargando detalles del usuario:", err);
      setError(err.message);
      showToast('Error al cargar el usuario: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const handleDeleteUser = async () => {
    if (!user) return;
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}? Esta acción no se puede deshacer.`)) {
      try {
        const { ok, error: deleteError } = await deleteUser(user.id);
        if (!ok) {
          throw new Error(deleteError || 'Error desconocido al eliminar usuario');
        }
        showToast('Usuario eliminado correctamente.', 'success');
        navigate('/admin/users');
      } catch (err) {
        console.error("Error eliminando usuario:", err);
        showToast('Error al eliminar el usuario: ' + err.message, 'error');
      }
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  // --- Verificaciones de estado --- 
  // 1. Esperar a que el usuario LOGUEADO (currentUser) esté listo y tenga rol
  if (!currentUser?.role) {
    // Podríamos mostrar un spinner específico o usar el mismo general
    // Opcionalmente, podrías verificar un estado de carga explícito si useAuth lo proporciona
    console.log("UserDetail waiting: currentUser or role not ready yet.");
    return <LoadingIndicator message="Verificando autorización..." />;
  }

  // 2. Esperar a que los datos del usuario VISITADO estén listos
  if (loading) return <LoadingIndicator message="Cargando detalles del usuario..." />;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!user) return <div className="alert alert-warning">Usuario no encontrado.</div>;

  // --- DEBUG: Verificar el rol del currentUser ANTES de pasar la prop ---
  console.log('UserDetail rendering, currentUser role is:', currentUser?.role);

  return (
    <div className="container mt-4">
      <UserDetailsCard
        user={user}
        onBack={handleBack}
        onDelete={currentUser?.role === 'superadmin' ? handleDeleteUser : undefined}
        currentUserRole={currentUser?.role}
        onUserUpdate={loadUserDetails}
      />
    </div>
  );
}; 