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
    let tooltipInstances = [];
    let timeoutId = null;

    const initializeTooltips = () => {
      console.log('[useBootstrapTooltips] Intentando inicializar tooltips...');
      if (typeof window.bootstrap !== 'undefined' && window.bootstrap.Tooltip) {
        // Limpiar instancias anteriores antes de reinicializar (por si acaso)
        tooltipInstances.forEach(tooltip => tooltip?.dispose());
        tooltipInstances = [];

        const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        console.log(`[useBootstrapTooltips] Encontrados ${tooltipTriggerList.length} elementos con [data-bs-toggle="tooltip"]`);

        tooltipInstances = tooltipTriggerList.map(tooltipTriggerEl => {
           // Intentar obtener instancia existente primero
           let tooltip = window.bootstrap.Tooltip.getInstance(tooltipTriggerEl);
           if (!tooltip) {
              console.log('[useBootstrapTooltips] Creando nueva instancia para:', tooltipTriggerEl);
              tooltip = new window.bootstrap.Tooltip(tooltipTriggerEl, {
                delay: { show: 150, hide: 50 }
              });
           }
           return tooltip;
        });
      } else {
        console.warn('[useBootstrapTooltips] Bootstrap Tooltip component not found.');
      }
    };

    // Inicializar al montar
    initializeTooltips();

    // Intentar de nuevo después de un pequeño retraso
    // Esto puede ayudar si los elementos se renderizan un poco después
    timeoutId = setTimeout(initializeTooltips, 500); // 500ms de retraso

    // Función de limpieza
    return () => {
      console.log('[useBootstrapTooltips] Limpiando tooltips...');
      clearTimeout(timeoutId); // Limpiar el timeout
      tooltipInstances.forEach(tooltip => {
        if (tooltip && typeof tooltip.dispose === 'function') {
          tooltip.dispose();
        }
      });
    };

  }, []); 

  // Este hook no devuelve nada, su propósito es puramente realizar el efecto secundario
  // de inicializar los tooltips.
};

// No se necesita un export default si se prefiere la exportación nombrada
// export default useBootstrapTooltips; 