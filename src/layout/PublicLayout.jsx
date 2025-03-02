// Example of how to integrate GlobalMessages in your PublicLayout.jsx

import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/components/Navbar.jsx";
import { Footer } from "../shared/components/footer/Footer.jsx";
import "../../src/styles/publicLayout.css";
import { GlobalMessages } from '../modules/user/components/shared/index.js'

export const PublicLayout = () => {
  return (
    <div className="public-layout">

      {/* Fixed notification container for global messages */}
      <GlobalMessages />

      {/* Regular layout content */}
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};