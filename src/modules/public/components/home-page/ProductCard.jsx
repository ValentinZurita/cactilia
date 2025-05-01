import React from 'react'; // Import React
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

/**
 * ProductCard Component
 *
 * Muestra imagen y nombre de producto/categoría.
 * Si se proporciona onCardClick, lo ejecuta al hacer clic.
 *
 * Props:
 * @param {string} name - Nombre del producto o categoría
 * @param {string} image - URL de la imagen
 * @param {string} id - ID único del producto o categoría
 * @param {boolean} [isCategory=false] - Indica si es una categoría
 * @param {function} [onCardClick] - Función a llamar al hacer clic, recibe el objeto producto/categoría.
 * @param {object} [productData] - Objeto completo con los datos del producto/categoría (para pasar a onCardClick)
 */
export const ProductCard = React.memo(({
                              name,
                              image,
                              id,
                              isCategory = false,
                              onCardClick,
                              productData // Recibe el objeto completo
                            }) => {

  const handleCardClick = () => {
    if (onCardClick && productData) {
      // Llama a la función pasada como prop con todos los datos disponibles
      onCardClick(productData);
    } else {
      // Comportamiento por defecto si no hay onCardClick (o no hay productData)
      // Podría ser no hacer nada, o registrar un aviso.
      console.warn('ProductCard clicked without onCardClick handler or productData.');
    }
  };

  // Ya no se usa Link, ahora es un div clickeable si onCardClick existe
  return (
    <div 
      className="text-decoration-none" 
      onClick={onCardClick ? handleCardClick : undefined} // Añade onClick solo si existe la prop
      style={{ cursor: onCardClick ? 'pointer' : 'default' }} // Cambia cursor si es clickeable
      role={onCardClick ? 'button' : undefined} // Rol semántico
      tabIndex={onCardClick ? 0 : undefined} // Hacer enfocable si es clickeable
      onKeyPress={onCardClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined} // Permitir activación con teclado
    >
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
    </div>
  );
});

// Optional: Add display name for React DevTools
ProductCard.displayName = 'ProductCard';