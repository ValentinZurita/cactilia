import { useCallback, useState } from 'react'
import { getUserAddresses } from '../../user/services/addressService.js'
import { getUserPaymentMethods } from '../../user/services/paymentService.js'
import { useAsync } from '../../shop/hooks/useAsync.js'

/**
 * Hook para manejar los formularios y selecciones en el checkout
 * Combina la lógica de addressSelection y paymentSelection en un solo hook
 *
 * @param {string} uid - ID del usuario autenticado
 * @returns {Object} Estados y funciones para el formulario de checkout
 */
export const useCheckoutForm = (uid) => {
  // Estados para dirección
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedAddressType, setSelectedAddressType] = useState('')
  const [addresses, setAddresses] = useState([])
  const [newAddressData, setNewAddressData] = useState({
    name: '',
    street: '',
    numExt: '',
    numInt: '',
    colonia: '',
    city: '',
    state: '',
    zip: '',
    references: '',
    saveAddress: false,
  })

  // Estados para método de pago
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [selectedPaymentType, setSelectedPaymentType] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [newCardData, setNewCardData] = useState({
    cardholderName: '',
    saveCard: false,
    isComplete: false,
    error: null,
  })

  // Estados para facturación
  const [requiresInvoice, setRequiresInvoice] = useState(false)
  const [fiscalData, setFiscalData] = useState({
    rfc: '',
    businessName: '',
    email: '',
    regimenFiscal: '',
    usoCFDI: 'G03', // Gastos generales por defecto
  })

  // Estado para notas
  const [orderNotes, setOrderNotes] = useState('')

  // Cargar direcciones y métodos de pago
  const {
    execute: loadAddresses,
    isPending: loadingAddresses,
    error: addressError,
    isError: isAddressError,
  } = useAsync(async () => {
    if (!uid) {
      console.log('No hay UID de usuario, no se cargan direcciones')
      return []
    }

    try {
      const result = await getUserAddresses(uid)

      console.log('Resultado de getUserAddresses:', result)

      if (result.ok) {
        setAddresses(result.data || [])

        // Seleccionar dirección por defecto si hay
        if (result.data && result.data.length > 0 && !selectedAddressId) {
          const defaultAddress = result.data.find(addr => addr.isDefault)
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
            setSelectedAddressType('saved')
          } else {
            setSelectedAddressId(result.data[0].id)
            setSelectedAddressType('saved')
          }
        }

        return result.data || []
      } else {
        console.error('Error obteniendo direcciones:', result.error)
        // Establecer direcciones como array vacío para que no se quede cargando
        setAddresses([])
        throw new Error(result.error || 'Error al cargar direcciones')
      }
    } catch (error) {
      console.error('Error en loadAddresses:', error)
      setAddresses([])
      throw error
    }
  }, true, [uid])

  const {
    execute: loadPaymentMethods,
    isPending: loadingPayments,
    error: paymentError,
  } = useAsync(async () => {
    if (!uid) return []
    const result = await getUserPaymentMethods(uid)
    if (result.ok) {
      setPaymentMethods(result.data)

      // Seleccionar método por defecto si hay
      if (result.data.length > 0 && !selectedPaymentId) {
        const defaultMethod = result.data.find(method => method.isDefault)
        if (defaultMethod) {
          setSelectedPaymentId(defaultMethod.id)
          setSelectedPaymentType('card')
        } else {
          setSelectedPaymentId(result.data[0].id)
          setSelectedPaymentType('card')
        }
      }
    }
    return result.data
  }, true, [uid])

  // Manejadores para dirección
  const handleAddressChange = useCallback((addressId, addressType = 'saved') => {
    setSelectedAddressId(addressId)
    setSelectedAddressType(addressType)
  }, [])

  const handleNewAddressSelect = useCallback(() => {
    setSelectedAddressId(null)
    setSelectedAddressType('new')
  }, [])

  const handleNewAddressDataChange = useCallback((data) => {
    setNewAddressData(prev => ({ ...prev, ...data }))
  }, [])

  // Manejadores para método de pago
  const handlePaymentChange = useCallback((paymentId, paymentType = 'card') => {
    setSelectedPaymentId(paymentId)
    setSelectedPaymentType(paymentType)
  }, [])

  const handleNewCardSelect = useCallback(() => {
    setSelectedPaymentId(null)
    setSelectedPaymentType('new_card')
  }, [])

  const handleOxxoSelect = useCallback(() => {
    setSelectedPaymentId(null)
    setSelectedPaymentType('oxxo')
  }, [])

  const handleNewCardDataChange = useCallback((data) => {
    setNewCardData(prev => ({ ...prev, ...data }))
  }, [])

  // Manejadores para facturación
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires)
    if (!requires) {
      setFiscalData({
        rfc: '',
        businessName: '',
        email: '',
        regimenFiscal: '',
        usoCFDI: 'G03',
      })
    }
  }, [])

  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(prev => ({ ...prev, ...data }))
  }, [])

  // Manejador para notas
  const handleNotesChange = useCallback((e) => {
    setOrderNotes(e.target.value)
  }, [])

  // Obtener dirección y método de pago seleccionados
  const selectedAddress = selectedAddressType === 'saved'
    ? addresses.find(addr => addr.id === selectedAddressId)
    : null

  const selectedPayment = selectedPaymentType === 'card'
    ? paymentMethods.find(method => method.id === selectedPaymentId)
    : null

  return {
    // Dirección
    addresses,
    selectedAddressId,
    selectedAddressType,
    selectedAddress,
    newAddressData,
    loadingAddresses,
    addressError,
    handleAddressChange,
    handleNewAddressSelect,
    handleNewAddressDataChange,
    reloadAddresses: loadAddresses,

    // Método de pago
    paymentMethods,
    selectedPaymentId,
    selectedPaymentType,
    selectedPayment,
    newCardData,
    loadingPayments,
    paymentError,
    handlePaymentChange,
    handleNewCardSelect,
    handleOxxoSelect,
    handleNewCardDataChange,
    reloadPaymentMethods: loadPaymentMethods,

    // Facturación
    requiresInvoice,
    fiscalData,
    handleInvoiceChange,
    handleFiscalDataChange,

    // Notas
    orderNotes,
    handleNotesChange,

    // Reset
    resetForm: () => {
      setSelectedAddressId(null)
      setSelectedAddressType('')
      setNewAddressData({
        name: '',
        street: '',
        numExt: '',
        numInt: '',
        colonia: '',
        city: '',
        state: '',
        zip: '',
        references: '',
        saveAddress: false,
      })
      setSelectedPaymentId(null)
      setSelectedPaymentType('')
      setNewCardData({
        cardholderName: '',
        saveCard: false,
        isComplete: false,
        error: null,
      })
      setRequiresInvoice(false)
      setFiscalData({
        rfc: '',
        businessName: '',
        email: '',
        regimenFiscal: '',
        usoCFDI: 'G03',
      })
      setOrderNotes('')
    },
  }
}
