import { Link } from 'react-router-dom';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

/**
 * ProductCard Component
 *
 * Un componente reutilizable que muestra una imagen y nombre de producto/categoría
 * con funcionalidad de navegación al hacer clic y efecto hover sutil.
 *
 * Features:
 * - Muestra una imagen con proporción cuadrada
 * - Al hacer clic, navega a la página de tienda con los filtros apropiados
 * - Efecto hover sutil sin etiquetas adicionales
 * - Soporta tanto productos como categorías con la misma interfaz visual
 *
 * Props:
 * @param {string} name - Nombre del producto o categoría
 * @param {string} image - URL de la imagen
 * @param {string} id - ID único del producto o categoría
 * @param {boolean} isCategory - Indica si es una categoría (true) o un producto (false)
 */
export const ProductCard = ({ name, image, id, isCategory = false }) => {
  // Determinar la URL de destino en función de si es producto o categoría
  const linkTo = isCategory
    ? `/shop?category=${id}`
    : `/shop?product=${id}`;

  return (
    <Link to={linkTo} className="text-decoration-none">
      <div className="border-0 text-center p-2 mx-2 bg-transparent product-card-container">
        {/* Contenedor de imagen con efecto hover */}
        <div
          className="rounded overflow-hidden mx-auto d-flex justify-content-center align-items-center position-relative"
          style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1' }}
        >
          {/* <img
            src={image}
            className="img-fluid object-fit-cover w-100 h-100 rounded-3 transition-all"
            alt={name}
            style={{ transition: 'transform 0.3s ease' }}
          /> */}
          <ImageComponent
            src={image}
            alt={name}
            className="img-fluid object-fit-cover w-100 h-100 rounded-3 transition-all"
            style={{ transition: 'transform 0.3s ease' }}
          />

          {/* Overlay sutil con efecto hover (sin texto) */}
          <div
            className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10 d-flex justify-content-center align-items-center opacity-0 hover-overlay"
            style={{ transition: 'opacity 0.3s ease' }}
          ></div>
        </div>

        {/* Nombre del producto o categoría */}
        <div className="mt-2">
          <p className="text-muted text-green my-2">{name}</p>
        </div>
      </div>
    </Link>
  );
};