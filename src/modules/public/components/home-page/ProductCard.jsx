import React from 'react';
import { ImageComponent } from '../../../../shared/components/images/ImageComponent.jsx';

/**
 * ProductCard Component (Original Simple Version)
 *
 * Muestra imagen y nombre de producto/categoría.
 * Si se proporciona onCardClick, lo ejecuta al hacer clic.
 *
 * Props:
 * @param {string} name - Nombre del producto o categoría
 * @param {string} image - URL de la imagen
 * @param {string} id - ID único del producto o categoría (usado como key, no para lógica interna)
 * @param {boolean} [isCategory=false] - Indica si es una categoría (informativo, no afecta click)
 * @param {function} [onCardClick] - Función a llamar al hacer clic, recibe el objeto producto/categoría.
 * @param {object} [productData] - Objeto completo con los datos del producto/categoría (para pasar a onCardClick)
 */
export const ProductCard = React.memo(({
                                      name,
                                      image,
                                      id,
                                      isCategory = false, // Prop mantenida pero no usada para click
                                      onCardClick,
                                      productData
                                    }) => {

  // Handler simple: solo se ejecuta si onCardClick está definido
  const handleCardClick = () => {
    if (onCardClick && productData) {
      onCardClick(productData);
    } else if (onCardClick) {
        console.warn('ProductCard clicked with onCardClick but no productData provided.');
        // Podría llamarse sin argumentos si se decide que es válido
        // onCardClick(); 
    } 
    // Si no hay onCardClick, no hace nada al hacer clic.
  };

  // Contenido interno de la tarjeta (sin cambios visuales)
  const cardContent = (
    <div className="border-0 text-center p-2 mx-2 bg-transparent product-card-container">
      <div
        className="rounded overflow-hidden mx-auto d-flex justify-content-center align-items-center position-relative"
        style={{ width: '100%', maxWidth: '220px', aspectRatio: '1 / 1' }}
      >
        <ImageComponent
          src={image}
          alt={name}
          className="img-fluid object-fit-cover w-100 h-100 rounded-3 transition-all"
          style={{ transition: 'transform 0.3s ease' }}
        />
        <div
          className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-10 d-flex justify-content-center align-items-center opacity-0 hover-overlay"
          style={{ transition: 'opacity 0.3s ease' }}
        ></div>
      </div>
      <div className="mt-2">
        <p className="text-muted text-green my-2">{name}</p>
      </div>
    </div>
  );

  // Renderizar un div. Solo es clickeable si se proporciona onCardClick.
  return (
    <div 
      className="text-decoration-none" 
      onClick={onCardClick ? handleCardClick : undefined} // onClick solo si existe onCardClick
      style={{ cursor: onCardClick ? 'pointer' : 'default' }} // cursor solo si es clickeable
      role={onCardClick ? 'button' : undefined} // role solo si es clickeable
      tabIndex={onCardClick ? 0 : undefined} // tabIndex solo si es clickeable
      onKeyPress={onCardClick ? (e) => e.key === 'Enter' && handleCardClick() : undefined} // onKeyPress solo si es clickeable
    >
      {cardContent}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';