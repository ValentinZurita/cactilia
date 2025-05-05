import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Collapse from '../common/Collapse.jsx'
import '../../styles/shipping.css'
import { GROUP_PRIORITIES, SHIPPING_ICONS } from '../../constants/ShippingConstants2.js'
import { formatShippingCost } from '../../utils/shippingUtils.js'

/**
 * DiagnosticInfo component for debugging shipping group information
 */
const DiagnosticInfo = ({ groups, isLoading, error }) => {
  if (!groups) return null

  const hasPrices = groups.some(group =>
    group.options && group.options.some(option => option.price !== undefined && option.price !== null),
  )

  const hasPackages = groups.some(group =>
    group.options && group.options.some(option => option.packages && option.packages.length > 0),
  )

  return (
    <div className="diagnostic-banner">
      <div className="diagnostic-grid">
        <div className="diagnostic-item">
          <span className="diagnostic-label">Groups:</span>
          <span className="diagnostic-value">{groups.length}</span>
        </div>
        <div className="diagnostic-item">
          <span className="diagnostic-label">Prices:</span>
          <span className="diagnostic-value">{hasPrices ? 'Yes' : 'No'}</span>
        </div>
        <div className="diagnostic-item">
          <span className="diagnostic-label">Packages:</span>
          <span className="diagnostic-value">{hasPackages ? 'Yes' : 'No'}</span>
        </div>
        <div className="diagnostic-item">
          <span className="diagnostic-label">Loading:</span>
          <span className="diagnostic-value">{isLoading ? 'Yes' : 'No'}</span>
        </div>
        {error && (
          <div className="diagnostic-item diagnostic-error">
            <span className="diagnostic-label">Error:</span>
            <span className="diagnostic-value">{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Component for selecting shipping options grouped by type
 */
const ShippingGroupSelector = ({
                                 shippingGroups,
                                 selectedOptions,
                                 onOptionSelect,
                                 isLoading = false,
                                 error = null,
                               }) => {
  const [openGroups, setOpenGroups] = useState({})
  const [hasValidData, setHasValidData] = useState(false)

  // Set initial open state for groups and validate data
  useEffect(() => {
    if (shippingGroups && shippingGroups.length > 0) {
      const initialState = {};
      // Check if at least one group has valid options
      const containsValidOptions = shippingGroups.some(group => group.options && group.options.length > 0);

      // Open the first group by default only if there are valid options
      shippingGroups.forEach((group, index) => {
        // We only care about opening the first *valid* group if needed, 
        // but for simplicity, we just open the first overall group if data is valid.
        initialState[group.type] = index === 0 && containsValidOptions;
      });

      setOpenGroups(initialState);
      setHasValidData(containsValidOptions); // Set state based on validation
    } else {
      // Ensure state is reset if shippingGroups becomes empty/null
      setHasValidData(false);
      setOpenGroups({});
    }
  }, [shippingGroups]);

  // Toggle a group's open state
  const toggleGroup = (groupType) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupType]: !prev[groupType],
    }))
  }

  // Sort groups by priority
  const sortedGroups = [...(shippingGroups || [])].sort((a, b) => {
    return (GROUP_PRIORITIES[a.type] || 999) - (GROUP_PRIORITIES[b.type] || 999)
  })

  // Render loading state
  if (isLoading) {
    return (
      <div className="shipping-group-container">
        <DiagnosticInfo groups={shippingGroups} isLoading={isLoading} error={error} />
        <div className="shipping-loading">
          <div className="shimmer-effect">Loading shipping options...</div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error || !hasValidData) {
    return (
      <div className="shipping-group-container">
        <DiagnosticInfo groups={shippingGroups} isLoading={isLoading} error={error} />
        <div className="shipping-error">
          <p>{error || 'Unable to load shipping options. Please check your address or try again later.'}</p>
        </div>
      </div>
    )
  }

  // Render empty state
  if (!shippingGroups || shippingGroups.length === 0) {
    return (
      <div className="shipping-group-container">
        <DiagnosticInfo groups={shippingGroups} isLoading={isLoading} error={error} />
        <div className="shipping-empty">
          <p>No shipping options available for your location.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="shipping-group-container">
      <DiagnosticInfo groups={shippingGroups} isLoading={isLoading} error={error} />

      {sortedGroups.map((group) => {
        const isOpen = openGroups[group.type] || false
        const hasSelected = selectedOptions &&
          selectedOptions.some(selected => selected.groupType === group.type)

        // Skip rendering empty groups
        if (!group.options || group.options.length === 0) return null

        // Get icon for shipping group
        const groupIconClass = SHIPPING_ICONS[group.type] || 'bi-truck'

        return (
          <div
            className={`shipping-option-group ${hasSelected ? 'has-selected' : ''}`}
            key={group.type}
          >
            <div
              className="shipping-group-header"
              onClick={() => toggleGroup(group.type)}
            >
              <div className="shipping-group-title">
                <i className={`bi ${groupIconClass}`}></i>
                <h4>{group.label || group.type}</h4>
              </div>
              <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
            </div>

            <Collapse isOpen={isOpen}>
              <div className="shipping-options-list">
                {group.options.map((option) => {
                  const isSelected = selectedOptions &&
                    selectedOptions.some(selected =>
                      selected.id === option.id && selected.groupType === group.type,
                    )

                  const isFree = option.price === 0
                  const formattedPrice = formatShippingCost(option.price, isFree)

                  return (
                    <div
                      className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
                      key={option.id}
                      onClick={() => onOptionSelect(option, group.type)}
                    >
                      <div className="shipping-option-selector">
                        <input
                          type="radio"
                          name={`shipping-${group.type}`}
                          checked={isSelected}
                          onChange={() => {
                          }}
                          className="shipping-radio"
                        />
                        <div className="shipping-option-details">
                          <div className="shipping-option-name">
                            <span>{option.name}</span>
                            {isFree && <span className="shipping-tag free">FREE</span>}
                          </div>

                          <div className="shipping-option-delivery">
                            {option.estimatedDelivery && (
                              <span className="delivery-time">
                                {option.estimatedDelivery}
                      </span>
                            )}
                            <span className="shipping-price">{formattedPrice}</span>
                          </div>
                        </div>
                      </div>

                      {option.packages && option.packages.length > 0 && (
                        <div className="shipping-packages">
                          <div className="package-count">
                            <i className="bi bi-box"></i>
                            <span>{option.packages.length} package{option.packages.length !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Collapse>
          </div>
        )
      })}
    </div>
  )
}

ShippingGroupSelector.propTypes = {
  shippingGroups: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string.isRequired,
      label: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          price: PropTypes.number,
          estimatedDelivery: PropTypes.string,
          packages: PropTypes.array,
        }),
      ),
    }),
  ),
  selectedOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      groupType: PropTypes.string.isRequired,
    }),
  ),
  onOptionSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
}

export default ShippingGroupSelector