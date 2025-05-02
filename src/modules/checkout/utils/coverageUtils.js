/**
 * Utilidades para validar la cobertura de las reglas de envío
 * Permite determinar si una regla de envío es aplicable para una dirección
 */
import { COVERAGE_TYPES, NATIONAL_KEYWORD, STATE_ABBREVIATIONS, STATE_PREFIX } from '../constants/index.js'

/**
 * Convierte un nombre de estado completo a su abreviación
 * @param {string} stateName - Nombre completo del estado
 * @returns {string|null} - Abreviación del estado o null si no se encuentra
 */
export const getStateAbbreviation = (stateName) => {
  if (!stateName) return null

  // Normalizar nombre (quitar espacios extras, convertir a minúsculas)
  const normalizedName = stateName.trim()

  // Buscar en el mapeo de estados
  return STATE_ABBREVIATIONS[normalizedName] || null
}

/**
 * Obtiene el identificador de estado para usar en cobertura de reglas
 * @param {string} stateName - Nombre completo del estado
 * @returns {string|null} - Identificador en formato "estado_XXX" o null si no se encuentra
 */
export const getStateIdentifier = (stateName) => {
  const stateAbbr = getStateAbbreviation(stateName)

  if (!stateAbbr) return null

  return `${STATE_PREFIX}${stateAbbr}`
}

/**
 * Verifica si una regla de envío cubre un código postal específico
 * @param {Object} rule - Regla de envío
 * @param {string} zipCode - Código postal a verificar
 * @returns {boolean} - true si la regla cubre el código postal
 */
export const doesRuleCoverZipCode = (rule, zipCode) => {
  if (!rule || !zipCode) return false

  // Normalizar código postal
  const normalizedZip = zipCode.trim()

  // Verificar si la regla tiene zipcodes
  if (!rule.zipcodes || !Array.isArray(rule.zipcodes) || rule.zipcodes.length === 0) {
    return false
  }

  // Verificar si el código postal está explícitamente en la lista
  return rule.zipcodes.includes(normalizedZip)
}

/**
 * Verifica si una regla de envío cubre un estado específico
 * @param {Object} rule - Regla de envío
 * @param {string} stateName - Nombre completo del estado
 * @returns {boolean} - true si la regla cubre el estado
 */
export const doesRuleCoverState = (rule, stateName) => {
  if (!rule || !stateName) return false

  // Obtener identificador de estado ("estado_XXX")
  const stateId = getStateIdentifier(stateName)

  if (!stateId) return false

  // Verificar si la regla tiene zipcodes
  if (!rule.zipcodes || !Array.isArray(rule.zipcodes) || rule.zipcodes.length === 0) {
    return false
  }

  // Verificar si el estado está en la lista
  return rule.zipcodes.includes(stateId)
}

/**
 * Verifica si una regla de envío tiene cobertura nacional
 * @param {Object} rule - Regla de envío
 * @returns {boolean} - true si la regla tiene cobertura nacional
 */
export const hasNationalCoverage = (rule) => {
  if (!rule) return false

  // Verificar si la regla tiene zipcodes
  if (!rule.zipcodes || !Array.isArray(rule.zipcodes) || rule.zipcodes.length === 0) {
    return false
  }

  // Verificar si la palabra clave "nacional" está en la lista
  return rule.zipcodes.includes(NATIONAL_KEYWORD)
}

/**
 * Determina el tipo de cobertura más específico que aplica
 * @param {Object} rule - Regla de envío
 * @param {Object} address - Dirección (con zip y state)
 * @returns {string|null} - Tipo de cobertura (ZIP, STATE, NATIONAL) o null si no aplica
 */
export const getCoverageType = (rule, address) => {
  if (!rule || !address) return null

  // Verificar cobertura por ZIP (más específica)
  if (address.zip && doesRuleCoverZipCode(rule, address.zip)) {
    return COVERAGE_TYPES.ZIP
  }

  // Verificar cobertura por estado
  if (address.state && doesRuleCoverState(rule, address.state)) {
    return COVERAGE_TYPES.STATE
  }

  // Verificar cobertura nacional
  if (hasNationalCoverage(rule)) {
    return COVERAGE_TYPES.NATIONAL
  }

  // No hay cobertura
  return null
}

/**
 * Verifica si una regla de envío aplica para una dirección
 * @param {Object} rule - Regla de envío
 * @param {Object} address - Dirección
 * @returns {boolean} true si la regla aplica
 */
export const isRuleApplicableForAddress = (rule, address) => {
  if (!rule || !address) return false

  // Verificar si la regla está activa
  if (rule.activo === false) {
    return false
  }

  // Extraer datos de la dirección
  const addressState = (address.state || address.provincia || '').toLowerCase()
  const addressCity = (address.city || address.ciudad || '').toLowerCase()
  const addressZip = (address.zip || address.postalCode || address.zipcode || '').trim()

  // Verificar por zona específica (que puede ser un estado)
  if (rule.zona) {
    const zona = rule.zona.toLowerCase()

    // Si la zona coincide con el estado o ciudad
    if (zona === addressState || zona === addressCity) {
      console.log(`✅ Regla ${rule.id} aplica por zona (${rule.zona})`)
      return true
    }

    // Para "Local" verificar reglas especiales
    if (zona === 'local') {
      console.log(`✅ Regla ${rule.id} aplica por ser zona local`)
      return true
    }
  }

  // Verificar campo zipcode específico
  if (rule.zipcode && addressZip) {
    // Verificar si es un código exacto o con prefijo estado_
    if (rule.zipcode === addressZip || rule.zipcode === `estado_${addressState.substring(0, 3).toUpperCase()}`) {
      console.log(`✅ Regla ${rule.id} aplica por zipcode exacto o estado (${rule.zipcode})`)
      return true
    }
  }

  // Verificar array de zipcodes
  if (rule.zipcodes && Array.isArray(rule.zipcodes) && rule.zipcodes.length > 0) {
    // Verificar si alguno de los códigos coincide
    if (rule.zipcodes.includes(addressZip)) {
      console.log(`✅ Regla ${rule.id} aplica por zipcodes array: ${addressZip}`)
      return true
    }

    // Verificar rangos de códigos si están como strings con guiones
    for (const zipRange of rule.zipcodes) {
      if (typeof zipRange === 'string' && zipRange.includes('-')) {
        const [start, end] = zipRange.split('-').map(z => parseInt(z.trim(), 10))
        const zip = parseInt(addressZip, 10)

        if (!isNaN(zip) && !isNaN(start) && !isNaN(end) && zip >= start && zip <= end) {
          console.log(`✅ Regla ${rule.id} aplica por rango de códigos postales ${start}-${end}`)
          return true
        }
      }
    }
  }

  // Verificar por reglas de código postal
  if (rule.zipCodes && Array.isArray(rule.zipCodes) && rule.zipCodes.length > 0) {
    for (const zipRule of rule.zipCodes) {
      // Rango de códigos postales
      if (typeof zipRule === 'string' && zipRule.includes('-')) {
        const [start, end] = zipRule.split('-').map(z => parseInt(z.trim(), 10))
        const zip = parseInt(addressZip, 10)

        if (!isNaN(zip) && !isNaN(start) && !isNaN(end) && zip >= start && zip <= end) {
          console.log(`✅ Regla ${rule.id} aplica por rango de códigos postales ${start}-${end}`)
          return true
        }
      }

      // Código postal exacto
      if (zipRule === addressZip) {
        console.log(`✅ Regla ${rule.id} aplica por código postal exacto ${addressZip}`)
        return true
      }
    }
  }

  // Verificar zonas
  if (rule.zones && Array.isArray(rule.zones) && rule.zones.length > 0) {
    for (const zone of rule.zones) {
      // Verificar por estado
      if (zone.states && Array.isArray(zone.states) && zone.states.length > 0) {
        for (const state of zone.states) {
          if (state.toLowerCase() === addressState) {
            console.log(`✅ Regla ${rule.id} aplica por estado ${state}`)
            return true
          }
        }
      }

      // Verificar por códigos postales
      if (zone.zipCodes && Array.isArray(zone.zipCodes) && zone.zipCodes.length > 0) {
        for (const zipRule of zone.zipCodes) {
          // Rango de códigos postales
          if (typeof zipRule === 'string' && zipRule.includes('-')) {
            const [start, end] = zipRule.split('-').map(z => parseInt(z.trim(), 10))
            const zip = parseInt(addressZip, 10)

            if (!isNaN(zip) && !isNaN(start) && !isNaN(end) && zip >= start && zip <= end) {
              console.log(`✅ Regla ${rule.id} aplica por rango de códigos postales en zona ${start}-${end}`)
              return true
            }
          }

          // Código postal exacto
          if (zipRule === addressZip) {
            console.log(`✅ Regla ${rule.id} aplica por código postal exacto en zona ${addressZip}`)
            return true
          }
        }
      }
    }
  }

  return false
}

/**
 * Verifica si un producto puede ser enviado a una dirección
 * @param {Object} product - Producto
 * @param {Object} address - Dirección
 * @param {Array} rules - Reglas de envío
 * @returns {boolean} true si el producto puede ser enviado
 */
export const isProductShippableToAddress = (product, address, rules) => {
  if (!product || !address || !rules || !Array.isArray(rules) || rules.length === 0) {
    return false
  }

  // Obtener IDs de reglas del producto
  const ruleIds = []

  if (product.shippingRuleId) {
    ruleIds.push(product.shippingRuleId)
  }

  if (Array.isArray(product.shippingRuleIds) && product.shippingRuleIds.length > 0) {
    ruleIds.push(...product.shippingRuleIds)
  }

  // Si no hay reglas, no es enviable
  if (ruleIds.length === 0) {
    return false
  }

  // Verificar si alguna regla aplica
  for (const rule of rules) {
    if (ruleIds.includes(rule.id) && isRuleApplicableForAddress(rule, address)) {
      return true
    }
  }

  return false
}