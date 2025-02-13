import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/components/Navbar.jsx";
import { Footer } from "../shared/components/footer/Footer.jsx";

export const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};