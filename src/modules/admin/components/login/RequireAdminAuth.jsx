import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getUserRole } from '../../../../config/firebase/authUtils.js';
import { FirebaseAuth } from '../../../../config/firebase/firebaseConfig.js'


/*
  Component that checks if the user is an admin or super admin.
  If the user is not an admin or super admin, it redirects to the login page.
 */


export const RequireAdminAuth = () => {

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if the user is an admin or super admin
  useEffect(() => {

    // Get the current user
    const user = FirebaseAuth.currentUser;

    // If there is no user, set the role to visitor
    if (!user) {
      setRole('visitor');
      setLoading(false);
      return;
    }

    // Get the user role
    getUserRole().then((userRole) => {
      setRole(userRole);
    })
      .catch((error) => {
        console.error("Error obteniendo el rol:", error);
        setRole("visitor");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Show loading message
  if (loading) {
    return <p>Cargando...</p>;
  }


  // Redirect to the login page if the user is not an admin or super admin
  return (role === 'admin' || role === 'superadmin')
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;

};