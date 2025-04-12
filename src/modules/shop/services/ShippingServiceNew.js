/**
 * Asegura que cada paquete tenga productos asignados
 * @private
 * @param {Object} combinationOptions
 * @param {Array<Product>} cartItems
 * @returns {Object} combinationOptions con productos asignados a los paquetes
 */
ensurePackagesHaveProducts(combinationOptions, cartItems) {
  if (!cartItems || cartItems.length === 0) return combinationOptions;
  
  // Iterar sobre cada combinación
  for (let i = 0; i < combinationOptions.length; i++) {
    const option = combinationOptions[i];
    
    // Si no hay paquetes definidos o no es un servicio con paquetes, continuar
    if (!option.packages || option.packages.length === 0) continue;
    
    // Determinar si estamos usando 1 producto por paquete
    const isOneProductPerPackage = option.maxProductsPerPackage === 1;
    
    // Si usamos 1 producto por paquete, asignar 1 producto a cada paquete
    if (isOneProductPerPackage) {
      // Asegurarse de que tengamos tantos paquetes como productos
      while (option.packages.length < cartItems.length) {
        // Clonar el primer paquete para tener las mismas propiedades
        const newPackage = { ...option.packages[0] };
        newPackage.products = [];
        option.packages.push(newPackage);
      }
      
      // Asignar cada producto a un paquete diferente
      for (let j = 0; j < cartItems.length; j++) {
        const product = cartItems[j];
        // Asegurarse de que el paquete tiene un array de productos
        if (!option.packages[j].products) {
          option.packages[j].products = [];
        }
        option.packages[j].products = [product];
        
        // Asignar el costo base completo a cada paquete 
        // Si no hay costBreakdown, asegurarse de que cada paquete tenga el precio base
        if (!option.costBreakdown) {
          option.packages[j].cost = option.baseCost || 0;
        }
      }
      
      // El costo total ahora será el costo base multiplicado por el número de paquetes
      if (!option.costBreakdown) {
        option.totalShippingCost = (option.baseCost || 0) * option.packages.length;
      }
    } else {
      // Caso normal: distribuir productos entre paquetes según su capacidad
      let productIndex = 0;
      
      // Iterar sobre cada paquete
      for (let j = 0; j < option.packages.length; j++) {
        const pkg = option.packages[j];
        // Asegurarse de que el paquete tenga un array de productos
        if (!pkg.products) {
          pkg.products = [];
        }
        
        // Determinar cuántos productos caben en este paquete
        const maxProducts = option.maxProductsPerPackage || 999;
        
        // Asignar productos hasta alcanzar el máximo o quedarnos sin productos
        for (let k = 0; k < maxProducts && productIndex < cartItems.length; k++) {
          pkg.products.push(cartItems[productIndex]);
          productIndex++;
        }
      }
    }
  }
  
  return combinationOptions;
}, 