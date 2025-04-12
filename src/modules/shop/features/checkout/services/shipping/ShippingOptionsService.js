/**
 * Shipping Options Service
 * 
 * Bridge between the ShippingRulesEngine and the UI components.
 * Handles fetching rules from Firebase, processing them with the engine,
 * and formatting the results for display in the ShippingGroupSelector.
 */

import { findBestShippingOptions } from './ShippingRulesEngine';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Reference to Firestore shipping zones collection
const SHIPPING_ZONES_COLLECTION = 'zonas_envio';

/**
 * Fetches all active shipping zones from Firebase
 * @returns {Promise<Array>} - Array of shipping zone rules
 */
export const getShippingRules = async () => {
  try {
    const db = getFirestore();
    const shippingZonesRef = collection(db, SHIPPING_ZONES_COLLECTION);
    const activeZonesQuery = query(shippingZonesRef, where('activo', '==', true));
    
    const snapshot = await getDocs(activeZonesQuery);
    
    const rules = [];
    snapshot.forEach(doc => {
      rules.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`✅ Fetched ${rules.length} active shipping zones`);
    return rules;
  } catch (error) {
    console.error('Error fetching shipping zones:', error);
    return [];
  }
};

/**
 * Gets shipping options for the cart and address
 * @param {Array} cartItems - Cart items
 * @param {Object} userAddress - User's address
 * @param {Array} precalculatedOptions - Optional pre-calculated options
 * @returns {Promise<Array>} - Shipping options
 */
export const getShippingOptions = async (cartItems, userAddress, precalculatedOptions = []) => {
  try {
    // If we have precalculated options, use them instead of calculating new ones
    if (precalculatedOptions && precalculatedOptions.length > 0) {
      console.log('Using precalculated shipping options:', precalculatedOptions.length);
      return precalculatedOptions;
    }
    
    // Validate inputs
    if (!cartItems || !cartItems.length) {
      console.warn('No cart items provided to getShippingOptions');
      return [];
    }
    
    if (!userAddress) {
      console.warn('No address provided to getShippingOptions');
      return [];
    }
    
    // Fetch shipping rules from Firebase
    const shippingRules = await getShippingRules();
    
    if (!shippingRules || shippingRules.length === 0) {
      console.warn('No shipping rules found');
      return [];
    }
    
    // Use the shipping rules engine to find best options
    const result = await findBestShippingOptions(cartItems, userAddress, shippingRules);
    
    if (!result.success) {
      console.error('Error finding shipping options:', result.error);
      
      // No crear opciones de fallback - devolver array vacío para que la UI
      // muestre un mensaje apropiado al usuario
      return [];
    }
    
    // Return the formatted options
    return result.options;
  } catch (error) {
    console.error('Error in getShippingOptions:', error);
    
    // No devolver fallback - devolver array vacío
    return [];
  }
};

/**
 * Transforms shipping options to the format expected by the ShippingGroupSelector
 * @param {Array} options - Shipping options from the engine
 * @returns {Array} - Formatted shipping options for display
 */
export const transformOptionsForDisplay = (options) => {
  if (!options || !options.length) return [];
  
  // Transform each option to the expected format for ShippingGroupSelector
  return options.map(option => ({
    id: option.id,
    name: option.name,
    description: option.description,
    carrier: option.carrier,
    price: option.price,
    isFree: option.isFree || option.price === 0,
    minDays: option.minDays || 3,
    maxDays: option.maxDays || 7,
    freeShippingReason: option.freeReason,
    combination: option.combination,
    isFallback: option.isFallback || false,
    coversAllProducts: option.coversAllProducts || option.allProductsCovered || false,
    multiPackage: option.multiPackage || false,
    packageCount: option.packageCount || 1,
    zoneType: option.zoneType || option.zoneName || 'standard'
  }));
}; 