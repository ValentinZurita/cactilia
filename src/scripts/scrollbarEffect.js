/**
 * scrollbarEffect.js
 * Script para manejar la apariencia y comportamiento de la scrollbar
 * Hace que la scrollbar desaparezca después de scrollear y reaparezca al interactuar
 */

// Variables para controlar el timer
let scrollTimer = null;
const SCROLL_TIMEOUT = 300; // Reducir a 0.3 segundos para desaparecer más rápido

// Variable para detectar si estamos en un navegador que soporta overlay
let supportsOverlayScrollbars = false;

/**
 * Detecta si el navegador soporta scrollbars overlay
 */
const detectOverlaySupport = () => {
  // Crear un elemento de prueba
  const test = document.createElement('div');
  test.style.cssText = 'width: 100px; height: 100px; overflow: overlay;';
  document.body.appendChild(test);
  
  // Verificar si el estilo se aplicó correctamente
  const computed = window.getComputedStyle(test);
  supportsOverlayScrollbars = computed.overflow === 'overlay';
  
  // Eliminar el elemento de prueba
  document.body.removeChild(test);
  
  // Aplicar clase específica al body basado en soporte
  if (supportsOverlayScrollbars) {
    document.body.classList.add('supports-overlay');
    document.documentElement.classList.add('supports-overlay');
  } else {
    document.body.classList.add('no-overlay-support');
    document.documentElement.classList.add('no-overlay-support');
  }
  
  // Ocultar scrollbar inmediatamente al cargar
  hideScrollbar();
};

/**
 * Inicializa el efecto de scrollbar
 */
export const initScrollbarEffect = () => {
  // Detectar soporte para overlay
  detectOverlaySupport();
  
  // Escuchar el evento scroll en la ventana
  window.addEventListener('scroll', handleScrollActivity);
  
  // Escuchar cuando el mouse se mueve sobre el documento
  document.addEventListener('mousemove', handleUserActivity);
  
  // Escuchar eventos táctiles para dispositivos móviles
  document.addEventListener('touchstart', handleUserActivity);
  document.addEventListener('touchmove', handleUserActivity);
  
  // Escuchar clics y teclas presionadas
  document.addEventListener('click', handleUserActivity);
  document.addEventListener('keydown', handleUserActivity);
};

/**
 * Maneja cualquier actividad del usuario
 */
const handleUserActivity = () => {
  showScrollbar();
  resetTimer();
};

/**
 * Maneja específicamente eventos de scroll
 */
const handleScrollActivity = () => {
  showScrollbar();
  resetTimer();
};

/**
 * Reinicia el temporizador de inactividad
 */
const resetTimer = () => {
  // Limpiar cualquier timer existente
  if (scrollTimer !== null) {
    clearTimeout(scrollTimer);
    scrollTimer = null;
  }
  
  // Configurar un nuevo timer para ocultar la scrollbar
  scrollTimer = setTimeout(hideScrollbar, SCROLL_TIMEOUT);
};

/**
 * Muestra la scrollbar
 */
const showScrollbar = () => {
  document.documentElement.classList.remove('scrollbar-hidden');
  document.documentElement.classList.add('scrollbar-visible');
  document.body.classList.remove('scrollbar-hidden');
  document.body.classList.add('scrollbar-visible');
};

/**
 * Oculta la scrollbar
 */
const hideScrollbar = () => {
  document.documentElement.classList.remove('scrollbar-visible');
  document.documentElement.classList.add('scrollbar-hidden');
  document.body.classList.remove('scrollbar-visible');
  document.body.classList.add('scrollbar-hidden');
};

// Inicializar cuando el DOM esté completamente cargado
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollbarEffect);
  } else {
    initScrollbarEffect();
  }
} 