import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShippingTable } from '../table/ShippingTable';
import { ShippingForm } from '../form/ShippingForm';
import { ShippingImporter } from '../importer/ShippingImporter';
import { useShippingRules } from '../hooks/useShippingRules';
import { SearchBar } from '../../shared/SearchBar.jsx';

/**
 * Página principal para la gestión de reglas de envío.
 * Maneja la visualización, creación, edición e importación de reglas de envío.
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
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterShippingRules(e.target.value);
  };

  // Limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    filterShippingRules('');
  };

  // Manejar navegación
  const goToList = () => navigate('/admin/shipping');
  const goToCreate = () => navigate('/admin/shipping/create');
  const goToEdit = (ruleId) => navigate(`/admin/shipping/edit/${ruleId}`);
  const goToImport = () => navigate('/admin/shipping/import');

  // Manejar guardado
  const handleRuleSaved = () => {
    goToList();
  };

  // Manejar importación
  const handleImportComplete = () => {
    goToList();
  };

  // Renderizar según el modo
  const renderContent = () => {
    switch (mode) {
      case 'create':
        return (
          <ShippingForm
            onSave={createShippingRule}
            onCancel={goToList}
            onComplete={handleRuleSaved}
          />
        );
      case 'edit':
        return (
          <ShippingForm
            rule={selectedRule}
            isEdit={true}
            onSave={updateShippingRule}
            onCancel={goToList}
            onComplete={handleRuleSaved}
          />
        );
      case 'import':
        return (
          <ShippingImporter
            onImport={importShippingRules}
            onCancel={goToList}
            onComplete={handleImportComplete}
          />
        );
      default:
        return (
          <>
            {/* Barra de búsqueda */}
            <div className="d-flex justify-content-between mb-4">
              <div className="w-75">
                <SearchBar
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClear={handleClearSearch}
                  placeholder="Buscar por código postal o zona..."
                  size="lg"
                />
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={goToImport}
                >
                  <i className="bi bi-file-earmark-arrow-up me-2"></i>
                  Importar CSV
                </button>
                <button
                  className="btn btn-primary"
                  onClick={goToCreate}
                >
                  <i className="bi bi-plus-lg me-2"></i>
                  Nueva Regla
                </button>
              </div>
            </div>

            {/* Tabla de reglas de envío */}
            <ShippingTable
              rules={shippingRules}
              loading={loading}
              error={error}
              onEdit={goToEdit}
              onDelete={deleteShippingRule}
            />
          </>
        );
    }
  };

  return (
    <div className="shipping-management-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          {mode === 'create' && 'Crear Nueva Regla de Envío'}
          {mode === 'edit' && 'Editar Regla de Envío'}
          {mode === 'import' && 'Importar Reglas de Envío'}
          {!mode && 'Gestión de Envíos'}
        </h2>

        {(mode === 'create' || mode === 'edit' || mode === 'import') && (
          <button
            className="btn btn-outline-secondary"
            onClick={goToList}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {renderContent()}
    </div>
  );
};