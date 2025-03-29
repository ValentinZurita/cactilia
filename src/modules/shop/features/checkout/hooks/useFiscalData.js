import { useState, useCallback } from 'react';

/**
 * Hook para manejar los datos fiscales (facturación) en el checkout
 *
 * @returns {Object} Estados y funciones para manejo de datos fiscales
 */
export const useFiscalData = () => {
  // Estados para facturación
  const [requiresInvoice, setRequiresInvoice] = useState(false);
  const [fiscalData, setFiscalData] = useState({
    rfc: '',
    businessName: '',
    email: '',
    regimenFiscal: '',
    usoCFDI: 'G03' // Por defecto: Gastos en general
  });

  // Manejador para cambio en requerimiento de factura
  const handleInvoiceChange = useCallback((requires) => {
    setRequiresInvoice(requires);
    // Si ya no requiere factura, limpiamos los datos fiscales
    if (!requires) {
      setFiscalData({
        rfc: '',
        businessName: '',
        email: '',
        regimenFiscal: '',
        usoCFDI: 'G03'
      });
    }
  }, []);

  // Manejador para cambios en datos fiscales
  const handleFiscalDataChange = useCallback((data) => {
    setFiscalData(prev => ({
      ...prev,
      ...data
    }));
  }, []);

  return {
    requiresInvoice,
    data: fiscalData,
    handleInvoiceChange,
    handleFiscalDataChange
  };
};