import { Logo } from '../../../../shared/components/logo/Logo.jsx'
import { AdminLoginForm } from './AdminLoginForm.jsx'


/*
  Component that contains the logo and the login form for the admin.
  It is used in the AdminLoginPage component.
 */


export const AdminLoginCard = () => {
  return (
    <div className="card shadow-lg p-4 rounded text-center col-10 col-sm-8 col-md-6 col-lg-4">

      {/* Logo */}
      <Logo styles={{ maxWidth: "120px", marginBottom: "20px" }} />

      {/* Title */}
      <h3 className="card-title mb-4">Admin Login</h3>

      {/* Form */}
      <AdminLoginForm />

    </div>
  );
};