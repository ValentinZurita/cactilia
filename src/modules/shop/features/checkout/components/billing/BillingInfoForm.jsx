import React, { useState, useEffect } from 'react';
import { isValidEmail, isValidRFC } from '../../../../utils/validation.js';

/**
 * BillingInfoForm - Formulario para datos fiscales (facturación electrónica)
 * Permite al usuario indicar si requiere factura y proporcionar los datos necesarios
 *
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.requiresInvoice - Indica si el usuario requiere factura
 * @param {Function} props.onRequiresInvoiceChange - Función para actualizar requerimiento de factura
 * @param {Object} props.fiscalData - Datos fiscales actuales
 * @param {Function} props.onFiscalDataChange - Función para actualizar datos fiscales
 */
export const BillingInfoForm = ({
                                  requiresInvoice,
                                  onRequiresInvoiceChange,
                                  fiscalData,
                                  onFiscalDataChange
                                }) => {
  // Estado local para los datos fiscales
  const [localFiscalData, setLocalFiscalData] = useState({
    rfc: '',
    businessName: '',
    email: '',
    regimenFiscal: '',
    usoCFDI: 'G03', // Por defecto: Gastos en general
    ...fiscalData
  });

  // Lista de regímenes fiscales para México
  const regimenesFiscales = [
    { value: '601', label: '601 - General de Ley Personas Morales' },
    { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
    { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
    { value: '606', label: '606 - Arrendamiento' },
    { value: '608', label: '608 - Demás ingresos' },
    { value: '609', label: '609 - Consolidación' },
    { value: '610', label: '610 - Residentes en el Extranjero sin Establecimiento Permanente en México' },
    { value: '611', label: '611 - Ingresos por Dividendos (socios y accionistas)' },
    { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
    { value: '614', label: '614 - Ingresos por intereses' },
    { value: '616', label: '616 - Sin obligaciones fiscales' },
    { value: '620', label: '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos' },
    { value: '621', label: '621 - Incorporación Fiscal' },
    { value: '622', label: '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras' },
    { value: '623', label: '623 - Opcional para Grupos de Sociedades' },
    { value: '624', label: '624 - Coordinados' },
    { value: '625', label: '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas' },
    { value: '626', label: '626 - Régimen Simplificado de Confianza' }
  ];

  // Lista de usos de CFDI
  const usosCFDI = [
    { value: 'G01', label: 'G01 - Adquisición de mercancías' },
    { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
    { value: 'G03', label: 'G03 - Gastos en general' },
    { value: 'I01', label: 'I01 - Construcciones' },
    { value: 'I02', label: 'I02 - Mobiliario y equipo de oficina' },
    { value: 'I03', label: 'I03 - Equipo de transporte' },
    { value: 'I04', label: 'I04 - Equipo de cómputo' },
    { value: 'I05', label: 'I05 - Dados, troqueles, moldes, matrices y herramental' },
    { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
    { value: 'I07', label: 'I07 - Comunicaciones satelitales' },
    { value: 'I08', label: 'I08 - Otra maquinaria y equipo' },
    { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
    { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
    { value: 'D03', label: 'D03 - Gastos funerales' },
    { value: 'D04', label: 'D04 - Donativos' },
    { value: 'D05', label: 'D05 - Intereses reales efectivamente pagados por créditos hipotecarios' },
    { value: 'D06', label: 'D06 - Aportaciones voluntarias al SAR' },
    { value: 'D07', label: 'D07 - Primas por seguros de gastos médicos' },
    { value: 'D08', label: 'D08 - Gastos de transportación escolar obligatoria' },
    { value: 'D09', label: 'D09 - Depósitos en cuentas para el ahorro' },
    { value: 'D10', label: 'D10 - Pagos por servicios educativos' },
    { value: 'S01', label: 'S01 - Sin efectos fiscales' },
    { value: 'CP01', label: 'CP01 - Pagos' },
    { value: 'CN01', label: 'CN01 - Nómina' }
  ];

  // Actualizar estado principal cuando cambian los datos locales
  useEffect(() => {
    if (requiresInvoice) {
      onFiscalDataChange(localFiscalData);
    }
  }, [localFiscalData, requiresInvoice, onFiscalDataChange]);

  // Manejar cambios en los inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFiscalData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Verificar si el email es válido
  const isEmailValid = !localFiscalData.email || isValidEmail(localFiscalData.email);

  return (
    <div className="billing-info-form">
      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          id="requiresInvoice"
          checked={requiresInvoice}
          onChange={(e) => onRequiresInvoiceChange(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="requiresInvoice">
          Requiero factura electrónica (CFDI)
        </label>
      </div>

      {requiresInvoice && (
        <div className="fiscal-data-form">
          <div className="row g-3">
            {/* RFC */}
            <div className="col-md-6">
              <label htmlFor="rfc" className="form-label">RFC*</label>
              <input
                type="text"
                className={`form-control ${!isValidRFC(localFiscalData.rfc) && localFiscalData.rfc ? 'is-invalid' : ''}`}
                id="rfc"
                name="rfc"
                value={localFiscalData.rfc}
                onChange={handleInputChange}
                placeholder="Ej. XAXX010101000"
                required
              />
              {!isValidRFC(localFiscalData.rfc) && localFiscalData.rfc && (
                <div className="invalid-feedback">
                  RFC inválido. Debe tener formato válido para persona física o moral.
                </div>
              )}
              <small className="form-text text-muted">
                Para personas físicas: 13 caracteres. Para personas morales: 12 caracteres.
              </small>
            </div>

            {/* Régimen Fiscal */}
            <div className="col-md-6">
              <label htmlFor="regimenFiscal" className="form-label">Régimen Fiscal*</label>
              <select
                className="form-select"
                id="regimenFiscal"
                name="regimenFiscal"
                value={localFiscalData.regimenFiscal}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                {regimenesFiscales.map(regimen => (
                  <option key={regimen.value} value={regimen.value}>
                    {regimen.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Razón Social */}
            <div className="col-md-12">
              <label htmlFor="businessName" className="form-label">Razón Social / Nombre*</label>
              <input
                type="text"
                className="form-control"
                id="businessName"
                name="businessName"
                value={localFiscalData.businessName}
                onChange={handleInputChange}
                placeholder="Razón social o nombre completo"
                required
              />
            </div>

            {/* Email para facturación */}
            <div className="col-md-6">
              <label htmlFor="email" className="form-label">Email para facturación*</label>
              <input
                type="email"
                className={`form-control ${!isEmailValid ? 'is-invalid' : ''}`}
                id="email"
                name="email"
                value={localFiscalData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                required
              />
              {!isEmailValid && (
                <div className="invalid-feedback">
                  Email inválido. Por favor ingresa un correo electrónico válido.
                </div>
              )}
            </div>

            {/* Uso de CFDI */}
            <div className="col-md-6">
              <label htmlFor="usoCFDI" className="form-label">Uso de CFDI*</label>
              <select
                className="form-select"
                id="usoCFDI"
                name="usoCFDI"
                value={localFiscalData.usoCFDI}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccione...</option>
                {usosCFDI.map(uso => (
                  <option key={uso.value} value={uso.value}>
                    {uso.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            Los campos marcados con * son obligatorios para generar tu factura electrónica.
          </div>
        </div>
      )}
    </div>
  );
};