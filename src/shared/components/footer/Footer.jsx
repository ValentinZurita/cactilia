export const Footer = () => {
  return (
    <footer className="bg-green-3 text-white py-4">
      <div className="container text-center text-md-start">
        <div className="row">
          {/* Sección de información */}
          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase fw-bold">Sobre Nosotros</h5>
            <p className="text-sm">
              Cactilia es tu mejor opción para productos frescos y ecológicos. Síguenos en nuestras redes.
            </p>
          </div>

          {/* Sección de links rápidos */}
          <div className="col-md-4 mb-3">
            <h5 className="text-uppercase fw-bold">Enlaces Rápidos</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white text-sm">Inicio</a></li>
              <li><a href="#" className="text-white text-sm">Tienda</a></li>
              <li><a href="#" className="text-white text-sm">Contacto</a></li>
              <li><a href="#" className="text-white text-sm">Política de Privacidad</a></li>
            </ul>
          </div>

          {/* Sección de redes sociales */}
          <div className="col-md-4 mb-3 text-center">
            <h5 className="text-uppercase fw-bold">Síguenos</h5>
            <a href="#" className="text-white mx-2"><i className="bi bi-facebook fs-3"></i></a>
            <a href="#" className="text-white mx-2"><i className="bi bi-instagram fs-3"></i></a>
            <a href="#" className="text-white mx-2"><i className="bi bi-twitter fs-3"></i></a>
          </div>
        </div>
      </div>

      <div className="text-center mt-3 text-sm">
        &copy; 2025 Cactilia - Todos los derechos reservados.
      </div>
    </footer>
  );
};