import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';


/**
 * Component that checks if the user is authenticated
 * If the user is not authenticated, it redirects to the login page
 *
 * @param {Object} children - Children components
 *
 * @returns {Object} - Redirect to login page or children components
 */


export const RequireAuth = ({ children }) => {
  const { status } = useSelector((state) => state.auth);


  // If the user is not authenticated, redirect to the login page
  if (status !== "authenticated") {
    return <Navigate to="/auth/login" />;
  }

  return children;
};