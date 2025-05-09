import React from 'react';
import { ProductCard } from './ProductCard.jsx';

export const ProductList = ({ products = [], onProductClick }) => {
  console.log('[ProductList] Rendering with products:', products);
  if (products.length === 0) {
    return <p className="text-center mt-4">No se encontraron productos.</p>;
  }

  return (
    <div className="container">
      <div className="row justify-content-start">
        {products.map((prod) => (
          <div key={prod.id} className="col-6 col-md-4 col-lg-3 mb-4">
            <ProductCard product={prod} onProductClick={onProductClick} />
          </div>
        ))}
      </div>
    </div>
  );
};