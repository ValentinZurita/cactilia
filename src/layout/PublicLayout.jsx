import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/components/Navbar.jsx";
import { Footer } from "../shared/components/footer/Footer.jsx";
import "../../src/styles/publicLayout.css";

export const PublicLayout = () => {
  return (
    <div className="public-layout">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};