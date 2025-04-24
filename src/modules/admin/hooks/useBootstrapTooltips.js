import { useEffect } from 'react';

/**
 * @hook useBootstrapTooltips
 * @description Hook personalizado para inicializar y gestionar los tooltips de Bootstrap 5.
 * 
 * @usage Este hook debe ser llamado una vez dentro del componente de layout principal 
 *        del área donde se utilizarán los tooltips (ej. `AdminLayout`). 
 *        Se encarga de buscar todos los elementos con el atributo `data-bs-toggle="tooltip"`
 *        y activarlos usando la API de JavaScript de Bootstrap.
 * 
 * @effect Realiza manipulación directa del DOM para inicializar los tooltips.
 *         También incluye una función de limpieza que destruye los tooltips cuando el 
 *         componente que usa el hook se desmonta, previniendo fugas de memoria.
 */
export const useBootstrapTooltips = () => {
  useEffect(() => {
    // 1. Verificar si la API de Tooltip de Bootstrap está disponible
    //    (asumiendo que el JS de Bootstrap se carga globalmente, ej. desde index.html)
    if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Tooltip) {
      
      // 2. Seleccionar todos los elementos que activan tooltips
      //    Usamos `Array.from` para convertir el NodeList en un array estándar.
      const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      
      // 3. Inicializar un nuevo Tooltip para cada elemento encontrado
      const tooltipInstances = tooltipTriggerList.map(tooltipTriggerEl => {
        // Se pueden pasar opciones adicionales aquí si es necesario,
        // ej. { container: 'body' } para evitar problemas de z-index en layouts complejos.
        // Añadir opción de delay para que aparezcan más rápido
        return new window.bootstrap.Tooltip(tooltipTriggerEl, {
          delay: { show: 150, hide: 50 } // Retraso en ms (mostrar rápido, ocultar rápido)
        });
      });

      // 4. Función de limpieza (Cleanup)
      //    Se ejecuta cuando el componente que usa este hook se desmonta.
      return () => {
        // Destruir cada instancia de tooltip para liberar recursos
        tooltipInstances.forEach(tooltip => {
          // Verificar si la instancia aún existe y tiene el método dispose
          if (tooltip && typeof tooltip.dispose === 'function') {
            tooltip.dispose();
          }
        });
      };
      
    } else {
      // Advertencia si el JS de Bootstrap o su componente Tooltip no se encuentran
      console.warn('Bootstrap Tooltip component not found. Tooltips will not be initialized.');
    }

    // El array de dependencias vacío [] asegura que este efecto se ejecute 
    // solo una vez: cuando el componente que usa el hook se monta por primera vez.
  }, []); 

  // Este hook no devuelve nada, su propósito es puramente realizar el efecto secundario
  // de inicializar los tooltips.
};

// No se necesita un export default si se prefiere la exportación nombrada
// export default useBootstrapTooltips; 