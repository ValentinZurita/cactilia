import React from 'react';
import { Link } from 'react-router-dom';
import { IconCircle } from '../common/IconCircle.jsx';
import { InfoBlock } from '../common/InfoBlock.jsx';
import { InfoRow } from '../common/InfoRow.jsx';

/**
 * Muestra la información del cliente y la dirección de envío en los detalles del pedido del admin.
 */
export const OrderCustomerInfo = ({ order, userData, loadingUser }) => {
  
  const address = order.shippingAddress || {}; 

  return (
    <div className="row g-4">

      <div className="col-md-6 mb-4 mb-md-0">
        <InfoBlock title="Cliente">
          {loadingUser ? (
            <p className="text-muted">Cargando datos del cliente...</p>
          ) : userData ? (
            <div className="d-flex align-items-center">
              <IconCircle icon="person-circle" /> 
              <div>
                <p className="mb-1 fw-medium">
                  {userData.firstName || ''} {userData.lastName || ''}
                </p>
                {userData.email && (
                  <p className="mb-1 text-secondary small">
                    <i className="bi bi-envelope me-1"></i>
                    {userData.email}
                  </p>
                )}
                {userData.phoneNumber && (
                  <p className="mb-1 text-secondary small">
                    <i className="bi bi-telephone me-1"></i>
                    {userData.phoneNumber}
                  </p>
                )}
                {order.userId && 
                  <Link 
                    to={`/admin/users/customers/view/${order.userId}`}
                    className="small mt-2 d-inline-block"
                  >
                    Ver cliente
                  </Link>
                }
              </div>
            </div>
          ) : (
            <p className="text-muted">No se pudieron cargar los datos del cliente.</p>
          )}
          {order.notes && (
            <div className="mt-4 pt-3 border-top">
                <h6 className="small text-secondary fw-normal mb-2">Notas del cliente</h6>
                <p className="mb-0 small fst-italic">{order.notes}</p>
            </div>
           )}
        </InfoBlock>
      </div>

      <div className="col-md-6">
        <InfoBlock title="Dirección de Envío">
          {Object.keys(address).length > 0 ? (
            <div className="d-flex align-items-start">
              <IconCircle icon="geo-alt-fill" className="mt-1" />
              <div>
                {(address.firstName || address.lastName) && 
                  <InfoRow label="Recibe" value={`${address.firstName || ''} ${address.lastName || ''}`} className="mb-2" />
                }
                {address.phone && 
                  <InfoRow label="Teléfono de Contacto" value={address.phone} className="mb-2" />
                }
                {(address.street || address.number || address.numExt) &&
                  <InfoRow label="Calle y Número" value={`${address.street || ''}${address.number || address.numExt ? ` #${address.number || address.numExt}` : ''}`} className="mb-2" />
                }
                {(address.details || address.numInt) && 
                  <InfoRow label="Interior/Depto/Detalles" value={address.details || address.numInt} className="mb-2" />
                }
                {(address.neighborhood || address.colonia) &&
                  <InfoRow label="Colonia" value={address.neighborhood || address.colonia} className="mb-2" />
                }
                {(address.postalCode || address.zip) &&
                  <InfoRow label="Código Postal" value={address.postalCode || address.zip} className="mb-2" />
                }
                {address.city && 
                  <InfoRow label="Ciudad" value={address.city} className="mb-2" />
                }
                {address.state && 
                  <InfoRow label="Estado" value={address.state} className="mb-2" />
                }
                {address.country && 
                  <InfoRow label="País" value={address.country} className="mb-2" />
                }
                {address.references && 
                  <InfoRow label="Referencias" value={address.references} />
                }
              </div>
            </div>
          ) : (
             <div className="d-flex align-items-center text-muted">
              <IconCircle icon="geo-alt" />
              <p className="mb-0 small">No hay información de dirección disponible</p>
            </div>
          )}
        </InfoBlock>
      </div>
    </div>
  );
};