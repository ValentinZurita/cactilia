import { useEffect, useRef, useState } from 'react'
import { validateCartStock } from '../../shop/utils/stockValidation.js'

/**
 * Hook para gestionar la validación de stock en el checkout
 *
 * Maneja:
 * - Validación inicial de stock
 * - Estado de validación (cargando, resultado)
 * - Errores de validación
 *
 * @param {Array} cartItems - Items del carrito a validar
 * @returns {Object} Estado y funciones de validación
 */
export const useStockValidation = (cartItems) => {
  const [isValidatingStock, setIsValidatingStock] = useState(false)
  const [stockValidationResult, setStockValidationResult] = useState(null)
  const [validationError, setValidationError] = useState(null)

  // Referencias para control de validación
  const isComponentMounted = useRef(true)
  const validationTimerRef = useRef(null)
  const lastValidationRef = useRef(null)
  const itemsRefString = useRef(JSON.stringify(cartItems))
  const initialValidationDoneRef = useRef(false)

  // Limpiar referencias en desmontaje
  useEffect(() => {
    return () => {
      isComponentMounted.current = false
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current)
      }
    }
  }, [])

  // Validar stock solo al montar el componente o cuando cambian los items significativamente
  useEffect(() => {
    // Si no hay items, no hacer nada
    if (!cartItems || cartItems.length === 0) {
      return
    }

    // Verificar si necesitamos validar por ser la primera vez
    if (!initialValidationDoneRef.current) {
      initialValidationDoneRef.current = true
      performStockValidation()
      return
    }

    // Convertir items a string para comparación
    const currentItemsString = JSON.stringify(cartItems)

    // Si los items no han cambiado, no revalidar
    if (currentItemsString === itemsRefString.current) {
      return
    }

    // Actualizar referencia
    itemsRefString.current = currentItemsString

    // Verificar si debemos validar (no más de cada 30 segundos)
    const shouldValidate = !lastValidationRef.current ||
      (Date.now() - lastValidationRef.current) > 30000

    if (!shouldValidate) {
      console.log('Omitiendo validación por tiempo mínimo', new Date().toISOString())
      return
    }

    // Realizar validación con retraso para evitar múltiples validaciones simultáneas
    performStockValidation()
  }, [cartItems])

  /**
   * Realiza la validación de stock con gestión de estado y errores
   */
  const performStockValidation = () => {
    // Cancelar validación anterior si existe
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current)
    }

    validationTimerRef.current = setTimeout(async () => {
      if (!isComponentMounted.current) {
        return
      }

      setIsValidatingStock(true)
      try {
        // console.log('Iniciando validación de stock en CheckoutForm', new Date().toISOString());
        const result = await validateCartStock(cartItems)

        // Guardar timestamp de última validación
        lastValidationRef.current = Date.now()

        if (!isComponentMounted.current) return

        setStockValidationResult(result)

        // Si hay problemas de stock, mostrar error
        if (!result.valid && result.outOfStockItems && result.outOfStockItems.length > 0) {
          let errorMessage

          if (result.outOfStockItems.length === 1) {
            const item = result.outOfStockItems[0]
            errorMessage = `"${item.name}" no está disponible en la cantidad solicitada. Solo hay ${item.actualStock} unidades disponibles.`
          } else {
            errorMessage = 'Algunos productos no están disponibles en la cantidad solicitada:'
            // Limitar a mostrar máximo 3 productos para no sobrecargar la UI
            const itemsToShow = result.outOfStockItems.slice(0, 3)
            itemsToShow.forEach(item => {
              errorMessage += `\n- ${item.name}: Solicitados ${item.quantity}, Disponibles ${item.actualStock}`
            })

            if (result.outOfStockItems.length > 3) {
              errorMessage += `\n... y ${result.outOfStockItems.length - 3} productos más.`
            }
          }

          setValidationError(errorMessage)
        } else {
          setValidationError(null)
        }
      } catch (error) {
        console.error('Error validando stock:', error)
        if (isComponentMounted.current) {
          setValidationError('Error al verificar la disponibilidad de productos. Por favor, inténtalo de nuevo.')
        }
      } finally {
        if (isComponentMounted.current) {
          setIsValidatingStock(false)
        }
      }
    }, 1000)
  }

  return {
    isValidatingStock,
    stockValidationResult,
    validationError,
    setValidationError,
    performStockValidation,
  }
}