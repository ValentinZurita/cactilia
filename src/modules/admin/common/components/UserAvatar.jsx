import React from 'react';

/**
 * Componente reutilizable para mostrar el avatar de un usuario.
 * Muestra la foto de perfil si existe, o iniciales con fondo neutro como fallback.
 * Acepta diferentes tamaños.
 *
 * @param {Object} user - El objeto de usuario (debe tener displayName, email, photoURL).
 * @param {'sm' | 'md' | 'lg'} [size='md'] - Tamaño del avatar ('sm', 'md', 'lg').
 * @param {string} [className=''] - Clases CSS adicionales para el contenedor.
 */
export const UserAvatar = ({ user, size = 'md', className = '' }) => {
  // Mapeo de tamaños a dimensiones en píxeles y parámetros de UI Avatars
  const sizeMap = {
    sm: { dimension: 30, uiSize: 30, fontSize: 0.5 },
    md: { dimension: 80, uiSize: 80, fontSize: 0.45 },
    lg: { dimension: 150, uiSize: 150, fontSize: 0.4 }
  };

  const selectedSize = sizeMap[size] || sizeMap.md; // Default a 'md' si el tamaño es inválido
  const initials = encodeURIComponent(user?.displayName || user?.email || 'U');
  const fallbackBg = 'E0E0E0'; // Gris neutro
  const fallbackColor = '616161'; // Texto oscuro

  const fallbackUrl = `https://ui-avatars.com/api/?name=${initials}&size=${selectedSize.uiSize}&background=${fallbackBg}&color=${fallbackColor}&font-size=${selectedSize.fontSize}&length=2`;

  return (
    <div className={`avatar-container ${className}`}>
      <img
        src={user?.photoURL || fallbackUrl}
        alt={user?.displayName || 'Avatar'}
        className="rounded-circle shadow-sm border border-light" // Añadir borde ligero
        style={{ 
          width: `${selectedSize.dimension}px`, 
          height: `${selectedSize.dimension}px`, 
          objectFit: 'cover' 
        }}
      />
    </div>
  );
}; 