// src/modules/shop/package/common/ErrorAlert.jsx
import React from 'react'

/**
 * Componente para mostrar mensajes de error
 * @param {Object} props - Propiedades del componente
 * @param {string} props.message - Mensaje de error
 * @returns {JSX.Element|null}
 */
export const ErrorAlert = ({ message }) => {
  if (!message) return null

  return (
    <div className="alert alert-danger" role="alert">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      {message}
    </div>
  )
}