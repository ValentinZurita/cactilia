import React from 'react'
import { CONTACT_INFO } from '../../../../../shared/constants/index.js'


/**
 * Renderiza un ítem de información de contacto.
 *
 * @param {string} iconClassName - Clases de icono de Bootstrap Icons.
 * @param {string} title         - Título descriptivo de la información.
 * @param {string} text          - Contenido con la información (teléfono, email, etc.).
 * @returns {JSX.Element}        - Un bloque con ícono, título y texto.
 */
const renderContactInfoItem = (iconClassName, title, text) => {
  return (
    <div className="contact-info-item">
      <div className="icon-container">
        <i className={iconClassName}></i>
      </div>
      <div className="info-content">
        <h6 className="info-title">{title}</h6>
        <p className="info-text">{text}</p>
      </div>
    </div>
  )
}


/**
 * Muestra la información de contacto básico (teléfono, email, dirección y horario).
 * Utiliza constantes importadas con la información y llama a una función helper
 * para renderizar cada bloque.
 *
 * @returns {JSX.Element} - Contenedor con todos los ítems de contacto.
 */
export const ContactInfo = () => {
  return (
    <div className="contact-details">
      {renderContactInfoItem('bi bi-telephone-fill', 'Teléfono', CONTACT_INFO.phone)}
      {renderContactInfoItem('bi bi-envelope-fill', 'Email', CONTACT_INFO.email)}
      {renderContactInfoItem('bi bi-geo-alt-fill', 'Dirección', CONTACT_INFO.address)}
      {renderContactInfoItem('bi bi-clock-fill', 'Horario', 'Lunes a Viernes: 9am - 6pm')}
    </div>
  )
}
