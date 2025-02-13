import React from 'react'
import { Sidebar } from './Sidebar.jsx'


/*
  +---------------------------------------------+
  | Mobile Navbar                               |
  +---------------------------------------------+
 */


export const MobileNavbar = ({ navigate }) => (
  <nav className="navbar navbar-dark bg-dark d-md-none">
    <div className="container-fluid">
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasAdminSidebar"
        aria-controls="offcanvasAdminSidebar"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      <span className="navbar-brand mb-0 h1" onClick={() => navigate("/admin/home")} style={{ cursor: "pointer" }}>
        Admin Panel
      </span>
    </div>
  </nav>
);




/*
  +---------------------------------------------+
  | Desktop Sidebar                             |
  +---------------------------------------------+
 */


export const DesktopSidebar = () => (
  <aside className="col-md-3 col-lg-2 bg-dark vh-100 d-none d-md-flex flex-column p-0">
    <Sidebar />
  </aside>
);




/*
  +---------------------------------------------+
  | Mobile Sidebar                              |
  +---------------------------------------------+
 */


export const MobileSidebar = React.forwardRef(({ closeOffcanvas }, ref) => (
  <div className="offcanvas offcanvas-start offcanvas-fullscreen bg-dark text-light" tabIndex="-1" id="offcanvasAdminSidebar" ref={ref}>
    <div className="offcanvas-header border-0">
      <h5 className="offcanvas-title">Admin Menu</h5>
      <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas"></button>
    </div>
    <div className="offcanvas-body p-0">
      <Sidebar onLinkClick={closeOffcanvas} />
    </div>
  </div>
));