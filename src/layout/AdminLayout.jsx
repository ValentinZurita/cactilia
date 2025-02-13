import { Outlet, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { DesktopSidebar, MobileNavbar, MobileSidebar } from '../modules/admin/components/dashboard/index.js'


/**
 *
 * Layout component for the admin panel.
 * This layout includes a sidebar and a main content area.
 *
 */


export const AdminLayout = () => {

  const navigate = useNavigate(); // hook to navigate between routes
  const offcanvasRef = useRef(null); // reference to the offcanvas sidebar


  // function to close the offcanvas sidebar
  const closeOffcanvas = () => {
    if (offcanvasRef.current) {
      const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasRef.current);
      bsOffcanvas?.hide();
    }
  };


  return (
    <div className="container-fluid">
      <div className="row">

        {/* Mobile Navbar */}
        <MobileNavbar navigate={navigate} />

        {/* Desktop Sidebar */}
        <DesktopSidebar />

        {/* Mobile Sidebar */}
        <MobileSidebar ref={offcanvasRef} closeOffcanvas={closeOffcanvas} />

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
          <Outlet />
        </main>

      </div>
    </div>
  );
};