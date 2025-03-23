// SimpleAddressForm.jsx
import React, { useState, useEffect } from 'react';
import { AddressModal } from './AddressModal.jsx'; // Asumiendo que tu modal está igual
import { DEFAULT_FORM_DATA } from '../../constants/defaultFormData.js'
import { parseStreetData, validateFormData } from '../../utils/addressUtils.js'
import { STATES } from '../../constants/states.js'

export function SimpleAddressForm({
                                    isOpen,
                                    onClose,
                                    onSave,
                                    address = null,
                                    loading = false,
                                  }) {
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  const [errors, setErrors] = useState({});

  // Al abrir el modal, si se edita una dirección, parsea calle/nums.
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (address) {
        const { street: st = '' } = address;
        const { street, numExt, numInt } = parseStreetData(st);
        setFormData({
          name: address.name || '',
          street,
          numExt: address.numExt || numExt || '',
          numInt: address.numInt || numInt || '',
          colonia: address.colonia || '',
          city: address.city || '',
          state: address.state || '',
          zip: address.zip || '',
          references: address.references || '',
          isDefault: !!address.isDefault,
        });
      } else {
        setFormData({ ...DEFAULT_FORM_DATA });
      }
    }
  }, [isOpen, address]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = () => {
    const foundErrors = validateFormData(formData);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length > 0) return;

    const addressToSave = {
      ...formData,
      street: `${formData.street}${formData.numExt ? ` #${formData.numExt}` : ''}${
        formData.numInt ? `, Int. ${formData.numInt}` : ''
      }`,
      id: address?.id,
    };
    onSave(addressToSave);
  };

  // Botones del modal
  const modalFooter = (
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
        ) : address ? 'Actualizar' : 'Guardar'}
      </button>
    </>
  );

  if (!isOpen) return null;

  return (
    <AddressModal
      isOpen={isOpen}
      onClose={onClose}
      title={address ? 'Editar dirección' : 'Agregar dirección'}
      footer={modalFooter}
      size="md"
    >
      <div className="mb-3">
        <label htmlFor="address-name" className="form-label">Nombre de la dirección</label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="address-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          placeholder="Ej. Casa, Oficina..."
          autoComplete="off"
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>

      <div className="mb-3">
        <label htmlFor="address-street" className="form-label">Calle</label>
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

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="address-numExt" className="form-label">Número Exterior</label>
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

      <div className="mb-3">
        <label htmlFor="address-colonia" className="form-label">Colonia</label>
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

      <div className="mb-3">
        <label htmlFor="address-city" className="form-label">Ciudad</label>
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

      <div className="row">
        <div className="col-md-6 mb-3">
          <label htmlFor="address-state" className="form-label">Estado</label>
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
            {STATES.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          {errors.state && <div className="invalid-feedback">{errors.state}</div>}
        </div>

        <div className="col-md-6 mb-3">
          <label htmlFor="address-zip" className="form-label">Código Postal</label>
          <input
            type="text"
            className={`form-control ${errors.zip ? 'is-invalid' : ''}`}
            id="address-zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            disabled={loading}
            placeholder="5 dígitos"
            autoComplete="postal-code"
            maxLength="5"
          />
          {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
        </div>
      </div>

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
          placeholder="Entre calles, señas particulares, etc."
        />
      </div>

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
    </AddressModal>
  );
}