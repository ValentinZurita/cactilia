import { AboutUs, ContactInfo, QuickLinks, SocialMediaLinks } from './index.js'

export const Footer = () => {
  return (
    <footer className="bg-green-3 text-white py-5">
      <div className="container text-md-start text-center text-sm-start">
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          <AboutUs />
          <QuickLinks />
          <ContactInfo />
          <SocialMediaLinks />
        </div>
      </div>
      <div className="text-center mt-3 text-sm">
        &copy; 2025 Cactilia - Todos los derechos reservados.
      </div>
    </footer>
  );
};