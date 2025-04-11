/**
 * ShippingService - Servicio para gestionar opciones de envío
 * 
 * Este servicio es un reemplazo simplificado del ShippingService original
 * que implementa solo las funciones necesarias para el checkout.
 */

import { getActiveShippingZones, getShippingZonesForPostalCode } from './ShippingZonesService';
import { findBestShippingOptions } from './ShippingRulesEngine';
import { findBestShippingOptionsGreedy } from './ShippingRulesGreedy';

/**
 * Main ShippingService to coordinate shipping functionality
 */
class ShippingService {
  /**
   * Get all available shipping options for a cart and address
   * @param {Array} cartItems - Cart items with product information
   * @param {Object} addressInfo - User's address information
   * @param {Boolean} useGreedy - Use the Greedy algorithm for optimization (default: true)
   * @returns {Promise<Array>} - Array of shipping options organized for display
   */
  async getShippingOptions(cartItems, addressInfo, useGreedy = true) {
    try {
      if (!cartItems?.length) {
        console.log('⚠️ No cart items provided');
        return [];
      }

      // Normalize address format
      let postalCode = addressInfo?.postalCode || addressInfo?.zip || addressInfo?.zipcode || '';
      if (!postalCode) {
        console.log('⚠️ No postal code provided in address:', addressInfo);
        throw new Error('Se requiere un código postal para calcular opciones de envío');
      }

      // Normalizar código postal
      postalCode = postalCode.toString().trim().replace(/[-\s]/g, '');
      
      const normalizedAddress = {
        ...addressInfo,
        postalCode,
        state: addressInfo?.state || addressInfo?.provincia || addressInfo?.estado || '',
        city: addressInfo?.city || addressInfo?.ciudad || addressInfo?.localidad || '',
        zip: postalCode
      };

      // Obtener reglas de envío activas
      const shippingRules = await getActiveShippingZones();
      
      if (!shippingRules || shippingRules.length === 0) {
        console.warn('⚠️ No se encontraron reglas de envío activas');
        return this.createFallbackOption(cartItems);
      }
      
      // Calcular información de pesos para cada producto
      const cartItemsWithWeights = cartItems.map(item => {
        const product = item.product || item;
        let weight = parseFloat(product.weight || product.peso || 0);
        
        // Si el producto no tiene peso definido, asignar uno estimado según categoría
        if (weight === 0) {
          // Intentar estimar el peso por categoría o nombre
          const name = (product.name || product.title || '').toLowerCase();
          const category = (product.category || product.categoria || '').toLowerCase();
          
          if (name.includes('libro') || category.includes('libro') || 
              name.includes('book') || category.includes('book')) {
            weight = 0.7; // Libros: estimado 700g
          } else if (name.includes('ropa') || category.includes('ropa') ||
                    name.includes('camiseta') || name.includes('pantalon') ||
                    category.includes('clothing') || category.includes('apparel')) {
            weight = 0.3; // Ropa: estimado 300g
          } else if (name.includes('bebida') || name.includes('cerveza') || 
                    category.includes('bebida') || name.includes('drink')) {
            weight = 0.5; // Bebidas: estimado 500g
          } else if (name.includes('accesorio') || category.includes('accesorio') ||
                    name.includes('gorro') || name.includes('sombrero')) {
            weight = 0.2; // Accesorios: estimado 200g
          } else if (name.includes('gotas') || name.includes('suplemento') ||
                    name.includes('vitamina') || name.includes('medicina')) {
            weight = 0.1; // Productos pequeños: estimado 100g
          } else {
            weight = 0.5; // Peso genérico: 500g
          }
          
          console.log(`ℹ️ Producto sin peso definido: "${name}". Asignando estimado de ${weight}kg`);
        }
        
        return {
          ...item,
          product: {
            ...product,
            weight: weight
          }
        };
      });
      
      // Calcular peso total para información
      const totalCartWeight = cartItemsWithWeights.reduce(
        (sum, item) => sum + (item.product.weight * (item.quantity || 1)), 0
      );
      console.log(`📦 Peso total del carrito: ${totalCartWeight.toFixed(2)}kg`);
      
      let result;
      
      // Usar el algoritmo Greedy para optimizar paquetes o el algoritmo normal
      if (useGreedy) {
        console.log('🧮 Usando algoritmo Greedy para optimizar paquetes de envío');
        result = await findBestShippingOptionsGreedy(cartItemsWithWeights, normalizedAddress, shippingRules);
      } else {
        console.log('🧮 Usando algoritmo standard para calcular opciones de envío');
        result = await findBestShippingOptions(cartItemsWithWeights, normalizedAddress, shippingRules);
      }
      
      if (!result.success || !result.options || result.options.length === 0) {
        console.warn('⚠️ No se encontraron opciones de envío válidas');
        return this.createFallbackOption(cartItemsWithWeights);
      }
      
      // Asegurar que todos los paquetes tengan productos asignados
      this.ensurePackagesHaveProducts(result.options, cartItemsWithWeights);
      
      return result.options;
    } catch (error) {
      console.error('Error getting shipping options:', error);
      return this.createFallbackOption(cartItems);
    }
  }
  
  /**
   * Asegura que todos los paquetes tengan productos asignados
   * @param {Array} options - Opciones de envío
   * @param {Array} cartItems - Items del carrito
   */
  ensurePackagesHaveProducts(options, cartItems) {
    if (!options || !cartItems || cartItems.length === 0) return;
    
    console.log('🔧 Verificando y corrigiendo paquetes vacíos...');
    
    options.forEach(option => {
      // Obtener el peso máximo por paquete de las reglas o usar 1kg como valor predeterminado
      const maxPackageWeight = option.maxPackageWeight || 1; // 1 kg es común para servicios básicos
      console.log(`📦 Peso máximo por paquete para opción ${option.name || 'sin nombre'}: ${maxPackageWeight}kg`);
      
      // Obtener restricción de productos por paquete
      const maxProductsPerPackage = option.maximo_productos_por_paquete || 1; // Default a 1 si no se especifica
      console.log(`📦 Máximo productos por paquete: ${maxProductsPerPackage}`);
      
      // Guardar este valor para referencia
      option.maxProductsPerPackage = maxProductsPerPackage;
      
      // Si la opción no tiene paquetes, crearlos
      if (!option.packages || option.packages.length === 0) {
        console.log(`🆕 Creando paquetes para opción ${option.name || 'sin nombre'}`);
        
        // Calcular peso total del carrito
        const totalWeight = cartItems.reduce((sum, item) => {
          const product = item.product || item;
          const weight = parseFloat(product.weight || product.peso || 0);
          const quantity = parseInt(item.quantity || 1);
          return sum + (weight * quantity);
        }, 0);
        
        // Si se permite solo un producto por paquete, crear paquetes individuales
        if (maxProductsPerPackage === 1) {
          const packages = [];
          
          // Crear un paquete por cada producto
          cartItems.forEach((item, index) => {
            const product = item.product || item;
            const weight = parseFloat(product.weight || product.peso || 0);
            // Asignar el precio base completo a cada paquete, no dividirlo
            const pricePerPackage = option.price; // Precio base completo por paquete
            
            packages.push({
              id: `pkg-${index}-${Date.now()}`,
              name: `Paquete ${index + 1}`,
              price: pricePerPackage, // Precio base completo
              products: [item],
              productCount: 1,
              packageWeight: weight
            });
          });
          
          option.packages = packages;
          option.totalWeight = packages.reduce((sum, pkg) => sum + pkg.packageWeight, 0);
          option.packageCount = packages.length;
          // Actualizar el precio total como la suma de todos los paquetes
          option.price = option.packageCount * option.price;
          
          // Asegurarse de que la opción tiene todos los productos
          option.products = [...cartItems];
          
          // Añadir propiedades para indicar que cubre todos los productos
          option.coversAllProducts = true;
          option.productIds = cartItems.map(item => {
            const product = item.product || item;
            return product.id;
          });
        } else {
          // Paquete único con todos los productos si no hay restricción específica
          option.packages = [{
            id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: 'Paquete único',
            price: option.price || 0,
            products: [...cartItems],
            productCount: cartItems.length,
            packageWeight: totalWeight
          }];
          
          option.totalWeight = totalWeight;
          option.packageCount = 1;
          
          // Asegurarse de que la opción tiene todos los productos
          option.products = [...cartItems];
          
          // Añadir propiedades para indicar que cubre todos los productos
          option.coversAllProducts = true;
          option.productIds = cartItems.map(item => {
            const product = item.product || item;
            return product.id;
          });
        }
        
        return; // Continuar con la siguiente opción
      }
      
      // FUERZA LA ASIGNACIÓN DE PRODUCTOS: Primero, asegúrate de que cada opción tenga una lista de productos
      if (!option.products || option.products.length === 0) {
        option.products = [...cartItems];
        
        // Añadir propiedades para indicar que cubre todos los productos
        option.coversAllProducts = true;
        option.productIds = cartItems.map(item => {
          const product = item.product || item;
          return product.id;
        });
      }
      
      // Verificar si hay paquetes vacíos
      const emptyPackages = option.packages.filter(pkg => 
        (!pkg.products || pkg.products.length === 0) || 
        pkg.packageWeight === 0 || 
        pkg.productCount === 0
      );
      
      // Si hay paquetes vacíos o todos los paquetes están vacíos, redistribuir productos
      if (emptyPackages.length > 0) {
        console.log(`⚠️ Detectados ${emptyPackages.length} paquetes vacíos en opción ${option.name || 'sin nombre'}`);

        // Si solo se permite un producto por paquete, redistribuir apropiadamente
        if (maxProductsPerPackage === 1) {
          const packages = [];
          
          // Crear un paquete por cada producto
          cartItems.forEach((item, index) => {
            const product = item.product || item;
            const weight = parseFloat(product.weight || product.peso || 0);
            // Asignar el precio base completo a cada paquete, no dividirlo
            const pricePerPackage = option.price; // Precio base completo por paquete
            
            packages.push({
              id: `pkg-${index}-${Date.now()}`,
              name: `Paquete ${index + 1}`,
              price: pricePerPackage, // Precio base completo
              products: [item],
              productCount: 1,
              packageWeight: weight
            });
            
            console.log(`📦 Paquete ${index+1}: 1 producto - ${weight.toFixed(2)}kg - $${pricePerPackage}`);
          });
          
          option.packages = packages;
          option.packageCount = packages.length;
          // Actualizar el precio total como la suma de todos los paquetes
          option.price = option.packageCount * option.price;
          
          // Asegurarse de que la opción tiene todos los productos
          option.products = [...cartItems];
          
          // Añadir propiedades para indicar que cubre todos los productos
          option.coversAllProducts = true;
          option.productIds = cartItems.map(item => {
            const product = item.product || item;
            return product.id;
          });
        } else {
          // Distribuir productos equitativamente entre paquetes existentes
          const packageCount = option.packages.length;
          const itemsPerPackage = Math.ceil(cartItems.length / packageCount);
          
          // Redistribuir todos los productos equitativamente
          option.packages.forEach((pkg, index) => {
            const startIdx = index * itemsPerPackage;
            const endIdx = Math.min(startIdx + itemsPerPackage, cartItems.length);
            const packageProducts = cartItems.slice(startIdx, endIdx);
            
            // Asignar productos al paquete
            pkg.products = [...packageProducts];
            pkg.productCount = packageProducts.length;
            
            // Calcular peso total del paquete
            const packageWeight = packageProducts.reduce((sum, item) => {
              const product = item.product || item;
              const weight = parseFloat(product.weight || product.peso || 0);
              const quantity = parseInt(item.quantity || 1);
              return sum + (weight * quantity);
            }, 0);
            
            // Asignar peso al paquete
            pkg.packageWeight = packageWeight;
            
            // Distribuir precio proporcionalmente
            if (option.price) {
              pkg.price = Math.round((packageProducts.length / cartItems.length) * option.price);
            }
            
            console.log(`📦 Paquete ${index+1}: ${pkg.productCount} productos - ${pkg.packageWeight.toFixed(2)}kg - $${pkg.price}`);
          });
          
          // Asegurarse de que la opción tiene todos los productos
          option.products = [...cartItems];
          
          // Añadir propiedades para indicar que cubre todos los productos
          option.coversAllProducts = true;
          option.productIds = cartItems.map(item => {
            const product = item.product || item;
            return product.id;
          });
        }
        
        // Eliminar paquetes que no tengan productos asignados
        option.packages = option.packages.filter(pkg => 
          pkg.products && pkg.products.length > 0
        );
        
        // Actualizar contador de paquetes
        option.packageCount = option.packages.length;
        
        // Actualizar peso total
        option.totalWeight = option.packages.reduce((sum, pkg) => 
          sum + (pkg.packageWeight || 0), 0
        );
      }
    });
    
    // Verificación final de consistencia para cada opción
    options.forEach(option => {
      // Asegurar que cada opción tenga un peso total válido
      if (!option.totalWeight || option.totalWeight === 0) {
        const calculatedWeight = option.products?.reduce((sum, item) => {
          const product = item.product || item;
          const weight = parseFloat(product.weight || product.peso || 0);
          const quantity = parseInt(item.quantity || 1);
          return sum + (weight * quantity);
        }, 0) || 0;
        
        option.totalWeight = calculatedWeight;
      }
      
      // Asegurar que cada opción tenga un precio válido
      if (option.price === undefined || option.price === null) {
        option.price = option.packages.reduce((sum, pkg) => sum + (pkg.price || 0), 0) || 150;
      }
      
      // IMPORTANTE: Asegurar que cada paquete tenga productos
      if (option.packages) {
        option.packages.forEach(pkg => {
          if (!pkg.products || pkg.products.length === 0) {
            // Asignar al menos un producto a cada paquete vacío
            pkg.products = [...cartItems.slice(0, 1)];
            pkg.productCount = 1;
            
            // Actualizar peso
            const product = pkg.products[0].product || pkg.products[0];
            pkg.packageWeight = parseFloat(product.weight || product.peso || 0.5);
            
            // Asignar precio proporcional
            if (option.price && option.packages.length > 0) {
              pkg.price = Math.round(option.price / option.packages.length);
            }
          }
        });
      }
      
      // Validar que la suma de los precios de los paquetes sea igual al precio de la opción
      const totalPackagePrice = option.packages?.reduce((sum, pkg) => sum + (pkg.price || 0), 0) || 0;
      if (Math.abs(totalPackagePrice - option.price) > 5) { // Permitir una pequeña diferencia por redondeo
        console.log(`⚠️ Corrigiendo precios de paquetes para que sumen ${option.price} (actualmente: ${totalPackagePrice})`);
        
        // Distribuir el precio total entre los paquetes
        if (option.packages && option.packages.length > 0) {
          // Si solo hay un paquete, darle el precio total
          if (option.packages.length === 1) {
            option.packages[0].price = option.price;
          } else {
            // Distribuir proporcionalmente por peso
            const totalWeight = option.totalWeight || 0.1;
            option.packages.forEach(pkg => {
              const proportion = (pkg.packageWeight || 0.1) / totalWeight;
              pkg.price = Math.round(proportion * option.price);
            });
            
            // Ajustar el último paquete para compensar redondeos
            const newTotalPackagePrice = option.packages.reduce((sum, pkg) => sum + pkg.price, 0);
            const difference = option.price - newTotalPackagePrice;
            
            if (difference !== 0) {
              option.packages[option.packages.length - 1].price += difference;
            }
          }
        }
      }
    });
  }
  
  /**
   * Crea una opción de envío de respaldo para casos de error
   * @param {Array} cartItems - Productos en el carrito
   * @returns {Array} - Opciones de envío de respaldo
   */
  createFallbackOption(cartItems) {
    // Calcular peso total para mostrar en opción de respaldo
    const totalWeight = cartItems.reduce((sum, item) => {
      const product = item.product || item;
      const weight = parseFloat(product.weight || product.peso || 0);
      const quantity = parseInt(item.quantity || 1);
      return sum + (weight * quantity);
    }, 0);
    
    return [{
      id: `fallback-${Date.now()}`,
      name: 'Envío Especial',
      carrier: 'Servicio Integral',
      description: 'Envío especial para todos tus productos',
      type: 'nacional',
      minDays: 5,
      maxDays: 10,
      price: 950,
      productIds: cartItems.map(item => item.id || item.product?.id),
      coversAllProducts: true,
      isFallback: true,
      totalWeight: totalWeight,
      products: cartItems,
      // Crear un único paquete con todos los productos
      packages: [{
        id: `pkg-fallback-${Date.now()}`,
        name: 'Paquete único',
        price: 950,
        products: cartItems,
        productCount: cartItems.length,
        packageWeight: totalWeight
      }]
    }];
  }
  
  /**
   * Extract minimum days from delivery time string
   * @param {string} deliveryTime - Delivery time string (e.g., "3-5 días")
   * @returns {number} - Minimum days
   */
  extractMinDays(deliveryTime) {
    if (!deliveryTime) return 3; // default
    
    const match = deliveryTime.match(/(\d+)[-–](\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    
    const singleMatch = deliveryTime.match(/(\d+)/);
    if (singleMatch) {
      return parseInt(singleMatch[1]);
    }
    
    return 3; // default
  }
  
  /**
   * Extract maximum days from delivery time string
   * @param {string} deliveryTime - Delivery time string (e.g., "3-5 días")
   * @returns {number} - Maximum days
   */
  extractMaxDays(deliveryTime) {
    if (!deliveryTime) return 7; // default
    
    const match = deliveryTime.match(/(\d+)[-–](\d+)/);
    if (match) {
      return parseInt(match[2]);
    }
    
    const singleMatch = deliveryTime.match(/(\d+)/);
    if (singleMatch) {
      return parseInt(singleMatch[1]);
    }
    
    return 7; // default
  }
}

// Export as a singleton instance
const shippingService = new ShippingService();

// Export the getShippingOptions function for direct use
export const getShippingOptions = (cartItems, addressInfo, useGreedy = true) => {
  return shippingService.getShippingOptions(cartItems, addressInfo, useGreedy);
};

// Export for testing and extension
export { shippingService, ShippingService, getActiveShippingZones, getShippingZonesForPostalCode }; 