import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente reutilizable para mostrar badges de estado
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado a mostrar
 * @param {string} props.className - Clases adicionales
 * @param {Object} props.statusConfig - Configuración de estados (opcional)
 * @returns {JSX.Element}
 */
export const StatusBadge = ({
                              status,
                              className = '',
                              statusConfig = {
                                success: { bg: 'bg-success', text: 'text-white' },
                                warning: { bg: 'bg-warning', text: 'text-dark' },
                                danger: { bg: 'bg-danger', text: 'text-white' },
                                info: { bg: 'bg-info', text: 'text-dark' },
                                secondary: { bg: 'bg-secondary', text: 'text-white' },
                              }
                            }) => {
  // Determinar el tipo de estado
  const getStatusType = () => {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'completed':
      case 'succeeded':
        return 'success';
      case 'processing':
      case 'shipped':
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
      case 'payment_failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const statusType = getStatusType();
  const config = statusConfig[statusType] || statusConfig.secondary;

  return (
    <span className={`badge ${config.bg} ${config.text} ${className}`}>
      {status}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
  statusConfig: PropTypes.object
};