/**
 * Tipos para el módulo de shipping
 */

/**
 * Representa una opción de mensajería o método de envío
 */
export interface ShippingOption {
  /** Identificador único de la opción */
  id?: string;
  /** Nombre del servicio (ej: "Estándar", "Express") */
  nombre: string;
  /** Tiempo estimado de entrega (ej: "1-2 días hábiles") */
  tiempo: string;
  /** Precio del servicio en MXN */
  precio: number;
  /** Nombre de la mensajería (ej: "DHL", "Estafeta") */
  mensajeria: string;
}

/**
 * Representa una regla de envío completa
 */
export interface ShippingRule {
  /** Identificador único de la regla */
  id?: string;
  /** Nombre de la zona o área geográfica */
  zona: string;
  /** Indica si la regla está activa o no */
  activo: boolean;
  /** Lista de códigos postales o identificadores geográficos cubiertos */
  zipcodes: string[];
  /** Lista de métodos de envío disponibles para esta zona */
  opciones_mensajeria: ShippingOption[];
  /** Indica si el envío es gratuito en esta zona */
  envio_gratis?: boolean;
  /** Monto mínimo de pedido para envío gratis (si aplica) */
  monto_minimo_gratis?: number;
  /** Lista de productos con restricciones en esta zona (opcional) */
  productos_restringidos?: string[];
  /** Fecha de creación */
  createdAt?: Date | string;
  /** Fecha de última actualización */
  updatedAt?: Date | string;
}

/**
 * Representa un error específico del módulo de shipping
 */
export interface ShippingError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Estado de carga para operaciones asíncronas
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Tipos de cobertura geográfica disponibles
 */
export type CoverageType = 'nacional' | 'estado' | 'cp';

/**
 * Estado del formulario de shipping
 */
export interface ShippingFormState {
  /** Valores actuales del formulario */
  values: Partial<ShippingRule>;
  /** Paso actual del formulario multi-paso */
  currentStep: number;
  /** Indica si hay cambios no guardados */
  isDirty: boolean;
  /** Errores de validación */
  errors: Record<string, string>;
  /** Estado de carga al enviar el formulario */
  submitState: LoadingState;
} 