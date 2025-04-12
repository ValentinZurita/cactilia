# Shipping Components

This directory contains the React components related to shipping functionality in the checkout process.

## Component Organization

- **Main Components**
  - `ShippingSelector.jsx` - Main component for shipping selection
  - `ShippingGroupSelector.jsx` - Component for selecting shipping options grouped by type
  - `ShippingOptionSelector.jsx` - Component for selecting individual shipping options

- **Styles**
  - All styles are located in the `styles/` directory
  - Main CSS file is `styles/shipping.css`

## Dependencies and Services

The components in this directory use centralized services from:
- `src/modules/shop/features/checkout/services/shipping/` - All shipping service functionality
- `src/modules/shop/features/checkout/utils/shippingUtils.js` - Utility functions
- `src/modules/shop/features/checkout/constants/ShippingConstants.js` - Constants

## Important Notes

1. The `services/` directory in this component folder is deprecated and will be removed in a future update. Please use the centralized services instead.

2. The components have been updated to use the centralized services. If you need to update a component, make sure to import from the centralized locations:

```jsx
// Correct imports
import { getShippingOptions } from '../../../services/shipping';
import { formatShippingCost } from '../../../utils/shippingUtils';
import { SHIPPING_TYPES } from '../../../constants/ShippingConstants';
```

3. All styles have been moved to the `styles/` directory for better organization.

## Current Structure

```
/shipping
├── README.md
├── components/              # Small specialized components
│   ├── CostBreakdown.jsx    # Shipping cost breakdown
│   ├── DiagnosticInfo.jsx   # Diagnostic information 
│   ├── ProductDetails.jsx   # Product details in shipping option
│   ├── ShippingOption.jsx   # Individual shipping option
│   ├── ShippingOptionAutoSelector.jsx  # Automatic selector
│   └── ShippingOptionGroup.jsx         # Shipping option group
├── hooks/                   # Custom hooks for shipping functionality
├── services/                # DEPRECATED - use centralized services
├── ShippingGroupSelector.jsx   # Main selector for option groups
├── ShippingSelector.jsx        # Main container component
└── styles/                     # Component-specific styles
    └── shipping.css            # Centralized styles
```

## Main Components

### ShippingSelector
Adapter component that manages shipping option selection and validation.
```jsx
<ShippingSelector 
  cartItems={cartItems}
  onOptionSelect={handleShippingSelect}
  selectedOptionId={selectedShippingId}
  userAddress={address}
  enableAutoSelect={true}
  autoSelectPreference="cheapest"
/>
```

### ShippingGroupSelector
Component for selecting shipping options grouped by type.
```jsx
<ShippingGroupSelector
  cartItems={cartItems}
  onOptionSelect={onOptionSelect}
  selectedOptionId={selectedOptionId}
  userAddress={userAddress}
  shippingOptions={shippingOptions}
  isLoading={isLoading}
  showDiagnostics={isDebugMode}
/>
```

## Utilities

- The `ShippingOptionAutoSelector` component automatically selects the best option based on different criteria.
- The `DiagnosticInfo` component displays useful information during development.
- Lazy loading implemented for debugging components.

## Optimizations

- Modular components with specific responsibilities
- Lazy loading for debugging components
- Centralized styles in a main CSS file
- Separate constants for better maintenance 