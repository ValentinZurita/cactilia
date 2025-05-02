/**
 * New Shipping Module for Checkout
 * Optimized implementation for the Cactilia e-commerce platform
 */

import React from 'react'
import PropTypes from 'prop-types'
import { ShippingOptionsContainer } from './components/index.js'
import { useShipping } from './hooks/index.js'

/**
 * Main shipping component for integration into the checkout flow
 *
 * @param {Object} props - Component props
 * @param {Array} props.cartItems - Items in the cart
 * @param {Object} props.selectedAddress - Selected shipping address
 * @param {Function} props.onShippingOptionSelected - Callback when a shipping option is selected
 * @returns {JSX.Element} The shipping component
 */
const NewShipping = ({
                       cartItems = [],
                       selectedAddress = null,
                       onShippingOptionSelected = () => {
                       },
                     }) => {
  // Use the shipping hook to handle all shipping logic
  const {
    loading,
    error,
    availableOptions,
    selectedOption,
    selectShippingOption,
    ineligibleProducts,
    isAddressComplete,
  } = useShipping(cartItems, selectedAddress)

  // Handle shipping option selection
  const handleOptionSelect = (option) => {
    selectShippingOption(option)
    onShippingOptionSelected(option)
  }

  return (
    <ShippingOptionsContainer
      loading={loading}
      error={error}
      availableOptions={availableOptions}
      selectedOption={selectedOption}
      ineligibleProducts={ineligibleProducts}
      onOptionSelect={handleOptionSelect}
      isAddressComplete={isAddressComplete}
    />
  )
}

NewShipping.propTypes = {
  cartItems: PropTypes.array.isRequired,
  selectedAddress: PropTypes.object,
  onShippingOptionSelected: PropTypes.func,
}

// Export all components and utilities
export { useShipping } from './hooks/index.js'
export {
  ShippingOptionsContainer,
  ShippingOption,
  ShippingWarning,
} from './components/index.js'

export * from './utils/index.js'

// Default export is the main component
export default NewShipping