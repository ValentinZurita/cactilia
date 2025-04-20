import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from 'firebase/auth'
import { FirebaseAuth } from '../../../../config/firebase/firebaseConfig.js'
import { logout } from '../../../../store/auth/authSlice.js'
import { getUserRole } from '../../../../config/firebase/authUtils.js'

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

  const [openMenus, setOpenMenus] = useState({
    categories: false,
    products: false,
    users: false,
    orders: false,
    media: false,
    companyInfo: false
  });
  const [userRole, setUserRole] = useState("admin");
  const dispatch = useDispatch();
  const { isAdmin } = useSelector(state => state.auth)
  const navigate = useNavigate();

  // Obtener el rol del usuario actual
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await getUserRole();
      setUserRole(role);
    };
    fetchUserRole();
  }, []);


  // Toggles the visibility of a sidebar menu section.
  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };


  // Closes the off-canvas sidebar on mobile devices.
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      const sidebarOffcanvas = document.getElementById("offcanvasAdminSidebar");
      if (sidebarOffcanvas) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(sidebarOffcanvas);
        bsOffcanvas?.hide();

        // Remove residual backdrop
        setTimeout(() => {
          document.querySelector(".offcanvas-backdrop")?.remove();
          document.body.classList.remove("offcanvas-backdrop");
        }, 300);
      }
    }

    // Llamar a la función de onclick proporcionada
    if (onLinkClick) {
      onLinkClick();
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
    <div className="sidebar-container d-flex flex-column bg-dark text-light min-vh-100 p-3" style={{fontSize: "0.8rem"}}>

      {/* Sidebar Header */}
      <h5 className="mb-4 fw-medium">Panel de Administración</h5>

      {/* Sidebar Navigation */}
      <ul className="nav nav-pills flex-column mb-auto">

        {/* Sidebar Home */}
        <SidebarItem to="/admin/home" icon="bi-house" label="Home" onClick={handleNavClick} />

        {/* Sidebar Categories */}
        <SidebarDropdown
          label="Categorias"
          icon="bi-tags"
          isOpen={openMenus.categories}
          toggle={() => toggleMenu("categories")}
        >
          <SidebarItem to="/admin/categories/view" label="Ver Categorias" onClick={handleNavClick} />
          <SidebarItem to="/admin/categories/create" label="Agregar Categorias" onClick={handleNavClick} />
        </SidebarDropdown>

        {/* Sidebar Products */}
        <SidebarDropdown
          label="Productos"
          icon="bi-box-seam"
          isOpen={openMenus.products}
          toggle={() => toggleMenu("products")}
        >
          <SidebarItem to="/admin/products/view" label="Ver Productos" onClick={handleNavClick} />
          <SidebarItem to="/admin/products/create" label="Agregar Productos" onClick={handleNavClick} />
        </SidebarDropdown>

        {/* Pedidos */}
        <SidebarDropdown
          label="Pedidos"
          icon="bi-cart"
          isOpen={openMenus.orders}
          toggle={() => toggleMenu("orders")}
        >
          <SidebarItem to="/admin/orders/view" label="Ver Pedidos" onClick={handleNavClick} />
        </SidebarDropdown>


        {/* NUEVA SECCIÓN: */}
        <SidebarDropdown
          label="Envíos"
          icon="bi-truck"
          isOpen={openMenus.shipping}
          toggle={() => toggleMenu("shipping")}
        >
          <SidebarItem to="/admin/shipping" label="Reglas de Envío" onClick={handleNavClick} />
          <SidebarItem to="/admin/shipping-debug" label="Diagnóstico de Envío" onClick={handleNavClick} />
        </SidebarDropdown>


        {/* Usuarios */}
        <SidebarDropdown
          label="Usuarios"
          icon="bi-people"
          isOpen={openMenus.users}
          toggle={() => toggleMenu("users")}
        >
          <SidebarItem to="/admin/users/customers" label="Clientes" onClick={handleNavClick} />

          {/* Opción de Administradores solo visible para superadmin */}
          {userRole === "superadmin" && (
            <SidebarItem to="/admin/users/admins" label="Administradores" onClick={handleNavClick} />
          )}
        </SidebarDropdown>

        {/* Sidebar Media Library */}
        <SidebarDropdown
          label="Media Library"
          icon="bi-images"
          isOpen={openMenus.media}
          toggle={() => toggleMenu("media")}
        >
          <SidebarItem to="/admin/media/browse" label="Browse Media" onClick={handleNavClick} />
          <SidebarItem to="/admin/media/upload" label="Upload Media" onClick={handleNavClick} />
        </SidebarDropdown>

        {/* Sidebar Content Management */}
        <SidebarDropdown
          label="Gestión de Contenido"
          icon="bi-layout-text-window"
          isOpen={openMenus.content}
          toggle={() => toggleMenu("content")}
        >
          <SidebarItem
            to="/admin/homepage"
            label="Editor de Página de Inicio"
            onClick={handleNavClick}
            icon="bi-house-gear"
          />
          <SidebarItem
            to="/admin/shoppage"
            label="Editor de Página de Tienda"
            onClick={handleNavClick}
            icon="bi-shop-window"
          />

          <SidebarItem
            to="/admin/contactpage"
            label="Editor de Página de Contacto"
            onClick={handleNavClick}
            icon="bi-envelope-fill"
          />
        </SidebarDropdown>

        {/* Datos de la Empresa */}
        <SidebarDropdown
          label="Datos de la Empresa"
          icon="bi-building"
          isOpen={openMenus.companyInfo}
          toggle={() => toggleMenu("companyInfo")}
        >
          <SidebarItem 
            to="/admin/company-info"
            label="Información General"
            onClick={handleNavClick}
          />
        </SidebarDropdown>

        {/* Nuevo botón para ir al perfil de usuario */}
        <li className="nav-item">
          <Link to="/profile" className="nav-link text-light">
            <i className="bi bi-person-circle me-2" /> Perfil de Usuario
          </Link>
        </li>

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