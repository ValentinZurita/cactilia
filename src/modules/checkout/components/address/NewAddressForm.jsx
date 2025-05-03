import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import '../../styles/newAddressForm.css'
import { AddressFormFields } from './AddressFormFields.jsx'

/**
 * Componente que muestra un formulario para ingresar una nueva dirección
 * durante el proceso de checkout.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onAddressChange - Función que se ejecuta cuando cambian los datos
 * @param {boolean} props.saveAddress - Indica si se debe guardar la dirección para uso futuro
 * @param {Function} props.onSaveAddressChange - Función para actualizar la opción de guardar dirección
 * @param {Object} props.addressData - Datos actuales de la dirección (para edición)
 */
export const NewAddressForm = ({
                                 onAddressChange,
                                 saveAddress = false,
                                 onSaveAddressChange,
                                 addressData = {
                                   name: '',
                                   fullName: '',
                                   phone: '',
                                   street: '',
                                   numExt: '',
                                   numInt: '',
                                   colonia: '',
                                   city: '',
                                   state: '',
                                   zip: '',
                                   references: '',
                                 },
                               }) => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState(addressData)
  // Estado para errores de validación
  const [errors, setErrors] = useState({})
  // Ref para evitar ciclos infinitos
  const isInitialMount = useRef(true)
  const lastExternalUpdate = useRef(JSON.stringify(addressData))

  // Actualizar el estado solo cuando cambian las props externamente
  useEffect(() => {
    const addressDataStr = JSON.stringify(addressData)
    if (addressDataStr !== lastExternalUpdate.current) {
      setFormData(addressData)
      lastExternalUpdate.current = addressDataStr
    }
  }, [addressData])

  // Notificar al padre sobre cambios en los datos solo cuando el usuario interactúa
  // y no cuando se actualiza desde props
  useEffect(() => {
    // Omitir el primer renderizado
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    // Verificar si el cambio viene del usuario y no de una actualización de props
    const formDataStr = JSON.stringify(formData)
    if (formDataStr !== lastExternalUpdate.current) {
      if (onAddressChange) {
        onAddressChange(formData)
      }
    }
  }, [formData, onAddressChange])

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value;

    // Limitar teléfono a 10 dígitos numéricos
    if (name === 'phone') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }))

    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  // Validación básica de campos requeridos
  const validateField = (name, value) => {
    if (!value.trim() && ['fullName', 'phone', 'street', 'city', 'state', 'zip'].includes(name)) {
      return 'Este campo es requerido'
    }

    if (name === 'phone' && !/^\d{10}$/.test(value)) {
      return 'El teléfono debe tener 10 dígitos'
    }

    if (name === 'zip' && !/^\d{5}$/.test(value)) {
      return 'El código postal debe tener 5 dígitos'
    }

    return null
  }

  // Validar al perder el foco
  const handleBlur = (e) => {
    const { name, value } = e.target
    const error = validateField(name, value)

    setErrors(prev => ({
      ...prev,
      [name]: error,
    }))
  }

  return (
    <div className="new-address-form">
      {/* Componente de campos de dirección reutilizable */}
      <AddressFormFields
        formData={formData}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
      />

      {/* Opción para guardar la dirección */}
      <div className="form-check mt-4">
        <input
          type="checkbox"
          className="form-check-input"
          id="saveAddressForFuture"
          checked={saveAddress}
          onChange={(e) => onSaveAddressChange(e.target.checked)}
        />
        <label className="form-check-label" htmlFor="saveAddressForFuture">
          Guardar esta dirección para compras futuras
        </label>
      </div>
    </div>
  )
}

NewAddressForm.propTypes = {
  onAddressChange: PropTypes.func.isRequired,
  saveAddress: PropTypes.bool,
  onSaveAddressChange: PropTypes.func.isRequired,
  addressData: PropTypes.shape({
    name: PropTypes.string,
    fullName: PropTypes.string,
    phone: PropTypes.string,
    street: PropTypes.string,
    numExt: PropTypes.string,
    numInt: PropTypes.string,
    colonia: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zip: PropTypes.string,
    references: PropTypes.string,
  }),
}