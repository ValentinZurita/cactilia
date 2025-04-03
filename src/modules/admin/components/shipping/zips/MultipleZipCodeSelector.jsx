import React, { useState, useEffect } from 'react';
import { Controller, useFieldArray } from 'react-hook-form';
import { useMexicanPostalCodes } from '../hooks/useMexicanPostalCodes';

/**
 * Componente para seleccionar múltiples códigos postales y estados.
 * Soporta selección individual o por estado completo.
 */
export const MultipleZipCodeSelector = ({ control, name = 'codigos_postales', errors }) => {
  const [zipInput, setZipInput] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [showStateSelector, setShowStateSelector] = useState(false);
  const [inputError, setInputError] = useState('');

  const { fields, append, remove } = useFieldArray({
    control,
    name
  });

  const {
    states,
    zipsByState,
    zipDetails,
    loading,
    error,
    loadStates,
    getZipsByState,
    validateZipCode,
    checkZipExists
  } = useMexicanPostalCodes();

  // Cargar estados al montar el componente
  useEffect(() => {
    loadStates();
  }, [loadStates]);

  // Validar código postal
  const validateAndAddZip = async () => {
    // Limpiar errores anteriores
    setInputError('');

    // Validar formato
    if (!zipInput.match(/^\d{5}$/)) {
      setInputError('El código postal debe tener 5 dígitos');
      return;
    }

    try {
      // Verificar si el código postal es válido
      const validationResult = await validateZipCode(zipInput);

      if (!validationResult.valid) {
        setInputError(validationResult.error || 'Código postal no válido');
        return;
      }

      // Verificar si el código ya está en la lista
      if (fields.some(field => field.codigo === zipInput)) {
        setInputError('Este código postal ya está en la lista');
        return;
      }

      // Añadir el código a la lista
      append({
        codigo: zipInput,
        colonia: validationResult.data?.colonia || '',
        municipio: validationResult.data?.municipio || '',
        estado: validationResult.data?.estado || ''
      });

      // Limpiar input
      setZipInput('');
    } catch (error) {
      console.error('Error validando código postal:', error);
      setInputError('Error validando el código postal');
    }
  };

  // Añadir múltiples códigos postales separados por comas
  const handleAddMultipleZips = () => {
    // Separar códigos por comas, espacios, saltos de línea o tabulaciones
    const zips = zipInput.split(/[,\s\n\t]+/).filter(Boolean);

    if (zips.length === 0) {
      setInputError('Ingresa al menos un código postal válido');
      return;
    }

    // Eliminar duplicados
    const uniqueZips = [...new Set(zips)];

    // Validar cada código
    const invalidZips = uniqueZips.filter(zip => !zip.match(/^\d{5}$/));

    if (invalidZips.length > 0) {
      setInputError(`Códigos postales inválidos: ${invalidZips.join(', ')}`);
      return;
    }

    // Filtrar códigos que ya están en la lista
    const existingZips = fields.map(field => field.codigo);
    const newZips = uniqueZips.filter(zip => !existingZips.includes(zip));

    // Añadir nuevos códigos
    Promise.all(newZips.map(async zip => {
      try {
        const validationResult = await validateZipCode(zip);
        if (validationResult.valid) {
          append({
            codigo: zip,
            colonia: validationResult.data?.colonia || '',
            municipio: validationResult.data?.municipio || '',
            estado: validationResult.data?.estado || ''
          });
        }
      } catch (error) {
        console.error(`Error validando el código ${zip}:`, error);
      }
    }));

    // Limpiar input
    setZipInput('');
  };

  // Añadir todos los códigos postales de un estado
  const handleAddStateZips = async () => {
    if (!selectedState) return;

    try {
      // Obtener todos los códigos postales del estado
      const stateZips = await getZipsByState(selectedState);

      if (!stateZips.ok) {
        throw new Error(stateZips.error || 'Error obteniendo códigos postales');
      }

      // Filtrar códigos que ya están en la lista
      const existingZips = fields.map(field => field.codigo);
      const newZips = stateZips.data.filter(zip => !existingZips.includes(zip.codigo));

      // Añadir nuevos códigos
      newZips.forEach(zipData => {
        append({
          codigo: zipData.codigo,
          colonia: zipData.colonia || '',
          municipio: zipData.municipio || '',
          estado: zipData.estado || selectedState
        });
      });

      // Ocultar selector de estado y resetear selección
      setShowStateSelector(false);
      setSelectedState('');

    } catch (error) {
      console.error(`Error añadiendo códigos de ${selectedState}:`, error);
      setInputError(`Error al obtener códigos postales de ${selectedState}`);
    }
  };

  return (
    <div className="multiple-zip-selector">
      <div className="mb-4">
        {/* Entrada manual de código postal */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <label className="form-label text-secondary small">Código Postal</label>
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${inputError ? 'is-invalid' : ''}`}
                placeholder="Ingresa uno o múltiples CP separados por comas"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
                aria-label="Código postal"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleAddMultipleZips}
                disabled={!zipInput.trim()}
              >
                <i className="bi bi-plus-lg"></i> Añadir
              </button>
            </div>
            {inputError && (
              <div className="invalid-feedback d-block">{inputError}</div>
            )}
            <div className="form-text small">
              <i className="bi bi-info-circle me-1"></i>
              Puedes añadir múltiples códigos separados por comas
            </div>
          </div>

          {/* Selector de estado */}
          <div className="col-md-6">
            <label className="form-label text-secondary small">Seleccionar por Estado</label>
            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={() => setShowStateSelector(!showStateSelector)}
              >
                <i className={`bi bi-geo-alt me-2 ${showStateSelector ? 'text-primary' : ''}`}></i>
                {showStateSelector ? 'Cerrar selector' : 'Seleccionar estado completo'}
              </button>
            </div>
          </div>
        </div>

        {/* Selector de estado (desplegable) */}
        {showStateSelector && (
          <div className="card border-0 rounded-4 bg-light p-0 mb-3">
            <div className="card-body p-3">
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label text-secondary small">Estado</label>
                  <select
                    className="form-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Seleccionar estado...</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.nombre}>
                        {state.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-secondary small">&nbsp;</label>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100"
                    onClick={handleAddStateZips}
                    disabled={!selectedState || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Cargando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-lg me-2"></i>
                        Añadir estado
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className="alert alert-secondary mt-3 py-2 mb-0">
                <div className="d-flex align-items-start">
                  <i className="bi bi-info-circle text-secondary me-2 mt-1"></i>
                  <div className="small">
                    Esta acción añadirá todos los códigos postales del estado seleccionado.
                    Esta operación puede tardar un momento.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Campo oculto para react-hook-form */}
        <Controller
          name={name}
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />

        {/* Errores en el campo */}
        {errors && errors[name] && (
          <div className="invalid-feedback d-block">
            {errors[name].message}
          </div>
        )}
      </div>

      {/* Lista de códigos postales seleccionados */}
      {fields.length > 0 ? (
        <div className="card border-0 rounded-4 bg-light p-0 mb-3">
          <div className="card-header bg-transparent border-0 p-3">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-medium">Códigos postales seleccionados</h6>
              <span className="badge bg-secondary">{fields.length}</span>
            </div>
          </div>
          <div className="list-group list-group-flush rounded-4">
            {fields.map((item, index) => (
              <div
                key={item.id}
                className="list-group-item bg-transparent d-flex justify-content-between align-items-center p-3"
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-geo-alt-fill text-primary me-3"></i>
                  <div>
                    <div className="fw-medium">{item.codigo}</div>
                    <div className="text-muted small">
                      {item.municipio && item.estado &&
                        `${item.municipio}, ${item.estado}`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill"
                  onClick={() => remove(index)}
                  aria-label="Eliminar código postal"
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Footer con resumen */}
          <div className="card-footer bg-transparent p-3 border-top">
            <div className="d-flex justify-content-between align-items-center small">
              <span>Total: <strong>{fields.length}</strong> códigos postales</span>
              {fields.length > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de eliminar todos los códigos postales seleccionados?')) {
                      remove();
                    }
                  }}
                >
                  <i className="bi bi-trash me-1"></i>
                  Eliminar todos
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-secondary py-3">
          <div className="d-flex align-items-center">
            <i className="bi bi-info-circle text-secondary me-3 fs-4"></i>
            <div>
              <p className="mb-0">No has seleccionado ningún código postal</p>
              <p className="mb-0 small text-muted">
                Ingresa códigos manualmente o selecciona un estado completo
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};