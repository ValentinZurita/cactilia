import React from 'react';
import { Link } from 'react-router-dom';
import { OrderStatusBadge } from '../orders/status/OrderStatusBadge.jsx'; // Reutilizar badge de estado
import { formatDate, formatCurrency } from '../../../../utils/formatting/formatters.js'; // Utilidades de formato
// Importar el componente de tabla común
import { DataTable } from '../../common/components/DataTable.jsx'; 

/**
 * Muestra una tabla con el historial de pedidos de un usuario usando DataTable.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.orders - Array de objetos de pedido
 * @returns {JSX.Element}
 */
export const UserOrdersTable = ({ orders }) => {

  if (!orders || orders.length === 0) {
    // Esto no debería ocurrir si se usa EmptyOrdersSection, pero por seguridad
    return <p className="text-muted small">No hay pedidos para mostrar.</p>;
  }

  // Definir configuración de columnas para DataTable
  const columns = [
    {
      key: 'id',
      header: 'ID Pedido',
      // Renderizar celda con enlace
      renderCell: (order) => (
        <Link 
          to={`/admin/orders/view/${order.id}`}
          // Clases para estilo sutil: texto oscuro, sin decoración, subrayado en hover
          className="text-dark text-decoration-none link-underline-opacity-0 link-underline-opacity-75-hover" 
          title="Ver detalles del pedido"
        >
          #{order.id.substring(0, 8)}...
        </Link>
      )
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      renderCell: (order) => formatDate(order.createdAt)
    },
    {
      key: 'status',
      header: 'Estado',
      renderCell: (order) => <OrderStatusBadge status={order.status} />
    },
    {
      key: 'total',
      header: 'Total',
      // Clase para alinear a la derecha
      headerClassName: 'text-end', 
      renderCell: (order) => (
        <span className="d-block text-end"> {/* Asegurar alineación derecha del contenido */} 
          {formatCurrency(order.totals?.finalTotal || 0)}
        </span>
      )
    }
  ];

  return (
    // Usar el componente DataTable
    <DataTable
      data={orders}
      columns={columns}
      // Aplicar clases para estilo minimalista
      tableClass="table-sm border-top" 
      // Pasar la función para extraer la key única de cada fila
      keyExtractor={(order) => order.id} 
      // Podemos omitir theadClass si queremos el default (probablemente light)
      // theadClass="table-light" 
    />
  );
}; 