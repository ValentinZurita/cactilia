import {
  setLoading,
  setError,
  addToCart,
  setCartItems,
  removeFromCart,
  incrementQuantity,
  decrementQuantity,
  clearCart
} from './cartSlice';
import { deleteCart, getCart, saveCart } from '../../modules/shop/services/cartServices.js'


// Sync cart with Firestore (only for authenticated users)
export const syncCartWithFirestore = () => async (dispatch, getState) => {
  const { auth, cart } = getState();

  // Only sync if user is authenticated
  if (auth.status !== 'authenticated' || !auth.uid) return;

  try {
    dispatch(setLoading(true));

    // Save cart to Firestore
    const result = await saveCart(auth.uid, cart.items);

    if (!result.ok) {
      throw new Error(result.error);
    }

  } catch (error) {
    console.error('Error syncing cart with Firestore:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Load cart from Firestore (when user logs in)
export const loadCartFromFirestore = () => async (dispatch, getState) => {
  const { auth } = getState();

  // Only load if user is authenticated
  if (auth.status !== 'authenticated' || !auth.uid) return;

  try {
    dispatch(setLoading(true));

    // Get cart from Firestore
    const result = await getCart(auth.uid);

    if (!result.ok) {
      throw new Error(result.error);
    }

    // Update Redux state with cart items
    if (result.data && Array.isArray(result.data.items)) {
      dispatch(setCartItems(result.data.items));
    }

  } catch (error) {
    console.error('Error loading cart from Firestore:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Add to cart and sync with Firestore
export const addToCartWithSync = (product, quantity) => async (dispatch, getState) => {
  // First add to local Redux state
  dispatch(addToCart({ product, quantity }));

  // Then sync with Firestore if user is authenticated
  dispatch(syncCartWithFirestore());
};

// Remove from cart and sync with Firestore
export const removeFromCartWithSync = (productId) => async (dispatch, getState) => {
  dispatch(removeFromCart(productId));
  dispatch(syncCartWithFirestore());
};

// Increment quantity and sync with Firestore
export const incrementQuantityWithSync = (productId) => async (dispatch, getState) => {
  dispatch(incrementQuantity(productId));
  dispatch(syncCartWithFirestore());
};

// Decrement quantity and sync with Firestore
export const decrementQuantityWithSync = (productId) => async (dispatch, getState) => {
  dispatch(decrementQuantity(productId));
  dispatch(syncCartWithFirestore());
};

// Clear cart and sync with Firestore
export const clearCartWithSync = () => async (dispatch, getState) => {
  dispatch(clearCart());

  // If authenticated, delete cart from Firestore
  const { auth } = getState();
  if (auth.status === 'authenticated' && auth.uid) {
    try {
      await deleteCart(auth.uid);
    } catch (error) {
      console.error('Error deleting cart from Firestore:', error);
    }
  }
};

// Merge guest cart with user cart when logging in
export const mergeCartsOnLogin = () => async (dispatch, getState) => {
  const { auth, cart } = getState();

  // Only proceed if user is authenticated and has items in guest cart
  if (auth.status !== 'authenticated' || !auth.uid || cart.items.length === 0) return;

  try {
    dispatch(setLoading(true));

    // Get user's existing cart from Firestore
    const result = await getCart(auth.uid);

    if (!result.ok) {
      throw new Error(result.error);
    }

    // Merge carts
    const existingItems = result.data?.items || [];
    const guestItems = cart.items;

    // Simple merge strategy: Keep both and handle duplicates
    // You could implement a more sophisticated merge strategy if needed
    const mergedItems = [...existingItems];

    guestItems.forEach(guestItem => {
      const existingItemIndex = mergedItems.findIndex(item => item.id === guestItem.id);

      if (existingItemIndex >= 0) {
        // Item already exists, add quantities
        mergedItems[existingItemIndex].quantity += guestItem.quantity;
      } else {
        // New item, add to merged items
        mergedItems.push(guestItem);
      }
    });

    // Update Redux state with merged items
    dispatch(setCartItems(mergedItems));

    // Save merged cart to Firestore
    await saveCart(auth.uid, mergedItems);

  } catch (error) {
    console.error('Error merging carts:', error);
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};