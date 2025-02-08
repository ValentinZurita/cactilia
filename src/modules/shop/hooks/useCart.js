
import { useCallback } from "react";

export const useCart = () => {
  const handleAddToCart = useCallback((product, quantity) => {
    console.log('Agregado al carrito:', product.title, 'Cantidad:', quantity);
    // Aquí se integrará Redux o Firebase
  }, []);

  return { handleAddToCart };
};