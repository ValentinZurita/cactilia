import React, { useEffect, useState } from 'react'
import { BackButton } from '../../common/components/BackButton'
import { ActionButton } from '../../common/components/ActionButton'
import { DetailField, UserContact, UserRole } from './UserDetailHelpers.jsx'
import { UserAvatar } from '../../common/components/UserAvatar.jsx'
import { LoadingIndicator } from '../../common/components/LoadingIndicator.jsx'
import { getOrdersByUserId } from '../orders/services/userAdminService.js'
import { UserOrdersTable } from './UserOrdersTable.jsx'
import NavigationTabs from '../../common/components/NavigationTabs.jsx'
import { TabItem } from '../../common/components/TabItem.jsx'


const EmptyOrdersSection = () => (
  <div className="text-center py-4 text-muted">
    <div className="p-4 bg-light rounded-4">
      <i className="bi bi-inbox fs-1 d-block mb-3 text-secondary"></i>
      <p>Este usuario no tiene pedidos registrados</p>
    </div>
  </div>
);

/**
 * Formatea fechas de diferentes tipos a un formato legible
 */
const formatDate = (timestamp) => {
  if (!timestamp) return 'No disponible'

  try {
    // Si es un timestamp de Firestore
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Si es una fecha normal
    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

/**
 * Componente para mostrar los detalles de un usuario
 * Diseño refinado, elegante y minimalista, con estructura modular para mejor mantenimiento
 *
 * @param {Object} props.user - Datos del usuario
 * @param {Function} props.onBack - Función para volver a la lista
 * @param {Function} [props.onChangeRole] - Función para INICIAR el cambio de rol (abre modal)
 * @param {Function} [props.onDelete] - Función opcional para eliminar el usuario
 * @returns {JSX.Element}
 */
export const UserDetailsCard = ({ user, onBack, onDelete, onChangeRole }) => {
  // --- NUEVO: Estado para órdenes del usuario ---
  const [userOrders, setUserOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [ordersError, setOrdersError] = useState(null)
  // --- NUEVO: Estado para la pestaña activa ---
  const [activeTab, setActiveTab] = useState('details') // 'details' o 'history'

  // --- NUEVO: Efecto para cargar órdenes ---
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user || !user.id) {
        setLoadingOrders(false)
        return // No hay ID de usuario
      }

      setLoadingOrders(true)
      setOrdersError(null)
      try {
        const result = await getOrdersByUserId(user.id)
        if (result.ok) {
          setUserOrders(result.data)
        } else {
          throw new Error(result.error || 'Error al cargar el historial de pedidos.')
        }
      } catch (error) {
        console.error('Error fetching user orders:', error)
        setOrdersError(error.message)
      } finally {
        setLoadingOrders(false)
      }
    }

    fetchUserOrders()
  }, [user?.id]) // Dependencia: user.id

  // Validar que exista un usuario
  if (!user) {
    return (
      <div className="alert alert-warning shadow-sm border-0">
        No se encontraron datos del usuario
      </div>
    )
  }

  return (
    <div className="user-details-container p-4">
      <div className="mb-4">
        <BackButton onClick={onBack} />
      </div>

      <div className="d-flex align-items-center mb-4">
        <div className="me-4 flex-shrink-0">
          <UserAvatar user={user} size="lg" />
        </div>
        <div className="flex-grow-1">
          <h4 className="fw-bold mb-1">{user.displayName || 'Sin nombre'}</h4>
          <div className="mb-2">
            <UserRole role={user.role} />
          </div>
        </div>
      </div>

      {/* --- Sistema de Pestañas ACTUALIZADO --- */}
      <NavigationTabs
        activeSection={activeTab}
        onSectionChange={setActiveTab}
        // Añadir pestañas de Contacto y Acciones
        tabs={[
          { id: 'details', label: 'Detalles' },
          { id: 'contact', label: 'Contacto' },
          { id: 'history', label: 'Historial de Pedidos' },
          { id: 'actions', label: 'Rol y Acciones' },
        ]}
      />

      {/* --- Contenido de las Pestañas --- */}
      <div className="mt-4"> 
        {/* Pestaña Detalles (limpia) */}
        {activeTab === 'details' && (
          <div>
            <DetailField
              label="ID de Usuario"
              value={user.id || 'No disponible'}
              isMonospace={true}
            />
            {user.updatedAt && (
              <DetailField
                label="Última Actualización"
                value={formatDate(user.updatedAt)}
              />
            )}
            {user.lastLogin && (
              <DetailField
                label="Último Acceso"
                value={formatDate(user.lastLogin)}
              />
            )}
            {user.address && (
              <DetailField
                label="Dirección"
                value={user.address}
              />
            )}
            {/* Fecha de Registro con estilo DetailField */}
            {user.createdAt && (
                <DetailField
                  label="Registrado"
                  value={formatDate(user.createdAt)}
                />
            )}
          </div>
        )}
        
        {/* Pestaña Contacto (con estilo DetailField + iconos) */}
        {activeTab === 'contact' && (
          <div>
             {/* Email con DetailField */}
             <DetailField
               label="Email"
               value={user.email || 'No disponible'}
               iconClass="bi-envelope" 
             />
             {/* Teléfono con DetailField */}
             {user.phoneNumber && (
               <DetailField
                 label="Teléfono"
                 value={user.phoneNumber}
                 iconClass="bi-telephone"
               />
             )}
          </div>
        )}

        {/* Pestaña Historial (sin cambios internos) */}
        {activeTab === 'history' && (
           <div>
             {/* ... (lógica de historial sin cambios) ... */}
             {loadingOrders ? (
               <LoadingIndicator />
             ) : ordersError ? (
               <div className="alert alert-danger py-2 small">
                 <i className="bi bi-exclamation-triangle-fill me-2"></i>
                 Error al cargar historial: {ordersError}
               </div>
             ) : userOrders.length > 0 ? (
               <UserOrdersTable orders={userOrders} /> 
             ) : (
               <EmptyOrdersSection /> 
             )}
           </div>
        )}
        
        {/* Pestaña Rol y Acciones (Simplificada - Solo Botones) */}
        {activeTab === 'actions' && (
           <div className="d-flex flex-column gap-3"> 
             
             {/* Botón para abrir modal de rol */} 
             {onChangeRole && (
               <div className="mb-3">
                 <p className="text-muted small mb-1 fst-italic">
                   Abre un diálogo para modificar el nivel de acceso del usuario.
                 </p>
                 <ActionButton
                   onClick={() => onChangeRole(user)} // Llama a la función del padre
                   icon="person-badge" // O pencil-square?
                   text="Gestionar Rol"
                   variant="outline-secondary"
                   className="btn-sm"
                 />
               </div>
             )}

             {/* Sección Eliminar Usuario (Se mantiene igual) */}
             {onDelete && (
               <div className="mt-4 pt-3 border-top"> 
                 <p className="text-muted small mb-2 fst-italic">
                   Atención: Esta acción eliminará permanentemente al usuario.
                 </p>
                 <ActionButton
                   onClick={() => onDelete(user.id)}
                   icon="trash"
                   text="Eliminar Usuario"
                   variant="outline-danger"
                   className="btn-sm"
                 />
               </div>
             )}

             {/* Mensaje si no hay acciones disponibles */}
             {!onChangeRole && !onDelete && (
                 <p className="text-muted fst-italic mt-3">No hay acciones disponibles.</p>
             )}
           </div>
        )}
      </div>

      {/* --- Sección de Acciones (ELIMINADA de aquí abajo) --- */}
      {/* <div className="d-flex justify-content-start gap-2 mt-4 pt-4 border-top"> ... </div> */}

    </div> // Fin user-details-container
  );
};