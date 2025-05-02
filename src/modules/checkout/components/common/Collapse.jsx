import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para manejar contenido colapsable con animación
 * Similar a bootstrap collapse pero sin dependencias externas
 */
const Collapse = ({ children, isOpen }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(isOpen ? 'auto' : '0px');
  const [overflow, setOverflow] = useState(isOpen ? 'visible' : 'hidden');
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    if (isOpen) {
      const contentHeight = contentRef.current.scrollHeight;
      
      setHeight(`${contentHeight}px`);
      // Establecer overflow como visible después de la animación
      const timer = setTimeout(() => {
        setOverflow('visible');
        // Si hay altura automática, usarla
        setHeight('auto');
        setHasAnimated(true);
      }, 300); // Debe coincidir con la duración de la transición CSS
      
      return () => clearTimeout(timer);
    } else {
      // Si nunca se ha animado, simplemente colapsar
      if (!hasAnimated) {
        setHeight('0px');
        setOverflow('hidden');
        return;
      }
      
      // Primero establecer una altura fija para animar desde ella
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(`${contentHeight}px`);
      setOverflow('hidden');
      
      // Forzar reflujo para que la transición funcione
      contentRef.current.offsetHeight; // eslint-disable-line no-unused-expressions
      
      // Luego animar a 0
      requestAnimationFrame(() => {
        setHeight('0px');
      });
    }
  }, [isOpen, hasAnimated]);

  return (
    <div
      ref={contentRef}
      style={{
        height: height,
        overflow: overflow,
        transition: 'height 300ms ease-in-out',
        willChange: 'height'
      }}
    >
      {children}
    </div>
  );
};

Collapse.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool
};

Collapse.defaultProps = {
  isOpen: false
};

export default Collapse; 