import React, { useState, useEffect } from 'react';
import { AddressModal } from './AddressModal.jsx';

/**
 * Lista de estados de la República Mexicana.
 * Se declara como constante para mantener limpia la lógica dentro del componente.
 */
const ESTADOS_MEXICANOS = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
];

/**
 * Estructura por defecto para el formulario de dirección.
 * Incluye todos los campos en blanco o false.
 */
const DEFAULT_FORM_DATA = {
  name: '',
  street: '',
  numExt: '',
  numInt: '',
  colonia: '',
  city: '',
  state: '',
  zip: '',
  references: '',
  isDefault: false,
};

/**
 * Extrae, si es posible, el número exterior e interior de la cadena 'street' original.
 * Esto permite mantener compatibilidad con direcciones que incluyan toda la
 * información en un solo campo (por ejemplo, "Calle #123, Int. 4B").
 *
 * @param {string} originalStreet - Texto que contiene la calle y, potencialmente, número(s).
 * @returns {object} - Objeto con { street, numExt, numInt } extraídos o vacíos si no aplica.
 */
function parseStreetData(originalStreet) {
  // Valor inicial en caso de que no se detecten patrones
  let street = originalStreet || '';
  let numExt = '';
  let numInt = '';

  // Intentar extraer números si están en formato "Calle #Ext, #Int"
  const streetMatch = street.match(/(.*?)(?:\s+#?(\d+)(?:\s*,\s*#?(\d+))?)?$/);
  if (streetMatch) {
    street = streetMatch[1]?.trim() || '';
    numExt = streetMatch[2] || '';
    numInt = streetMatch[3] || '';
  }

  return { street, numExt, numInt };
}

/**
 * Valida los campos del formulario de dirección, devolviendo un objeto
 * donde cada clave corresponde a un campo con error y su valor es
 * el mensaje de error.
 *
 * @param {object} formData - Objeto con los datos del formulario a validar.
 * @returns {object} - Objeto con los errores encontrados. Vacío si no hay errores.
 */
function validateFormData(formData) {
  const errors = {};

  // Validar campos requeridos
  if (!formData.name.trim()) errors.name = 'El nombre es requerido';
  if (!formData.street.trim()) errors.street = 'La calle es requerida';
  if (!formData.numExt.trim()) errors.numExt = 'El número exterior es requerido';
  if (!formData.colonia.trim()) errors.colonia = 'La colonia es requerida';
  if (!formData.city.trim()) errors.city = 'La ciudad es requerida';
  if (!formData.state.trim()) errors.state = 'El estado es requerido';
  if (!formData.zip.trim()) errors.zip = 'El código postal es requerido';

  // Validar formato de código postal (5 dígitos para México)
  if (formData.zip && !/^\d{5}$/.test(formData.zip.trim())) {
    errors.zip = 'El código postal debe tener 5 dígitos';
  }

  return errors;
}

/**
 * Formulario mejorado para agregar o editar direcciones en México.
 * Incluye campos específicos para direcciones mexicanas y validación
 * básica del formato de Código Postal.
 *
 * @param {object} props - Propiedades recibidas para el componente.
 * @param {boolean} props.isOpen - Indica si el modal está abierto.
 * @param {function} props.onClose - Función para cerrar el modal.
 * @param {function} props.onSave - Función para guardar los datos de la dirección.
 * @param {object|null} [props.address=null] - Objeto con la dirección a editar (nulo para nueva).
 * @param {boolean} [props.loading=false] - Indica si hay un proceso de guardado en curso.
 */
export function SimpleAddressForm({
                                    isOpen,
                                    onClose,
                                    onSave,
                                    address = null,
                                    loading = false,
                                  }) {
  // Estado local para el formulario
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  // Estado local para los errores de validación
  const [errors, setErrors] = useState({});

  /**
   * Actualiza el formulario cuando se abre el modal:
   * - Si hay una dirección existente, parseamos la calle y completamos campos.
   * - Si no hay dirección, inicializamos los campos en blanco.
   */
  useEffect(() => {
    if (isOpen) {
      // Limpiar errores al abrir el formulario
      setErrors({});

      if (address) {
        // Intentar extraer número exterior e interior de la calle
        const { street = '' } = address;
        const { street: parsedStreet, numExt, numInt } = parseStreetData(street);

        setFormData({
          name: address.name || '',
          street: address.street ? parsedStreet : '',
          numExt: address.numExt || numExt || '',
          numInt: address.numInt || numInt || '',
          colonia: address.colonia || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          references: address.references || '',
          isDefault: address.isDefault || false,
        });
      } else {
        // Nueva dirección: valores por defecto
        setFormData({ ...DEFAULT_FORM_DATA });
      }
    }
  }, [isOpen, address]);

  /**
   * Maneja los cambios en los campos del formulario.
   * Si el campo modificado tenía un error, este se limpia.
   */
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpiar error del campo al modificarlo
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    }
  }

  /**
   * Maneja el envío del formulario: primero realiza la validación;
   * si no hay errores, llama a la función onSave con la información
   * compilada de la dirección.
   */
  function handleSubmit() {
    const foundErrors = validateFormData(formData);
    setErrors(foundErrors);

    // Si hay errores, no continuamos
    if (Object.keys(foundErrors).length > 0) {
      return;
    }

    // Preparar datos finales para guardar
    const addressToSave = {
      ...formData,
      // Mantener formato original si es necesario para compatibilidad
      street: `${formData.street}${formData.numExt ? ` #${formData.numExt}` : ''}${
        formData.numInt ? `, Int. ${formData.numInt}` : ''
      }`,
      id: address?.id, // Conservar el ID si estamos editando
    };

    onSave(addressToSave);
  }

  /**
   * Construye el JSX para el pie de modal (botones de acción).
   */
  function renderModalFooter() {
    return (
      <>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={onClose}
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-success"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Guardando...
            </>
          ) : (
            address ? 'Actualizar' : 'Guardar'
          )}
        </button>
      </>
    );
  }

  // Condicional
  if (!isOpen) return null;

  // Render principal del componente
  return (
    <AddressModal
      isOpen={isOpen}
      onClose={onClose}
      title={address ? 'Editar dirección' : 'Agregar dirección'}
      footer={renderModalFooter()}
      size="md" // tamaño del modal
    >
      <div>
        {/* Nombre de la dirección */}
        <div className="mb-3">
          <label htmlFor="address-name" className="form-label">
            Nombre de la dirección
          </label>
          <input
            type="text"
            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
            id="address-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ej. Casa, Oficina, Casa de mis padres"
            autoComplete="off"
          />
          {errors.name && <div className="invalid-feedback">{errors.name}</div>}
        </div>

        {/* Calle */}
        <div className="mb-3">
          <label htmlFor="address-street" className="form-label">
            Calle
          </label>
          <input
            type="text"
            className={`form-control ${errors.street ? 'is-invalid' : ''}`}
            id="address-street"
            name="street"
            value={formData.street}
            onChange={handleChange}
            disabled={loading}
            placeholder="Nombre de la calle"
            autoComplete="street-address"
          />
          {errors.street && <div className="invalid-feedback">{errors.street}</div>}
        </div>

        {/* Fila con Número Exterior e Interior */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="address-numExt" className="form-label">
              Número Exterior
            </label>
            <input
              type="text"
              className={`form-control ${errors.numExt ? 'is-invalid' : ''}`}
              id="address-numExt"
              name="numExt"
              value={formData.numExt}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. 123"
            />
            {errors.numExt && <div className="invalid-feedback">{errors.numExt}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="address-numInt" className="form-label">
              Número Interior (opcional)
            </label>
            <input
              type="text"
              className={`form-control ${errors.numInt ? 'is-invalid' : ''}`}
              id="address-numInt"
              name="numInt"
              value={formData.numInt}
              onChange={handleChange}
              disabled={loading}
              placeholder="Ej. 4B"
            />
            {errors.numInt && <div className="invalid-feedback">{errors.numInt}</div>}
          </div>
        </div>

        {/* Colonia */}
        <div className="mb-3">
          <label htmlFor="address-colonia" className="form-label">
            Colonia
          </label>
          <input
            type="text"
            className={`form-control ${errors.colonia ? 'is-invalid' : ''}`}
            id="address-colonia"
            name="colonia"
            value={formData.colonia}
            onChange={handleChange}
            disabled={loading}
            placeholder="Nombre de la colonia"
          />
          {errors.colonia && <div className="invalid-feedback">{errors.colonia}</div>}
        </div>

        {/* Ciudad */}
        <div className="mb-3">
          <label htmlFor="address-city" className="form-label">
            Ciudad
          </label>
          <input
            type="text"
            className={`form-control ${errors.city ? 'is-invalid' : ''}`}
            id="address-city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            disabled={loading}
            placeholder="Ciudad"
            autoComplete="address-level2"
          />
          {errors.city && <div className="invalid-feedback">{errors.city}</div>}
        </div>

        {/* Fila con Estado y Código Postal */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="address-state" className="form-label">
              Estado
            </label>
            <select
              className={`form-select ${errors.state ? 'is-invalid' : ''}`}
              id="address-state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
              autoComplete="address-level1"
            >
              <option value="">Selecciona un estado</option>
              {ESTADOS_MEXICANOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
            {errors.state && <div className="invalid-feedback">{errors.state}</div>}
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="address-zip" className="form-label">
              Código Postal
            </label>
            <input
              type="text"
              className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
              id="address-zip"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              disabled={loading}
              placeholder="Código Postal (5 dígitos)"
              autoComplete="postal-code"
              maxLength="5"
            />
            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
          </div>
        </div>

        {/* Referencias para llegar (opcional) */}
        <div className="mb-3">
          <label htmlFor="address-references" className="form-label">
            Referencias (opcional)
          </label>
          <textarea
            className="form-control"
            id="address-references"
            name="references"
            rows="2"
            value={formData.references}
            onChange={handleChange}
            disabled={loading}
            placeholder="Entre calles, señas particulares u otras referencias para encontrar la dirección"
          />
        </div>

        {/* Checkbox para dirección predeterminada */}
        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            id="address-default"
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleChange}
            disabled={loading}
          />
          <label className="form-check-label" htmlFor="address-default">
            Establecer como dirección predeterminada
          </label>
        </div>
      </div>
    </AddressModal>
  );
}