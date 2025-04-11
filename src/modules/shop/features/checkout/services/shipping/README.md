# Shipping Services Architecture

This directory contains the refactored shipping calculation system for the e-commerce platform. The architecture has been redesigned to be modular, maintainable, and efficient.

## Overview

The shipping system is responsible for calculating available shipping options based on the user's cart contents and address. It supports:

- Dynamic loading of shipping zones from Firebase
- Complex rule-based shipping calculations
- Optimal combinations of shipping options to cover all products
- Free shipping rules based on subtotal or product type
- Mixed shipping options (combining local and national shipping)

## Services

The system is divided into several specialized services:

### 1. ShippingService.js

The main entry point and coordinator for all shipping functionality. It handles:
- Loading shipping options for a cart and address
- Error handling and response standardization
- Orchestration of the other services

### 2. ShippingZonesService.js

Responsible for interacting with Firebase to fetch shipping zones:
- Loading active shipping zones from Firestore
- Filtering zones by postal code
- Calculating shipping prices based on zone rules

### 3. RuleService.js

Handles product grouping and rule application:
- Grouping products by applicable shipping rules
- Validating postal codes against rule criteria
- Checking if all products are covered by selected options

### 4. CombinationService.js

Builds optimal shipping combinations:
- Maps products to compatible shipping zones
- Finds zone combinations that cover all products
- Assigns products to zones in optimal ways
- Builds final shipping combinations with pricing

## Components

The UI components have been simplified:

- `ShippingGroupSelector.jsx` - Main component for displaying shipping options
- `ShippingSelector.jsx` - Adapter component that handles selection state
- `ShippingOption.jsx` - Individual shipping option display

## Usage

```jsx
import shippingService from '../services/shipping';

// Get shipping options
const { combinations, isLoading, error } = await shippingService.getShippingOptions(
  cartItems,
  userAddress
);

// Display shipping options
return (
  <ShippingSelector
    cartItems={cartItems}
    userAddress={userAddress}
    onOptionSelect={handleShippingSelection}
  />
);
```

## Error Handling

The system provides detailed error messages and fallbacks:
- When no shipping zones match the postal code
- When no valid combinations can be found
- When shipping rules are missing or incomplete

## Future Improvements

Potential areas for enhancement:
- Caching of shipping calculations for performance
- More granular error reporting
- Support for international shipping with customs
- Integration with real-time carrier rate APIs 