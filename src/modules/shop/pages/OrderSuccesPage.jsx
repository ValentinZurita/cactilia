import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { doc, getDoc } from 'firebase/firestore'
import { FirebaseDB } from '../../../config/firebase/firebaseConfig.js'
import { formatDate } from '../utils/date.js'
import {
  OrderActions,
  OrderAddressCard,
  OrderNextSteps,
  OrderNotes,
  OrderOverview,
  OrderPaymentInfo,
  OrderProductsList,
  OrderSummaryHeader,
  OrderTotals,
} from '../features/order/component/index.js'
import '@modules/checkout/styles/oxxoVoucher.css'
import '@modules/checkout/styles/orderSuccess.css'
import { OxxoVoucher } from '@modules/checkout/components/payment/index.js'
import { clearCartWithSync } from '../features/cart/store/index.js'
import { formatCurrency } from '@utils/formatting/index.js'

const ORDERS_COLLECTION = 'orders'
const SETTINGS_COLLECTION = 'settings'
const COMPANY_INFO_DOC = 'company_info'

/**
 * Obtiene los detalles de un pedido desde Firestore.
 * @param {string} orderId - ID del pedido.
 * @returns {Promise<Object|null>} - Datos del pedido o null si no existe.
 */
const fetchOrderDetails = async (orderId) => {
  try {
    console.log('OrderSuccessPage: Cargando detalles del pedido con ID:', orderId)
    const orderRef = doc(FirebaseDB, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      console.error('OrderSuccessPage: No se encontró el pedido:', orderId)
      return null
    }

    const orderData = {
      id: orderSnap.id,
      ...orderSnap.data(),
    }

    // Aseguramos que los datos tengan los campos mínimos necesarios
    if (!orderData.status) {
      orderData.status = 'pending'
    }

    if (!orderData.createdAt) {
      orderData.createdAt = new Date()
    }

    console.log('OrderSuccessPage: Datos del pedido cargados:', orderData)
    return orderData
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error)
    return null
  }
}

/**
 * Componente para el estado de carga
 */
const LoadingState = () => (
  <div className="os-wrapper order-success-loading">
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
    <h3 className="mt-4">Cargando detalles del pedido...</h3>
    <p className="text-muted">Solo tomará unos segundos</p>
  </div>
)

/**
 * Componente para mostrar mensajes de error
 */
const ErrorState = ({ error }) => (
  <div className="os-wrapper order-success-error">
    <div className="order-error-icon">
      <i className="bi bi-exclamation-circle"></i>
    </div>
    <h3>No pudimos encontrar tu pedido</h3>
    <p className="text-muted">{error}</p>
    <div className="mt-4">
      <Link to="/profile/orders" className="btn btn-outline-secondary">
        <i className="bi bi-arrow-left me-1"></i>
        Ver mis pedidos
      </Link>
    </div>
  </div>
)

/**
 * Componente para mostrar éxito sin detalles de pedido (backup)
 */
const NoOrderDetailsState = () => (
  <div className="os-wrapper order-success-container">
    <OrderSummaryHeader />
    <div className="order-success-generic">
      <div className="alert alert-info">
        <i className="bi bi-info-circle me-2"></i>
        Te hemos enviado un correo electrónico con los detalles de tu pedido.
      </div>

      <div className="generic-actions mt-5">
        <Link to="/profile/orders" className="btn btn-success me-3">
          <i className="bi bi-bag me-2"></i>
          Ver Mis Pedidos
        </Link>
        <Link to="/shop" className="btn btn-outline-secondary">
          <i className="bi bi-shop me-2"></i>
          Seguir Comprando
        </Link>
      </div>
    </div>
  </div>
)

/**
 * Muestra la confirmación final con los detalles del pedido.
 */
const OrderSuccessContent = ({ orderId, orderDetails, companyContact, loadingContact }) => {
  const isFromCheckout = !window.location.pathname.includes('/profile/')
  // Definir correctamente isOxxoPayment basado en el tipo de pago de la orden
  const isOxxoPayment = orderDetails.payment?.type === 'oxxo'

  return (
    <div className="os-wrapper order-success-container">
      {/* Cabecera con animación de éxito */}
      <OrderSummaryHeader
        title={isOxxoPayment ? '¡Pedido Registrado!' : '¡Pedido Confirmado!'}
        message={isOxxoPayment
          ? 'Tu pedido ha sido registrado. Por favor completa el pago en tu tienda OXXO más cercana.'
          : 'Gracias por tu compra. Tu pedido ha sido procesado correctamente.'
        }
      />
      {/* Resumen principal del pedido */}
      <OrderOverview
        orderId={orderId}
        orderDate={formatDate(orderDetails.createdAt)}
        status={orderDetails.status}
        createdAt={orderDetails.createdAt}
      />

      {/* Detalles de productos */}
      <div className="order-details-section">
        <h3>Productos</h3>
        <OrderProductsList items={orderDetails.items || []} />

        {/* Totales */}
        <OrderTotals totals={orderDetails.totals || {
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        }} />
      </div>

      {/* Dirección de Envío */}
      <div className="order-details-section">
        <h3>Dirección de Envío</h3>
        <OrderAddressCard
          address={orderDetails.shippingAddress}
          estimatedDelivery={orderDetails.shipping?.estimatedDelivery}
        />
      </div>

      {/* Información de Pago */}
      <div className="order-details-section">
        <h3>Información de Pago</h3>
        <OrderPaymentInfo
          payment={orderDetails.payment}
          billing={orderDetails.billing}
        />
      </div>

      {/* Información de Pago en OXXO */}
      {orderDetails.payment?.type === 'oxxo' && (
        <div className="order-details-section">
          <h3>Información de Pago en OXXO</h3>
          <OxxoVoucher
            orderData={orderDetails}
            voucherUrl={orderDetails.payment?.voucherUrl}
            expiresAt={orderDetails.payment?.expiresAt}
          />
        </div>
      )}

      {/* Notas del pedido */}
      <OrderNotes notes={orderDetails.notes} />

      {/* Siguientes pasos y soporte */}
      {isFromCheckout && <OrderNextSteps />}

      {/* Acciones */}
      <OrderActions
        isFromCheckout={isFromCheckout}
        orderId={orderId}
        showSupport={true}
        companyContact={companyContact}
        loadingContact={loadingContact}
      />
    </div>
  )
}

/**
 * Componente principal de la página de éxito de pedido.
 * - Lee el orderId de la URL (parámetro:orderId).
 * - Obtiene los detalles de la orden desde Firestore.
 * - Muestra la confirmación con los detalles o error si no se encuentra.
 */
const OrderSuccessPage = () => {
  const { orderId } = useParams()       // orderId desde la URL "/order-success/:orderId"
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  // Estado interno
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartCleared, setCartCleared] = useState(false)

  // Extraer detalles de pago OXXO si existen
  const paymentType = searchParams.get('payment')
  const oxxoAmount = searchParams.get('amount')
  const oxxoExpires = searchParams.get('expires')

  // Estado para info de contacto de la empresa
  const [companyContact, setCompanyContact] = useState(null)
  const [loadingContact, setLoadingContact] = useState(true)
  const [contactError, setContactError] = useState(null)

  // Limpiar el carrito cuando la página se carga
  useEffect(() => {
    console.log('[OrderSuccesPage] Montado. Limpiando carrito...')
    dispatch(clearCartWithSync())
    setCartCleared(true)
  }, [dispatch])

  // Cargar detalles del pedido
  useEffect(() => {
    const getOrderData = async () => {
      if (!orderId) {
        console.error('OrderSuccessPage: No se proporcionó un ID de pedido')
        setError('No se proporcionó un ID de pedido válido')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await fetchOrderDetails(orderId)
        if (!data) {
          setError('No se encontró la información del pedido')
        } else {
          setOrderDetails(data)
        }
      } catch (err) {
        console.error('OrderSuccessPage: Error al obtener detalles del pedido:', err)
        setError('Ocurrió un error al cargar los detalles del pedido')
      } finally {
        setLoading(false)
      }
    }

    getOrderData()
  }, [orderId, dispatch])

  // Cargar info de contacto de la empresa
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      setLoadingContact(true)
      setContactError(null)
      try {
        const docRef = doc(FirebaseDB, SETTINGS_COLLECTION, COMPANY_INFO_DOC)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists() && docSnap.data().contact) {
          console.log("[OrderSuccesPage] Info de contacto cargada:", docSnap.data().contact)
          setCompanyContact(docSnap.data().contact)
        } else {
          console.error("[OrderSuccesPage] No se encontró el documento 'company_info' o el campo 'contact'.")
          setContactError("No se pudo cargar la información de contacto.")
        }
      } catch (err) {
        console.error("[OrderSuccesPage] Error al cargar info de contacto:", err)
        setContactError("Error al cargar la información de contacto.")
      } finally {
        setLoadingContact(false)
      }
    }
    fetchCompanyInfo()
  }, [])

  // Renderizado condicional con el wrapper principal
  return (
    <div className="order-success-page-wrapper">
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} />
      ) : !orderDetails ? (
        <NoOrderDetailsState />
      ) : (
        <OrderSuccessContent 
          orderId={orderId} 
          orderDetails={orderDetails} 
          companyContact={companyContact}
          loadingContact={loadingContact}
        />
      )}
    </div>
  )
}

export default OrderSuccessPage