# Bonzai — Control Plane

Panel de administración unificada del ecosistema Bonzai. Permite gestionar las 4 apps del ecosistema (Seller, Payments, Buyer, Shipping) desde una única interfaz con autenticación Clerk y control de acceso basado en roles (`super_admin`).

**Deploy:** [https://etapa-3-control-plane-bonzai.vercel.app](https://etapa-3-control-plane-bonzai.vercel.app)

---

## Usuario de prueba

| Email | Rol |
|---|---|
| `seller_admin+clerk_test@iaw.com` | Administrador (`super_admin`) |

Contraseña: `iawuser#`

---

## Instrucciones de uso

1. Ingresar con el usuario admin en `/login`.
2. **Dashboard principal** (`/dashboard`): cards de acceso a las 4 secciones (Seller, Payments, Buyer, Shipping).

### Seller — `/dashboard/seller/*`
3. **Estadísticas**: visión general con métricas de órdenes, productos, reseñas y reservas.
4. **Usuarios**: listado de vendedores, ver detalle, habilitar/deshabilitar.
5. **Órdenes**: listado con filtros por estado, búsqueda y fechas. Ver detalle con timeline. Cancelar órdenes PENDING (reembolsa y restaura stock).
6. **Productos**: listado con búsqueda. Suspender/reactivar productos.
7. **Reservas**: listado con filtros. Liberar reservas vencidas.
8. **Reseñas**: listado con filtro por calificación.
9. **Compras**: listado con detalle en modal.
10. **Health**: estado de dependencias de la Seller App.

### Payments — `/dashboard/payments/*`
11. **Transacciones**: listado con filtros por estado, fechas, búsqueda, buyer/seller ID. Ver detalle con ledger entries y datos de disputa. Forzar cambio de estado con motivo de auditoría. Liberar fondos retenidos (escrow release).
12. **Disputas**: listado de disputas abiertas y resueltas.
13. **Wallets**: listado de wallets con saldos disponibles, retenidos y totales. Ver detalle con ledger. Ajustar saldo manualmente (CREDIT/DEBIT).
14. **Checkout Sessions**: sesiones multi-vendedor con pagos asociados. Ver detalle con transacciones hijas.
15. **Health**: estado de dependencias de la Payments App.
16. **Audit**: integridad contable del libro mayor.

### Buyer — `/dashboard/buyer/*`
17. **Buyers**: listado de compradores, ver detalle y editar perfil.
18. **Carts**: listado de carritos, ver detalle y eliminar items.
19. **Shipping Addresses**: listado, editar y eliminar direcciones.

### Shipping — `/dashboard/shipping/*`
20. **Dashboard**: estadísticas de delivery.
21. **Shipments**: listado de envíos con filtros. Actualizar estado.
22. **Incidents**: envíos cancelados.
23. **Staff**: operadores — listado, detalle, activar/desactivar.

---

## Arquitectura

El Control Plane se comunica con 4 microservicios backend mediante 3 estrategias distintas:

| App | Estrategia de comunicación | Mecanismo |
|---|---|---|
| **Seller** | Proxy interno (`/api/seller/*`) → Seller API | Cliente `api.ts` desde el browser, el proxy agrega `x-service-key` en server-side |
| **Buyer** | Proxy interno (`/api/buyer/*`) → Buyer API | Fetch directo desde el browser, el proxy verifica `super_admin` + agrega service key |
| **Payments** | Server Actions → Payments API directo | `payments-actions.ts` (server-only) con `PAYMENTS_API_KEY` vía `x-api-key` |
| **Shipping** | Server Actions → Shipping API directo | `shipping-actions.ts` (server-only) con token Clerk + `x-shipping-service-key` |

Las rutas de proxy (`/api/seller/[...path]`, `/api/buyer/[...path]`) evitan CORS y mantienen las API keys en el servidor.

---

## Endpoints consumidos por sección

### Seller — Proxy `/api/seller/*`

| Ruta del proxy | Endpoint real (Seller App) | Uso |
|---|---|---|
| `GET /api/seller/api/admin/statistics` | `GET /api/admin/statistics` | Estadísticas del dashboard |
| `GET /api/seller/api/admin/users` | `GET /api/admin/users` | Listado de vendedores |
| `GET /api/seller/api/admin/users/{clerkId}` | `GET /api/admin/users/{clerkId}` | Detalle de vendedor |
| `POST /api/seller/api/admin/users/{clerkId}/disable` | `POST /api/admin/users/{clerkId}/disable` | Deshabilitar vendedor |
| `POST /api/seller/api/admin/users/{clerkId}/enable` | `POST /api/admin/users/{clerkId}/enable` | Habilitar vendedor |
| `GET /api/seller/api/admin/orders` | `GET /api/admin/orders` | Listado de órdenes |
| `GET /api/seller/api/admin/orders/{id}` | `GET /api/admin/orders/{id}` | Detalle de orden |
| `PATCH /api/seller/api/admin/orders/{id}/status` | `PATCH /api/admin/orders/{id}/status` | Cambiar estado |
| `POST /api/seller/api/admin/orders/{id}/refund` | `POST /api/admin/orders/{id}/refund` | Cancelar/reembolsar |
| `GET /api/seller/api/admin/orders/{id}/timeline` | `GET /api/admin/orders/{id}/timeline` | Timeline de orden |
| `GET /api/seller/api/admin/products` | `GET /api/admin/products` | Listado de productos |
| `PATCH /api/seller/api/admin/products/{id}` | `PATCH /api/admin/products/{id}` | Suspender/reactivar |
| `GET /api/seller/api/admin/reservations` | `GET /api/admin/reservations` | Listado de reservas |
| `POST /api/seller/api/admin/reservations/{id}/release` | `POST /api/admin/reservations/{id}/release` | Liberar reserva |
| `GET /api/seller/api/admin/reviews` | `GET /api/admin/reviews` | Listado de reseñas |
| `GET /api/seller/api/admin/purchases` | `GET /api/admin/purchases` | Listado de compras |
| `GET /api/seller/api/admin/health/dependencies` | `GET /api/admin/health/dependencies` | Health check |

### Payments — Server Actions directo

| Server Action | Endpoint (Payments App) | Uso |
|---|---|---|
| `fetchTransactions(...)` | `GET /api/control-plane/transactions` | Listado de transacciones |
| `fetchTransactionDetail(id)` | `GET /api/control-plane/transactions/{id}` | Detalle de transacción |
| `forceTransactionStatus(id, status, reason)` | `PATCH /api/control-plane/transactions/{id}/force-status` | Forzar estado |
| `releaseFunds(id)` | `POST /api/control-plane/transactions/{id}/release-funds` | Liberar escrow |
| `fetchDisputes(...)` | `GET /api/control-plane/disputes` | Listado de disputas |
| `fetchWallets(...)` | `GET /api/control-plane/wallets` | Listado de wallets |
| `fetchWalletDetail(userId)` | `GET /api/control-plane/wallets/{userId}` | Detalle de wallet |
| `adjustWalletBalance(userId, type, amount, reason)` | `POST /api/control-plane/wallets/{userId}/adjust` | Ajustar saldo |
| `fetchCheckoutSessions(...)` | `GET /api/control-plane/checkout-sessions` | Listado de sessions |
| `fetchCheckoutSessionDetail(id)` | `GET /api/control-plane/checkout-sessions/{id}` | Detalle de session |
| `fetchPaymentsHealth()` | `GET /api/control-plane/health/dependencies` | Health check |
| `fetchAuditIntegrity()` | `GET /api/control-plane/audit/integrity` | Auditoría contable |

### Buyer — Proxy `/api/buyer/*`

| Ruta del proxy | Endpoint real (Buyer App) | Uso |
|---|---|---|
| `GET /api/buyer/api/admin/buyers` | `GET /api/admin/buyers` | Listado de compradores |
| `GET /api/buyer/api/admin/buyers/{id}` | `GET /api/admin/buyers/{id}` | Detalle de comprador |
| `PATCH /api/buyer/api/admin/buyers/{id}` | `PATCH /api/admin/buyers/{id}` | Editar comprador |
| `GET /api/buyer/api/admin/buyers/{id}/shipping-addresses` | `GET /api/admin/buyers/{id}/shipping-addresses` | Direcciones del comprador |
| `GET /api/buyer/api/admin/buyers/{id}/cart` | `GET /api/admin/buyers/{id}/cart` | Carrito del comprador |
| `GET /api/buyer/api/admin/shipping-addresses` | `GET /api/admin/shipping-addresses` | Todas las direcciones |
| `PATCH /api/buyer/api/admin/shipping-addresses/{id}` | `PATCH /api/admin/shipping-addresses/{id}` | Editar dirección |
| `DELETE /api/buyer/api/admin/shipping-addresses/{id}` | `DELETE /api/admin/shipping-addresses/{id}` | Eliminar dirección |
| `GET /api/buyer/api/admin/carts` | `GET /api/admin/carts` | Listado de carritos |
| `GET /api/buyer/api/admin/carts/{id}` | `GET /api/admin/carts/{id}` | Detalle de carrito |
| `DELETE /api/buyer/api/admin/carts/{id}/items/{itemId}` | `DELETE /api/admin/carts/{id}/items/{itemId}` | Eliminar item del carrito |

### Shipping — Server Actions directo

| Server Action | Endpoint (Shipping App) | Uso |
|---|---|---|
| `fetchDeliveryStats()` | `GET /api/analytics/delivery-stats` | Estadísticas de delivery |
| `fetchShipments(...)` | `GET /api/admin/shipments` | Listado de envíos |
| `fetchIncidents(...)` | `GET /api/admin/shipments/incidents` | Envíos cancelados |
| `fetchDrivers(...)` | `GET /api/admin/drivers` | Listado de drivers |
| `fetchDriverShipments(id, ...)` | `GET /api/admin/drivers/{id}/shipments` | Envíos del driver |
| `fetchOperators(...)` | `GET /api/admin/operators` | Listado de operadores |
| `fetchOperatorShipments(id, ...)` | `GET /api/admin/operators/{id}/shipments` | Envíos del operador |
| `updateShipmentStatus(id, status)` | `PATCH /api/admin/shipments/{id}/status` | Actualizar estado de envío |
| `updateDriverStatus(id, status)` | `PATCH /api/admin/drivers/{id}/status` | Activar/desactivar driver |
| `updateOperatorStatus(id, status)` | `PATCH /api/admin/operators/{id}/status` | Activar/desactivar operador |

---

## Stack técnico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript 5.9
- **Autenticación:** Clerk 7 (con middleware + verificación de rol `super_admin`)
- **UI:** CSS Modules + Tailwind CSS 4
- **Iconos:** Lucide React
- **Linter:** ESLint 9 (config `eslint-config-next`)
- **Empaquetador:** pnpm
- **Base de datos (directa):** Neon PostgreSQL (solo para Clerk webhooks locales)
- **Deploy:** Vercel (Framework Preset: Next.js)

---

## Posibles futuras implementaciones

- **Dashboard de drivers**: la sidebar ya referencia `/dashboard/shipping/staff/drivers` pero la ruta no existe — implementar vista de listado/detalle de drivers.
- **Gráficos y analytics**: `recharts` ya está en las dependencias pero no se usa en ninguna página. Agregar gráficos de evolución de transacciones, ingresos por período, distribución de estados, etc.
- **Notificaciones en tiempo real**: WebSocket o Server-Sent Events para alertar sobre nuevas disputas, transacciones fallidas o cambios de estado críticos.
- **Exportación de datos avanzada**: actualmente hay un `ExportCsvButton` componente, pero solo unas pocas páginas lo integran. Extender a todas las tablas.
- **Panel de logs de auditoría**: vista unificada de todas las operaciones de escritura (force-status, adjust-balance, etc.) con búsqueda y filtros.
- **Roles y permisos granulares**: actualmente solo hay `super_admin`. Agregar roles como `payments_operator`, `shipping_manager`, `support_agent` con permisos por sección.
- **Modo oscuro**: implementar theme switching usando CSS custom properties ya definidas.
- **Multi-idioma**: internacionalización (i18n) con Next.js, inicialmente español e inglés.
- **Pruebas automatizadas**: agregar tests E2E con Playwright o Cypress para cubrir los flujos críticos (login, transacciones, auditoría).
- **Historial de cambios en wallets**: mostrar timeline completo de ajustes de saldo con filtros y paginación.
- **Webhook receiver**: panel para visualizar y reintentar webhooks fallidos de Clerk, Mercado Pago, etc.
