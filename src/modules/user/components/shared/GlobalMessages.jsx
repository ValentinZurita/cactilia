import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { removeMessage, selectMessages } from '../../../../store/messages/messageSlice.js'

/**
 * GlobalMessages - Muestra mensajes globales en la aplicación con un botón para cerrarlos automáticamente o manualmente
 * @returns {JSX.Element|null}
 * @constructor
 */

export const GlobalMessages = () => {

  const messages = useSelector(selectMessages);
  const dispatch = useDispatch();

  // Eliminar mensajes automáticamente después de 5 segundos
  useEffect(() => {
    messages.forEach(msg => {
      if (msg.autoHide !== false) {
        const timer = setTimeout(() => {
          dispatch(removeMessage(msg.id));
        }, msg.duration || 5000);

        return () => clearTimeout(timer);
      }
    });
  }, [messages, dispatch]);

  if (messages.length === 0) return null;

  return (
    <div className="global-messages-container">
      {messages.map(msg => (
        <div key={msg.id} className={`alert alert-${msg.type}`}>
          {msg.text}
          <button
            className="btn-close btn-sm ms-2"
            onClick={() => dispatch(removeMessage(msg.id))}
            aria-label="Cerrar"
          />
        </div>
      ))}
    </div>
  );
};