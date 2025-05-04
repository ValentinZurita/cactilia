import React from 'react';
import { Link } from 'react-router-dom';
// Importar componentes auxiliares para el estilo
import { IconCircle } from '../common/IconCircle.jsx';
import { InfoBlock } from '../common/InfoBlock.jsx';
import { InfoRow } from '../common/InfoRow.jsx';

/**
 * Muestra la información del cliente y la dirección de envío en los detalles del pedido del admin.
 */
export const OrderCustomerInfo = ({ order, userData, loadingUser }) => {
  // Limpiar logs si existían
  // console.log('[OrderCustomerInfo] Datos de usuario:', userData);
  // console.log('[OrderCustomerInfo] Dirección de envío:', order.shippingAddress);

  const address = order.shippingAddress || {}; // Asegurar que address sea un objeto

  return (
    <div className="row">
      {/* Columna de Información del Cliente */}
      <div className="col-md-6 mb-4 mb-md-0">
        <InfoBlock title="Cliente">
          {loadingUser ? (
            <p className="text-muted">Cargando datos del cliente...</p>
          ) : userData ? (
            <div className="d-flex align-items-center">
              <IconCircle icon="person-circle" /> 
              <div>
                <p className="mb-0 fw-medium">
                  {userData.firstName || ''} {userData.lastName || ''}
                </p>
                {userData.email && (
                  <p className="mb-0 text-secondary small">
                    <i className="bi bi-envelope me-1"></i>
                    {userData.email}
                  </p>
                )}
                {userData.phoneNumber && (
                  <p className="mb-0 text-secondary small">
                    <i className="bi bi-telephone me-1"></i>
                    {userData.phoneNumber}
                  </p>
                )}
                {/* Enlace para ver más detalles del cliente si es necesario */}
                <Link to={`/admin/users/${order.userId}`} className="small mt-1 d-inline-block">Ver cliente</Link>
              </div>
            </div>
          ) : (
            <p className="text-muted">No se pudieron cargar los datos del cliente.</p>
          )}
        </InfoBlock>
      </div>

      {/* Columna de Dirección de Envío (Refactorizada) */}
      <div className="col-md-6">
        <InfoBlock title="Dirección de Envío">
          {Object.keys(address).length > 0 ? (
            <div className="d-flex align-items-start">
              <IconCircle icon="geo-alt-fill" className="mt-1" />
              <div>
                {/* Nombre completo */} 
                {(address.firstName || address.lastName) && 
                  <InfoRow label="Recibe" value={`${address.firstName || ''} ${address.lastName || ''}`} className="mb-2" />
                }
                {/* Calle y Número */} 
                {(address.street || address.number) && 
                  <InfoRow label="Calle y Número" value={`${address.street || ''}${address.number ? `, ${address.number}` : ''}`} className="mb-2" />
                }
                {/* Número Interior */} 
                {address.details && 
                  <InfoRow label="Interior/Depto/Detalles" value={address.details} className="mb-2" />
                }
                {/* Colonia */} 
                {address.neighborhood && 
                  <InfoRow label="Colonia" value={address.neighborhood} className="mb-2" />
                }
                {/* Código Postal */} 
                {address.postalCode && 
                  <InfoRow label="Código Postal" value={address.postalCode} className="mb-2" />
                }
                {/* Ciudad */} 
                {address.city && 
                  <InfoRow label="Ciudad" value={address.city} className="mb-2" />
                }
                {/* Estado */} 
                {address.state && 
                  <InfoRow label="Estado" value={address.state} className="mb-2" />
                }
                {/* País (si existe) */} 
                {address.country && 
                  <InfoRow label="País" value={address.country} className="mb-2" />
                }
                {/* Teléfono */} 
                {address.phone && 
                  <InfoRow label="Teléfono de Contacto" value={address.phone} />
                }
              </div>
            </div>
          ) : (
            <p className="text-muted">No hay dirección de envío registrada.</p>
          )}
        </InfoBlock>
      </div>
    </div>
  );
}; 