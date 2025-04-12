/**
 * Cart service for managing cart-related operations
 */

/**
 * Get cart items from local storage or API
 * @returns {Promise<Array>} Cart items
 */
export const getCartItems = async () => {
  try {
    // In a real app, this might fetch from an API
    const storedCart = localStorage.getItem('cart');
    
    if (storedCart) {
      return JSON.parse(storedCart);
    }
    
    // Return mock items if nothing in storage
    return mockCartItems;
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return mockCartItems; // Fallback to mock data
  }
};

/**
 * Add item to cart
 * @param {Object} item Item to add
 * @returns {Promise<Array>} Updated cart items
 */
export const addToCart = async (item) => {
  try {
    // Get current cart
    let cart = await getCartItems();
    
    // Check if item already exists
    const existingItemIndex = cart.findIndex(cartItem => 
      cartItem.id === item.id
    );
    
    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      cart[existingItemIndex].quantity += item.quantity || 1;
    } else {
      // Add new item
      cart.push({
        ...item,
        quantity: item.quantity || 1
      });
    }
    
    // Save to storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return cart;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw new Error('Failed to add item to cart');
  }
};

/**
 * Update cart item
 * @param {string} itemId Item ID to update
 * @param {Object} updates Updates to apply
 * @returns {Promise<Array>} Updated cart items
 */
export const updateCartItem = async (itemId, updates) => {
  try {
    let cart = await getCartItems();
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    // Apply updates
    cart[itemIndex] = {
      ...cart[itemIndex],
      ...updates
    };
    
    // Save to storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return cart;
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw new Error('Failed to update item in cart');
  }
};

/**
 * Remove item from cart
 * @param {string} itemId Item ID to remove
 * @returns {Promise<Array>} Updated cart items
 */
export const removeFromCart = async (itemId) => {
  try {
    let cart = await getCartItems();
    
    // Filter out the item
    cart = cart.filter(item => item.id !== itemId);
    
    // Save to storage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    return cart;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
};

/**
 * Clear the entire cart
 * @returns {Promise<Array>} Empty cart
 */
export const clearCart = async () => {
  try {
    // Save empty cart to storage
    localStorage.setItem('cart', JSON.stringify([]));
    
    return [];
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};

/**
 * Mock cart items for development and testing
 */
const mockCartItems = [
  {
    id: 'product-1',
    name: 'Premium T-shirt',
    price: 29.99,
    quantity: 2,
    image: 'https://example.com/t-shirt.jpg'
  },
  {
    id: 'product-2',
    name: 'Designer Jeans',
    price: 89.99,
    quantity: 1,
    image: 'https://example.com/jeans.jpg'
  },
  {
    id: 'product-3',
    name: 'Casual Sneakers',
    price: 59.99,
    quantity: 1,
    image: 'https://example.com/sneakers.jpg'
  }
]; 