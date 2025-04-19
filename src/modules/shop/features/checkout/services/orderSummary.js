import firebase from 'firebase/app';
import 'firebase/firestore';

const db = firebase.firestore();

/**
 * Genera un resumen completo del pedido antes de finalizar la compra
 * @param {Object} cart - Carrito de compras con ítems y subtotales
 * @param {Object} user - Datos del usuario que realiza la compra
 * @param {Object} shippingAddress - Dirección de envío seleccionada
 * @param {Object} shippingMethod - Método de envío seleccionado
 * @param {Object} paymentMethod - Método de pago seleccionado
 * @returns {Promise<Object>} - Objeto con el resumen completo del pedido
 * @throws {Error} - Si hay errores en los parámetros o en la generación del resumen
 */
export const generateOrderSummary = async (
  cart,
  user,
  shippingAddress,
  shippingMethod,
  paymentMethod
) => {
  // Validar parámetros requeridos
  if (!cart || !Array.isArray(cart.items)) {
    throw new Error("Se requiere un carrito con ítems");
  }
  
  if (!user) {
    throw new Error("Se requieren datos del usuario");
  }
  
  if (!shippingAddress) {
    throw new Error("Se requiere dirección de envío");
  }
  
  if (!shippingMethod) {
    throw new Error("Se requiere método de envío");
  }
  
  if (!paymentMethod) {
    throw new Error("Se requiere método de pago");
  }
  
  // Verificar que el carrito no esté vacío
  if (cart.items.length === 0) {
    throw new Error("El carrito no tiene productos");
  }
  
  try {
    // Verificar disponibilidad y obtener datos actualizados de productos
    const productPromises = cart.items.map(async (item) => {
      const productDoc = await db.collection("products").doc(item.productId).get();
      
      if (!productDoc.exists) {
        return {
          ...item,
          available: false,
          availabilityMessage: "Producto no encontrado"
        };
      }
      
      const productData = productDoc.data();
      
      // Verificar stock
      const isAvailable = productData.stock >= item.quantity;
      
      return {
        ...item,
        name: productData.name,
        price: productData.price,
        image: productData.image || item.image,
        subtotal: item.quantity * productData.price,
        available: isAvailable,
        availabilityMessage: !isAvailable ? "Producto sin stock" : null
      };
    });
    
    const items = await Promise.all(productPromises);
    
    // Calcular si hay productos no disponibles
    const hasUnavailableItems = items.some(item => !item.available);
    
    // Calcular totales
    const subtotal = cart.subtotal;
    const shipping = shippingMethod.price;
    const discount = cart.discount || 0;
    const tax = Math.round(subtotal * 0.16); // Impuesto ejemplo del 16%
    const total = subtotal + shipping + tax - discount;
    
    // Formatear información de pago
    let paymentDisplay = "";
    if (paymentMethod.type === "credit_card") {
      paymentDisplay = `Tarjeta terminada en ${paymentMethod.last4}`;
    } else if (paymentMethod.type === "paypal") {
      paymentDisplay = `PayPal (${paymentMethod.email})`;
    } else {
      paymentDisplay = "Método de pago seleccionado";
    }
    
    // Generar número de orden
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Crear resumen final
    const orderSummary = {
      orderNumber,
      date: new Date(),
      customer: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      items,
      shipping: {
        address: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode,
          country: shippingAddress.country,
          recipient: shippingAddress.recipient,
          phone: shippingAddress.phone
        },
        method: shippingMethod.name,
        cost: shippingMethod.price,
        estimatedDelivery: shippingMethod.estimatedDelivery
      },
      payment: {
        method: paymentDisplay,
        id: paymentMethod.id
      },
      totals: {
        subtotal,
        shipping,
        tax,
        discount,
        total
      },
      hasUnavailableItems
    };
    
    // Añadir información de cupón si existe
    if (cart.couponCode) {
      orderSummary.coupon = cart.couponCode;
    }
    
    return orderSummary;
  } catch (error) {
    console.error("Error al generar resumen del pedido:", error);
    throw new Error("No se pudo generar el resumen del pedido");
  }
}; 