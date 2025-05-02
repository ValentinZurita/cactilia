# Análisis de Dependencias del Checkout (Iniciado desde CheckoutPage.jsx)

Este documento lista los archivos locales identificados como dependencias directas o indirectas del flujo de checkout
que comienza en `src/modules/shop/pages/CheckoutPage.jsx`, basado en el estado actual del commit `ed1e02b` (con
`NewShipping2` y `NewShipping3` ahora rastreados por Git).

**Objetivo:** Identificar todos los archivos necesarios para proponer una ubicación consolidada ("fuente de la verdad")
para la lógica de checkout y envío.

---

## Archivos Identificados por Módulo/Característica

**Nota:** Esta lista se basa en el seguimiento de importaciones y puede no ser exhaustiva si hay cargas dinámicas no
estándar o dependencias implícitas.

### 1. Módulo `shop` (Página y Features de Checkout)

* `src/modules/shop/pages/CheckoutPage.jsx` (Punto de entrada analizado)
* `src/modules/shop/context/CheckoutContext.jsx`
* `src/modules/shop/hooks/useStripeLoader.js`
* `src/modules/shop/features/checkout/components/CheckoutContent.jsx`
* `src/modules/shop/features/checkout/components/address/AddressStep.jsx`
* `src/modules/shop/features/checkout/components/address/AddressOption.jsx`
* `src/modules/shop/features/checkout/components/shipping/ShippingStep.jsx`
* `src/modules/shop/features/checkout/components/shipping/ShippingOptionsList.jsx`
* `src/modules/shop/features/checkout/components/shipping/ShippingAddressSummary.jsx`
* `src/modules/shop/features/checkout/components/shipping/UnshippableItemsWarning.jsx`
* `src/modules/shop/features/checkout/components/billing/BillingStep.jsx`
* `src/modules/shop/features/checkout/components/payment/PaymentStep.jsx`
* `src/modules/shop/features/checkout/components/summary/CheckoutSummary.jsx`
* `src/modules/shop/features/checkout/components/summary/SummaryItem.jsx`
* `src/modules/shop/features/checkout/components/ui/Stepper.jsx`
* `src/modules/shop/features/checkout/components/ui/Step.jsx`
* `src/modules/shop/features/checkout/components/sections/CheckoutSection.jsx`
* `src/modules/shop/features/checkout/components/common/CheckoutLoading.jsx`
* `src/modules/shop/features/checkout/components/common/CheckoutError.jsx`
* `src/modules/shop/features/checkout/components/common/OrderProcessing.jsx`
* `src/modules/shop/features/checkout/hooks/useCheckoutSteps.js`
* `src/modules/shop/features/checkout/hooks/useShippingOptions2.js`
* `src/modules/shop/features/checkout/hooks/useShippingRules.js`
* `src/modules/shop/features/checkout/services/orderService.js`
* `src/modules/shop/features/checkout/services/shipping/ShippingGroupingService.js`
* `src/modules/shop/features/checkout/services/shipping/ShippingRulesGreedy.js`
* `src/modules/shop/features/checkout/styles/checkout.css`
* `src/modules/shop/features/checkout/utils/checkoutUtils.js`
* `src/modules/shop/features/checkout/constants/checkoutConstants.js`
* `src/modules/shop/features/checkout/components/NewShippingIntegration.jsx` (**¡Importa de NewShipping3!**)

### 2. Módulo `checkout` (Lógica de Envío Dispersa)

* `src/modules/checkout/NewShipping2/constants.js` (¡Usado por la vista original `CheckoutView.jsx`!)
* `src/modules/checkout/NewShipping2/hooks/useShipping.js`
* `src/modules/checkout/NewShipping2/utils/constants.js` (y archivos internos: `filterShippable.js`, `packaging.js`,
  `pricing.js`)
* `src/modules/checkout/NewShipping2/constants/constants.js`
* `src/modules/checkout/NewShipping2/components/constants.js` (y componentes internos)
* `src/modules/checkout/NewShipping3/constants.js` (**¡Usado por `NewShippingIntegration.jsx`!**)
* `src/modules/checkout/NewShipping3/components/ShippingManagerForCheckout.jsx`
* `src/modules/checkout/NewShipping3/hooks/useShippingOptions2.js` (¡Ojo! Duplicado con el de `shop/features`?)
* `src/modules/checkout/NewShipping3/hooks/useShippingRules.js` (¡Ojo! Duplicado?)
* `src/modules/checkout/NewShipping3/hooks/useGreedyPackaging.js`
* `src/modules/checkout/NewShipping3/services/shippingRulesService.js`
* `src/modules/checkout/NewShipping3/services/productsService.js`
* `src/modules/checkout/NewShipping3/services/addressesService.js`
* `src/modules/checkout/NewShipping3/utils/coverageUtils.js`
* `src/modules/checkout/NewShipping3/utils/packagingUtils2.js`
* `src/modules/checkout/NewShipping3/utils/shippingUtils2.js`
* `src/modules/checkout/NewShipping3/constants/constants.js` (**¡Usado por `ShippingRulesGreedy.js`!**)
* `src/modules/checkout/components/shipping/ShippingCalculator.jsx` (Depende de `ShippingGroupingService`)
* `src/modules/checkout/components/shipping/ShippingGroupsCalculator.jsx` (Depende de `ShippingGroupingService`, parece
  de debug)
* `src/modules/checkout/components/shipping/ShippingOptionSelector.jsx` (Wrapper para `ShippingCalculator`)
* `src/modules/checkout/components/shipping/ShippingCalculator.css`
* `src/modules/checkout/components/shipping/constants.js`
* `src/modules/checkout/views/CheckoutView.jsx` (Vista alternativa/original, usa `NewShipping2`)
* `src/modules/checkout/components/AddressForm.jsx` (Usado por `CheckoutView.jsx`)
* `src/modules/checkout/components/PaymentForm.jsx` (Usado por `CheckoutView.jsx`)
* `src/modules/checkout/components/CheckoutSummary.jsx` (Usado por `CheckoutView.jsx`)

### 3. Módulo `user` (Direcciones, Perfil)

* `src/modules/user/components/addresses/AddressList.jsx`
* `src/modules/user/components/addresses/AddressCard.jsx`
* `src/modules/user/components/addresses/AddressForm.jsx`
* `src/modules/user/hooks/useAddresses.js`
* `src/modules/user/services/addressService.js`

### 4. Módulo `auth` (Autenticación)

* `src/modules/auth/hooks/useAuth.js`
* `src/modules/auth/store/authSlice.js` (Implícito vía `useAuth` y `useSelector`)

### 5. Módulo `admin` (API de Reglas de Envío)

* `src/modules/admin/shipping/api/shippingApi.js` (Contiene `fetchShippingRuleById`, `fetchShippingRules` usadas por
  varios servicios/hooks de envío)

### 6. Módulo `shared` (Componentes, Hooks, Utils Comunes)

* `src/shared/hooks/useCheckAuth.js` (Usado indirectamente vía `useAuth` quizás)
* `src/shared/components/buttons-and-fields/Button.jsx`
* `src/shared/components/spinner/Spinner.jsx`
* `src/shared/utils/formatting/currency.js` (Potencialmente usado en resúmenes)
* `src/shared/utils/validation/schemas.js` (Potencialmente usado en formularios)

### 7. Servicios Centrales (`src/services`)

* `src/services/firebase/firestore/firestoreService.js` (Usado para crear la orden)
* `src/services/firebase/firebaseConfig.js` (Configuración de Firebase)

### 8. Store (Redux)

* `src/store/store.js` (Configuración del store)
* `src/modules/shop/features/cart/store/cartSlice.js` (Accedido vía `useCart`)
* `src/modules/shop/features/cart/hooks/useCart.js`
* `src/modules/auth/store/authSlice.js` (Accedido vía `useAuth`)
* `src/store/slices/siteConfigSlice.js` (Usado en App.jsx, podría afectar contextualmente)

---

## Puntos Clave y Conflictos Observados

* **Duplicidad/Confusión en Envío:** Existe lógica de envío significativa en al menos tres lugares:
    1. `NewShipping2` (Usado por `CheckoutView.jsx`)
    2. `NewShipping3` (Usado por `NewShippingIntegration.jsx`, que a su vez parece ser parte del flujo de
       `CheckoutPage.jsx`)
    3. `shop/features/checkout/services/shipping` y `hooks/useShippingOptions2`, `hooks/useShippingRules` (Usados por
       `ShippingStep.jsx` dentro de `CheckoutPage.jsx`).
* **Dependencias Cruzadas:**
    * El servicio `ShippingRulesGreedy.js` (en `shop`) depende de constantes en `NewShipping3`.
    * El componente `NewShippingIntegration.jsx` (en `shop`) depende directamente de `NewShipping3`.
    * Varios servicios/hooks de envío (`ShippingGroupingService`, `useShipping` de `NewShipping2`, etc.) dependen de la
      API de reglas de envío del módulo `admin`.
* **Fuente de la Verdad Actual (Funcional):** Basado en tu restauración, parece que la combinación funcional actual
  involucra código de `shop/features/checkout` que *incorrectamente* llama a `NewShipping3`, el cual ahora funciona
  porque restauraste su contenido correcto (ignorando el `reset` de Git).

---

## Propuesta Inicial: Carpeta Fuente de la Verdad

Dado el análisis, la ubicación más lógica y alineada con las guías del proyecto para consolidar la lógica de **envío del
checkout** sería dentro del propio módulo de checkout, pero de forma organizada:

**Ubicación Propuesta:** `src/modules/checkout/shipping/`

Dentro de esta carpeta, podríamos crear una estructura clara:

```
src/modules/checkout/shipping/
├── components/      # Componentes UI específicos para mostrar opciones/detalles de envío
│   ├── ShippingOptionsList.jsx
│   └── ...
├── hooks/           # Hooks con la lógica principal de cálculo y estado
│   └── useCheckoutShipping.js
├── services/        # Funciones para interactuar con APIs/backend (podrían llamar a servicios centrales)
│   └── shippingApiService.js
├── utils/           # Funciones puras de ayuda (cálculos, formato, validación)
│   ├── calculationUtils.js
│   └── coverageUtils.js
├── constants/       # Constantes específicas del envío
│   └── shippingConstants.js
└── constants.js         # Punto de entrada que exporta lo necesario
```

**Próximos Pasos:**

1. **Revisar este informe:** Asegúrate de que la lista de archivos y los puntos clave tengan sentido para ti.
2. **Validar la Propuesta:** ¿Estás de acuerdo con `src/modules/checkout/shipping/` como la carpeta objetivo?
3. **Planificar la Migración:** Decidir qué piezas de lógica de `NewShipping2`, `NewShipping3` y
   `shop/features/checkout/services/shipping` son las correctas y deben moverse/adaptarse a la nueva estructura.
   Priorizar la funcionalidad que `CheckoutPage.jsx` (la página principal actual) necesita.
4. **Ejecutar la Migración:** Mover/crear archivos en la nueva estructura.
5. **Refactorizar:** Actualizar `CheckoutPage.jsx` (y sus componentes internos como `ShippingStep.jsx`) para que usen
   exclusivamente la nueva lógica consolidada.
6. **Limpiar:** Eliminar `NewShipping2`, `NewShipping3`, `NewShippingIntegration.jsx`,
   `shop/features/checkout/services/shipping`, y cualquier otra pieza redundante una vez que todo funcione con la nueva
   estructura.

Este informe (`CHECKOUT_DEPENDENCIES.md`) te servirá como mapa durante el proceso de refactorización.

---

## Tabla de Seguimiento de Migración

Esta tabla rastrea el movimiento de archivos/lógica desde sus ubicaciones originales (priorizando `NewShipping2`) a la
nueva estructura consolidada en `src/modules/checkout/shipping/`.

| Archivo/Lógica Origen                               | Ubicación Origen           | Ruta Destino                                                            | Movido? |
|:----------------------------------------------------|:---------------------------|:------------------------------------------------------------------------|:-------:|
| **Utils**                                           |                            |                                                                         |         |
| Lógica de `filterShippable`, `packaging`, `pricing` | `NewShipping2/utils/`      | `src/modules/checkout/shipping/utils/` (archivos separados o único)     |  `[x]`  |
| **Constants**                                       |                            |                                                                         |         |
| Contenido de `constants.js`                         | `NewShipping2/constants/`  | `src/modules/checkout/shipping/constants/constants.js`                  |  `[x]`  |
| **Hooks**                                           |                            |                                                                         |         |
| Lógica de `useShipping.js`                          | `NewShipping2/hooks/`      | `src/modules/checkout/shipping/hooks/useShipping.js`                    |  `[x]`  |
| **Components**                                      |                            |                                                                         |         |
| `ShippingOptionsContainer.jsx`                      | `NewShipping2/components/` | `src/modules/checkout/shipping/components/ShippingOptionsContainer.jsx` |  `[x]`  |
| `ShippingOption2.jsx`                               | `NewShipping2/components/` | `src/modules/checkout/shipping/components/ShippingOption2.jsx`          |  `[x]`  |
| `ShippingWarning.jsx`                               | `NewShipping2/components/` | `src/modules/checkout/shipping/components/ShippingWarning.jsx`          |  `[x]`  |

---

## Tabla 2: Checklist de Adaptación Interna (`src/modules/checkout/shipping/`)

Esta tabla rastrea la revisión y corrección de las importaciones *dentro* de los archivos que fueron movidos a la
estructura consolidada, para asegurar que funcionan correctamente en su nueva ubicación.

| Archivo en `checkout/shipping/...`          | Tipo       | Imports Internos Revisados/Corregidos? |
|:--------------------------------------------|:-----------|:--------------------------------------:|
| **Utils**                                   |            |                                        |
| `utils/` (archivos de lógica NS2)           | Utilidad   |                 `[ ]`                  |
| **Constants**                               |            |                                        |
| `constants/constants.js`                    | Constantes |                 `[ ]`                  |
| **Hooks**                                   |            |                                        |
| `hooks/useCheckoutShipping.js`              | Hook       |                 `[ ]`                  |
| **Components**                              |            |                                        |
| `components/ShippingOptionsContainer.jsx`   | Componente |                 `[ ]`                  |
| `components/ShippingOption2.jsx`            | Componente |                 `[ ]`                  |
| `components/ShippingWarning.jsx`            | Componente |                 `[ ]`                  |
| `components/ShippingOptionsList.jsx`        | Componente |                 `[ ]`                  |
| `components/ShippingManagerForCheckout.jsx` | Componente |                 `[x]`                  |
| `components/ShippingOptions.jsx`            | Componente |                 `[ ]`                  |
| `components/AddressSelector2.jsx`           | Componente |                 `[x]`                  |
| `services/shippingRulesService.js`          | Servicio   |                 `[x]`                  |
| `services/productsService.js`               | Servicio   |                 `[x]`                  |
| `services/addressesService.js`              | Servicio   |                 `[x]`                  |
| `services/shippingCalculationService.js`    | Servicio   |                `[N/A]`                 |
| `hooks/useShipping.js`                      | Hook       |                 `[x]`                  |
| `hooks/useShippingRules.js`                 | Hook       |                 `[x]`                  |
| `utils/shippingMatcher.js`                  | Utilidad   |                `[N/A]`                 |
| `utils/shippingCalculator.js`               | Utilidad   |                 `[x]`                  |
| `utils/postalCodeMatcher.js`                | Utilidad   |                `[N/A]`                 |
| `utils/geoUtils.js`                         | Utilidad   |                `[N/A]`                 |
| `constants/index.js`                        | Constantes |                 `[x]`                  |
| `constants/constants.js`                    | Constantes |                `[DEL]`                 |

---

## Archivos Identificados por Módulo/Característica (Contexto Adicional)

(... El resto del archivo con la lista original de dependencias permanece igual ...)
