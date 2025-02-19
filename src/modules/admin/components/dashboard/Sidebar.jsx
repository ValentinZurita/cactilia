
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from 'firebase/auth'
import { FirebaseAuth } from '../../../../firebase/firebaseConfig.js'
import { logout } from '../../../public/store/auth/authSlice.js'


/*
 * ++++++++++++++++++++++++++++++++++++++++++++++
 * |                                           |
 * |           Sidebar Component               |
 * |                                           |
 * ++++++++++++++++++++++++++++++++++++++++++++++
 */


/**
 *
 * Sidebar navigation component for the admin panel.
 * Includes collapsible menu sections.
 *
 * @param {function} onLinkClick - Callback to close the sidebar on mobile devices.
 *
 * @returns {JSX.Element}
 *
 * @example
 * return <Sidebar onLinkClick={handleNavClick} />;
 *
 */


export const Sidebar = ({ onLinkClick }) => {

  const [openMenus, setOpenMenus] = useState({ categories: false, products: false });
  const dispatch = useDispatch();
  const { isAdmin } = useSelector(state => state.auth)
  const navigate =useNavigate();


  // Toggles the visibility of a sidebar menu section.
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };


  // Closes the off-canvas sidebar on mobile devices.
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      const sidebarOffcanvas = document.getElementById("offcanvasAdminSidebar");
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarOffcanvas);
      bsOffcanvas?.hide();

      // Remove residual backdrop
      setTimeout(() => {
        document.querySelector(".offcanvas-backdrop")?.remove();
        document.body.classList.remove("offcanvas-backdrop");
      }, 300);
    }
  };


  // Handles the logout process.
  const handleLogout = () => {
    if (window.confirm("¿Quieres cerrar sesión?")) {
      signOut(FirebaseAuth)
        .then(() => {
          dispatch(logout());
          navigate("/admin/login");
        })
        .catch((error) => {
          alert("Error al cerrar sesión: " + error.message);
        });
    }
  };


  return (
    <div className="sidebar-container d-flex flex-column bg-dark text-light min-vh-100 p-3">

      {/* Sidebar Header */}
      <h5 className="mb-4 fw-medium">Panel de Administración</h5>

      {/* Sidebar Navigation */}
      <ul className="nav nav-pills flex-column mb-auto">

        {/* Sidebar Home */}
        <SidebarItem to="/admin/home" icon="bi-house" label="Home" onClick={handleNavClick} />

        {/* Sidebar Categories */}
        <SidebarDropdown label="Categorias" icon="bi-tags" isOpen={openMenus.categories} toggle={() => toggleMenu("categories")}>
          <SidebarItem to="/admin/categories/view" label="Ver Categorias" onClick={handleNavClick} />
          <SidebarItem to="/admin/categories/create" label="Agregar Categorias" onClick={handleNavClick} />
        </SidebarDropdown>

        {/* Sidebar Products */}
        <SidebarDropdown label="Productos" icon="bi-box-seam" isOpen={openMenus.products} toggle={() => toggleMenu("products")}>
          <SidebarItem to="/admin/products/view" label="Ver Productos" onClick={handleNavClick} />
          <SidebarItem to="/admin/products/create" label="Agregar Productos" onClick={handleNavClick} />
        </SidebarDropdown>

        {/* Sidebar Logout */}
        <li className="nav-item">
          <button className="nav-link text-light" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2" /> Cerrar Sesión
          </button>
        </li>

      </ul>
    </div>
  );
};




/**
 * * * * * * * * * * * * * * * * * * * * * * *
 * |                                        |
 * |           Helper Components            |
 * |                                        |
 * * * * * * * * * * * * * * * * * * * * * *
 */


/**
 *
 * Renders a collapsible sidebar menu section.
 *
 * @param label - Section label.
 * @param icon - Bootstrap icon class.
 * @param isOpen - Whether the section is open.
 * @param toggle - Callback to toggle the section.
 * @param children - Nested sidebar items.
 *
 * @example
 * <SidebarDropdown label="Categories" icon="bi-tags" isOpen={openMenus.categories} toggle={() => toggleMenu("categories")}>
 *   <SidebarItem to="/admin/categories/view" label="View Categories" onClick={handleNavClick} />
 *   <SidebarItem to="/admin/categories/create" label="Add Category" onClick={handleNavClick} />
 *   ...
 * </SidebarDropdown>
 *
 */


const SidebarDropdown = ({ label, icon, isOpen, toggle, children }) => (
  <li className="nav-item">
    <button className="nav-link text-light d-flex justify-content-between align-items-center btn btn-link" onClick={toggle}>
      <span><i className={`bi ${icon} me-2`} /> {label}</span>
      <i className={`bi bi-caret-${isOpen ? "up" : "down"} ms-2`} />
    </button>
    <div className={`collapse ${isOpen ? "show" : ""}`}>
      <ul className="nav flex-column ms-4">{children}</ul>
    </div>
  </li>
);




/**
 *
 * Renders a single sidebar item.
 *
 * @param to - URL to navigate to.
 * @param icon - Bootstrap icon class.
 * @param label - Text label.
 * @param onClick - Callback to close the sidebar on mobile devices.
 *
 * @example
 * <SidebarItem to="/admin/home" icon="bi-house" label="Home" onClick={handleNavClick} />
 *
 */


const SidebarItem = ({ to, icon, label, onClick }) => (
  <li className="nav-item">
    <NavLink to={to} className="nav-link text-light" onClick={onClick}>
      {icon && <i className={`bi ${icon} me-2`} />} {label}
    </NavLink>
  </li>
);




