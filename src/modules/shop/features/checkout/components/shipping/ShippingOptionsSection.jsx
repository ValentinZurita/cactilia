import React, { useCallback } from 'react';

const ShippingOptionsSection = () => {
  const handleCombinationsCalculated = useCallback((combinations) => {
    console.log("Shipping combinations calculated:", combinations);
    setHasShippableProducts(true);
    
    if (combinations && combinations.length > 0) {
      setNoOptionsAvailable(false);
      setShippingCombinations(combinations);
      onShippingOptionsAvailable(combinations, []);
    } else {
      console.warn("No shipping options available for this address");
      setNoOptionsAvailable(true);
      setShippingCombinations([]);
      
      // Si no hay opciones, marcar todos los productos como no enviables
      if (products && products.length > 0) {
        const allNonShippableProducts = [...products];
        console.log("Marking all products as non-shippable:", allNonShippableProducts);
        onShippingOptionsAvailable([], allNonShippableProducts);
      }
      
      // Mostrar un mensaje de error específico
      setShippingError(`No hay opciones de envío disponibles para la dirección seleccionada.
       Por favor, intente con otra dirección o contacte a servicio al cliente.`);
    }
  }, [products, onShippingOptionsAvailable]);

  return (
    <div>
      {shippingError && !loadingOptions && (
        <div className="alert alert-danger" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Error:</strong> {shippingError.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < shippingError.split('\n').length - 1 && <br />}
                </span>
              ))}
              {noOptionsAvailable && (
                <div className="mt-2">
                  <p className="mb-1">Sugerencias:</p>
                  <ul className="pl-3 mb-0">
                    <li>Verifica que la dirección esté completa y correcta</li>
                    <li>Prueba con otra dirección de envío</li>
                    <li>Contacta a servicio al cliente para asistencia</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingOptionsSection; 