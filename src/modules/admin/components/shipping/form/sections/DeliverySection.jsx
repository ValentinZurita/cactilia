import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { DataTable } from '../../../../common/components/DataTable';
import { ActionButtonsContainer } from '../../../../common/components/ActionButtonsContainer';
import { ActionButton } from '../../../../common/components/ActionButton';
import { CreateButton } from '../../../../common/components/CreateButton';
import AddShippingMethodManualModal from '../components/AddShippingMethodManualModal';

/**
 * Componente para la configuración de métodos de envío disponibles
 */
const DeliverySection = ({ control, errors: formErrors, watch, setValue }) => {
  // Estado para el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Lista de servicios de mensajería disponibles (podría moverse al Modal si solo se usa ahí)
  const availableCarriers = [
    'DHL', 'Estafeta', 'FedEx', 'Redpack', 
    'Correos de México', 'Entrega local', 'Otros'
  ];

  // Obtener tipos de envío actuales para la tabla y para añadir
  const shippingTypes = watch('shippingTypes') || [];

  // --- Callbacks --- 

  // Función para guardar el nuevo método desde el modal
  const handleSaveNewMethod = useCallback((newMethodData) => {
    const currentTypes = watch('shippingTypes') || [];
    // Generar ID y código único aquí o asegurarse que viene del modal
    const methodToAdd = {
      id: uuidv4(), // Generar ID aquí
      ...newMethodData, // Datos del formulario del modal
      // Asegurarse que name (código único) se genera correctamente si no viene del modal
    };
    setValue('shippingTypes', [...currentTypes, methodToAdd]);
    setIsModalOpen(false); // Cerrar modal al guardar
  }, [watch, setValue]);

  // Elimina un tipo de envío existente
  const handleRemoveShippingType = useCallback((id) => {
    const currentTypes = watch('shippingTypes') || [];
    const updatedTypes = currentTypes.filter(type => type.id !== id);
    setValue('shippingTypes', updatedTypes, { shouldValidate: true });
  }, [setValue, watch]);

  // --- Configuración de Columnas para DataTable --- 
  const columns = useMemo(() => [
    {
      key: 'carrier',
      header: 'Servicio',
      renderCell: (type) => type.carrier || 'N/A'
    },
    {
      key: 'label',
      header: 'Nombre',
      renderCell: (type) => <span className="fw-medium">{type.label || 'N/A'}</span>
    },
    {
      key: 'price',
      header: 'Precio',
      headerClassName: 'text-end',
      cellClassName: 'text-end',
      renderCell: (type) => type.price != null ? `$${parseFloat(type.price).toFixed(2)}` : 'N/A'
    },
    {
      key: 'deliveryDays',
      header: 'Entrega',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      renderCell: (type) => `${type.minDays || '-'}-${type.maxDays || '-'} días`
    },
    {
      key: 'packageConfig',
      header: 'Config. paquete',
      headerClassName: 'text-center',
      cellClassName: 'text-center',
      renderCell: (type) => (
        <span className="badge bg-light text-dark border">
          <i className="bi bi-box me-1"></i>
          {type.maxPackageWeight || '-'} kg / {type.maxProductsPerPackage || '-'} u.
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      cellClassName: 'text-end',
      renderCell: (type) => (
        <ActionButtonsContainer size="sm">
          <ActionButton
            iconClass="bi bi-trash"
            title="Eliminar método"
            onClick={() => handleRemoveShippingType(type.id)}
            variant="light"
            textColor="secondary"
            hoverTextColor="danger"
            isLast={true}
          />
        </ActionButtonsContainer>
      )
    }
  ], [handleRemoveShippingType]);

  // --- Renderizado --- 
  return (
    <div className="py-3 position-relative">

      <div className="mb-4">
        <DataTable
          data={shippingTypes}
          columns={columns}
          keyExtractor={(type) => type.id}
          emptyStateTitle="No hay opciones de envío configuradas"
          emptyStateMessage="Añade tu primera opción de envío usando el botón +."
        />
      </div>

      <CreateButton 
        onClick={() => setIsModalOpen(true)}
        isFab={true}
      />

      <AddShippingMethodManualModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewMethod}
        availableCarriers={availableCarriers}
      />

      {formErrors?.shippingTypes && (
        <div className="alert alert-danger mt-3 mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {formErrors.shippingTypes.message}
        </div>
      )}
    </div>
  );
};

DeliverySection.propTypes = {
  control: PropTypes.object.isRequired,
  errors: PropTypes.object,
  watch: PropTypes.func.isRequired,
  setValue: PropTypes.func.isRequired
};

export default DeliverySection; 