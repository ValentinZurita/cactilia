import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useShippingServices } from '../hooks/useShippingServices';
import { useMexicanPostalCodes } from '../hooks/useMexicanPostalCodes';
import { ShippingBasicInfo } from './ShippingBasicInfo';
import { ShippingServicesSection } from './ShippingServicesSection';
import { ShippingAdvancedSection } from './ShippingAdvancedSection';

/**
 * Formulario renovado para crear o editar reglas de envío.
 * Versión simplificada que utiliza componentes modulares.
 */
export const ShippingForm = ({ rule, isEdit = false, onSave, onCancel, onComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [hasZipConflicts, setHasZipConflicts] = useState(false);
  const [conflictingZips, setConflictingZips] = useState([]);

  // Obtener servicios de envío disponibles
  const {
    services,
    loading: loadingServices,
    createService,
    refreshServices
  } = useShippingServices();

  // Usar hook para códigos postales mexicanos
  const { checkZipExists } = useMexicanPostalCodes();

  // Configurar react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      zona: '',
      estado: '',
      precio_base: 0,
      activo: true,
      envio_gratis: false,
      codigos_postales: [],
      opciones_mensajeria: [],
      envio_variable: {
        aplica: false,
        envio_gratis_monto_minimo: 999,
        costo_por_producto_extra: 0
      },
      productos_restringidos: [],
      es_regla_estado: false,
      prioridad: 1 // 1: Normal, 2: Alta (específica), 0: Baja (general)
    }
  });

  // Observar valores importantes
  const watchZipCodes = watch('codigos_postales', []);
  const watchIsStateRule = watch('es_regla_estado');
  const watchEstado = watch('estado');

  // Cargar datos de la regla si estamos en modo edición
  useEffect(() => {
    if (isEdit && rule) {
      // Establecer los valores del formulario
      reset({
        zona: rule.zona || '',
        estado: rule.estado || '',
        precio_base: rule.precio_base || 0,
        activo: rule.activo !== undefined ? rule.activo : true,
        envio_gratis: rule.envio_gratis || false,
        opciones_mensajeria: rule.opciones_mensajeria || [],
        es_regla_estado: rule.es_regla_estado || false,
        prioridad: rule.prioridad || 1,
        codigos_postales: rule.codigos_postales || [],
        productos_restringidos: rule.productos_restringidos || [],
        envio_variable: rule.envio_variable || {
          aplica: false,
          envio_gratis_monto_minimo: 999,
          costo_por_producto_extra: 0
        }
      });
    }
  }, [isEdit, rule, reset]);

  // Verificar conflictos de códigos postales
  useEffect(() => {
    const checkZipConflicts = async () => {
      // Si la regla está basada en estado, no necesitamos verificar
      if (watchIsStateRule && watchEstado) {
        setHasZipConflicts(false);
        setConflictingZips([]);
        return;
      }

      // Si no hay códigos postales, no hay conflictos
      const zipCodes = watchZipCodes || [];
      if (zipCodes.length === 0) {
        setHasZipConflicts(false);
        setConflictingZips([]);
        return;
      }

      // Verificar conflictos para cada código postal
      const conflicts = [];
      for (const zipData of zipCodes) {
        const zipCode = zipData.codigo;
        const result = await checkZipExists(zipCode, isEdit ? rule?.id : null);

        if (result.exists) {
          conflicts.push({
            zipCode,
            conflictRule: result.rule
          });
        }
      }

      setHasZipConflicts(conflicts.length > 0);
      setConflictingZips(conflicts);
    };

    checkZipConflicts();
  }, [watchZipCodes, watchIsStateRule, watchEstado, checkZipExists, isEdit, rule?.id]);

  // Manejar envío del formulario
  const onSubmit = async (data) => {
    setProcessing(true);
    setError(null);

    // Validar que haya al menos un código postal o un estado seleccionado
    if (!data.es_regla_estado && (!data.codigos_postales || data.codigos_postales.length === 0)) {
      setError('Debes seleccionar al menos un código postal o activar la regla por estado');
      setProcessing(false);
      return;
    }

    if (data.es_regla_estado && !data.estado) {
      setError('Debes seleccionar un estado cuando la regla es por estado');
      setProcessing(false);
      return;
    }

    // Verificar conflictos de códigos postales
    if (hasZipConflicts) {
      setError(`Existen conflictos con ${conflictingZips.length} códigos postales. Revisa la sección de códigos postales.`);
      setProcessing(false);
      setActiveSection('basic');
      return;
    }

    try {
      // Formatear valores numéricos
      const formattedData = {
        ...data,
        precio_base: parseFloat(data.precio_base)
      };

      // Configurar envío variable
      if (!data.envio_variable.aplica) {
        formattedData.envio_variable = { aplica: false };
      } else {
        formattedData.envio_variable = {
          ...data.envio_variable,
          envio_gratis_monto_minimo: parseFloat(data.envio_variable.envio_gratis_monto_minimo),
          costo_por_producto_extra: parseFloat(data.envio_variable.costo_por_producto_extra),
        };
      }

      // Guardar la regla
      const result = await onSave(isEdit ? rule.id : null, formattedData);

      if (result.ok) {
        onComplete();
      } else {
        setError(result.error || 'Error al guardar la regla de envío');
      }
    } catch (err) {
      console.error('Error en el formulario:', err);
      setError(err.message || 'Error al procesar el formulario');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="shipping-form">
      {/* Mensaje de error */}
      {error && (
        <div className="alert alert-danger py-2 mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {/* Tabs de navegación */}
      <nav className="nav nav-tabs flex-nowrap mb-4 overflow-auto">
        <button
          className={`nav-link border-0 ${activeSection === 'basic' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('basic')}
          type="button"
        >
          <i className={`bi bi-info-circle me-2 ${activeSection === 'basic' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Información Básica</span>
        </button>
        <button
          className={`nav-link border-0 ${activeSection === 'services' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('services')}
          type="button"
        >
          <i className={`bi bi-truck me-2 ${activeSection === 'services' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Servicios</span>
        </button>
        <button
          className={`nav-link border-0 ${activeSection === 'advanced' ? 'active bg-dark text-white fw-medium' : 'text-secondary'}`}
          onClick={() => setActiveSection('advanced')}
          type="button"
        >
          <i className={`bi bi-gear me-2 ${activeSection === 'advanced' ? 'text-white' : ''}`}></i>
          <span className="d-none d-sm-inline">Configuración Avanzada</span>
        </button>
      </nav>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            {/* Sección de información básica */}
            {activeSection === 'basic' && (
              <ShippingBasicInfo
                control={control}
                errors={errors}
                setValue={setValue}
                watch={watch}
                hasZipConflicts={hasZipConflicts}
                conflictingZips={conflictingZips}
              />
            )}

            {/* Sección de servicios de mensajería */}
            {activeSection === 'services' && (
              <ShippingServicesSection
                control={control}
                services={services}
                loadingServices={loadingServices}
                refreshServices={refreshServices}
                createService={createService}
              />
            )}

            {/* Sección de configuración avanzada */}
            {activeSection === 'advanced' && (
              <ShippingAdvancedSection
                control={control}
                errors={errors}
                watch={watch}
              />
            )}

            {/* Botones de acción */}
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <button
                type="button"
                className="btn btn-outline-secondary rounded-3"
                onClick={onCancel}
                disabled={processing}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-outline-dark rounded-3"
                disabled={processing || hasZipConflicts}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    {isEdit ? 'Actualizar Regla' : 'Crear Regla'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};