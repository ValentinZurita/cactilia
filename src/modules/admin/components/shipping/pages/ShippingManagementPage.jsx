import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShippingTable } from '../table/ShippingTable';
import { ShippingForm } from '../form/ShippingForm';
import { ShippingImporter } from '../importer/ShippingImporter';
import { useShippingRules } from '../hooks/useShippingRules';

/**
 * Página principal para la gestión de reglas de envío.
 * Versión renovada con estilo similar al módulo de Orders
 */
export const ShippingManagementPage = () => {
  const { mode, id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const {
    shippingRules,
    loading,
    error,
    selectedRule,
    createShippingRule,
    updateShippingRule,
    deleteShippingRule,
    getShippingRuleById,
    importShippingRules,
    filterShippingRules
  } = useShippingRules();

  // Cargar la regla para editar si estamos en modo 'edit'
  useEffect(() => {
    if (mode === 'edit' && id) {
      getShippingRuleById(id);
    }
  }, [mode, id, getShippingRuleById]);

  // Manejar cambio en la búsqueda
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterShippingRules(term);
  };

  // Manejar navegación
  const handleBackToList = () => navigate('/admin/shipping');
  const handleCreateNew = () => navigate('/admin/shipping/create');
  const handleEditRule = (ruleId) => navigate(`/admin/shipping/edit/${ruleId}`);
  const handleImport = () => navigate('/admin/shipping/import');

  // Título dinámico según el modo
  const getPageTitle = () => {
    switch (mode) {
      case 'create': return 'Nueva Regla de Envío';
      case 'edit': return 'Editar Regla de Envío';
      case 'import': return 'Importar Reglas de Envío';
      default: return 'Gestión de Envíos';
    }
  };

  // Renderizar vista según el modo
  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <ShippingForm
            onSave={createShippingRule}
            onCancel={handleBackToList}
            onComplete={handleBackToList}
          />
        );
      case 'edit':
        return (
          <ShippingForm
            rule={selectedRule}
            isEdit={true}
            onSave={updateShippingRule}
            onCancel={handleBackToList}
            onComplete={handleBackToList}
          />
        );
      case 'import':
        return (
          <ShippingImporter
            onImport={importShippingRules}
            onCancel={handleBackToList}
            onComplete={handleBackToList}
          />
        );
      default:
        return (
          <ShippingTable
            rules={shippingRules}
            loading={loading}
            error={error}
            onEdit={handleEditRule}
            onDelete={deleteShippingRule}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            onCreateNew={handleCreateNew}
            onImport={handleImport}
          />
        );
    }
  };

  return (
    <div className="order-management-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title fw-medium mb-0">
          {getPageTitle()}
        </h3>

        {/* Botón para volver en vistas de detalle/creación/edición */}
        {(mode === 'create' || mode === 'edit' || mode === 'import') && (
          <button
            className="btn btn-outline-secondary rounded-3"
            onClick={handleBackToList}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        )}
      </div>

      {/* Mostrar error global si existe */}
      {error && !['create', 'edit', 'import'].includes(mode) && (
        <div className="alert alert-danger py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {renderContent()}
    </div>
  );
};