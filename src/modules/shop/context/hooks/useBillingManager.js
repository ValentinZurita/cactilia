import { useState, useCallback } from 'react';

/**
 * Hook personalizado para gestionar la información fiscal (facturación)
 *
 * Centraliza toda la lógica relacionada con:
 * - Gestión del estado de facturación (requerida o no)
 * - Datos fiscales del cliente
 *
 * @returns {Object} Estado y métodos para gestión de información fiscal
 */
export const useBillingManager = () => {
  // Estados para facturación
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState({
    rfc: '',
    businessName: '',
    email: '',
    regimenFiscal: '',
    usoCFDI: '',
    postalCode: '',
    street: '',
    extNumber: '',
    intNumber: '',
    neighborhood: '',
    city: '',
    state: '',
  });

  // Manejador para requerir factura
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);

    // Si ya no requiere factura, limpiar datos fiscales (mantener valores vacíos)
    if (!requires) {
      setFiscalData({
        rfc: '',
        businessName: '',
        email: '',
        regimenFiscal: '',
        usoCFDI: '',
        postalCode: '',
        street: '',
        extNumber: '',
        intNumber: '',
        neighborhood: '',
        city: '',
        state: '',
      });
    }
  }, []);

  // Manejador para actualizar datos fiscales
  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(prev => ({ ...prev, ...data }));
  }, []);

  return {
    // Estado
    requiresInvoice,
    fiscalData,

    // Métodos
    handleInvoiceChange,
    handleFiscalDataChange
  };
};