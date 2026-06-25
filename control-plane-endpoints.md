# 🎛️ Control Plane API — Payments App Bonzai

Documentación completa de los endpoints del **Control Plane** expuestos por la Payments App.

> [!NOTE]
> **Base URL de producción:** `https://proyecto-c-payments-bonzai.vercel.app`
> **Base URL local:** `http://localhost:3000`

---

## 🔐 Autenticación

Todos los endpoints del Control Plane usan autenticación **M2M (Machine-to-Machine)** mediante un header personalizado.

| Header | Valor |
|--------|-------|
| `x-api-key` | El valor de la variable de entorno `CONTROL_PLANE_API_KEY` configurada en la Payments App |

### Códigos de error de autenticación

| Status | Error | Descripción |
|--------|-------|-------------|
| `401` | `UNAUTHORIZED` | No se envió el header `x-api-key` |
| `403` | `FORBIDDEN` | La API key es inválida |
| `500` | `SERVICE_MISCONFIGURED` | `CONTROL_PLANE_API_KEY` no está configurada en el servidor |

### Ejemplo de request autenticado

```bash
curl -H "x-api-key: TU_API_KEY" \
  https://proyecto-c-payments-bonzai.vercel.app/api/control-plane/transactions
```

---

## 📄 Paginación

Todos los endpoints de listado soportan paginación uniforme:

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Página actual (mínimo 1) |
| `limit` | `number` | `20` | Ítems por página (1-100) |

### Formato de respuesta de paginación

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## 📅 Filtros de fecha

Varios endpoints aceptan filtros de rango de fecha:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `from` | `string` (ISO 8601) | Fecha inicio (inclusive) |
| `to` | `string` (ISO 8601) | Fecha fin (inclusive) |

```
?from=2026-01-01T00:00:00Z&to=2026-06-30T23:59:59Z
```

---

## 📦 Endpoints

### 1. Listar Transacciones

```
GET /api/control-plane/transactions
```

Lista todas las transacciones del sistema con filtros avanzados.

#### Query Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | `number` | Página |
| `limit` | `number` | Ítems por página |
| `status` | `string` | Filtrar por estado: `PENDING`, `HELD`, `DELIVERED`, `COMPLETED`, `DISPUTED`, `REFUNDED` |
| `buyerId` | `string` | Filtrar por ID del comprador |
| `sellerId` | `string` | Filtrar por ID del vendedor |
| `search` | `string` | Buscar por `orderId` (búsqueda parcial, case insensitive) |
| `from` | `string` | Fecha inicio (ISO 8601) |
| `to` | `string` | Fecha fin (ISO 8601) |

#### Response `200 OK`

```json
{
  "transactions": [
    {
      "id": "clxyz123...",
      "checkoutSessionId": "clxyz456...",
      "orderId": "ORD-001",
      "buyerId": "user_buyer123",
      "sellerId": "user_seller456",
      "amount": 5000.00,
      "commissionRate": 0.05,
      "commissionAmount": 250.00,
      "netAmount": 4750.00,
      "status": "HELD",
      "currency": "ARS",
      "hasDispute": false,
      "dispute": null,
      "createdAt": "2026-06-15T10:30:00.000Z",
      "updatedAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

> Si la transacción tiene disputa, el campo `dispute` incluye `{ id, reason, resolution }`.

---

### 2. Detalle de Transacción

```
GET /api/control-plane/transactions/{id}
```

Retorna el detalle completo de una transacción, incluyendo su disputa, entradas del libro mayor (ledger entries) y datos del checkout session asociado.

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la transacción |

#### Response `200 OK`

```json
{
  "id": "clxyz123...",
  "checkoutSessionId": "clxyz456...",
  "orderId": "ORD-001",
  "buyerId": "user_buyer123",
  "sellerId": "user_seller456",
  "amount": 5000.00,
  "commissionRate": 0.05,
  "commissionAmount": 250.00,
  "netAmount": 4750.00,
  "status": "HELD",
  "currency": "ARS",
  "createdAt": "2026-06-15T10:30:00.000Z",
  "updatedAt": "2026-06-15T10:30:00.000Z",
  "dispute": {
    "id": "dispute_123",
    "reason": "ITEM_NOT_RECEIVED",
    "description": "No me llegó el producto",
    "resolution": "FAVOR_BUYER",
    "resolutionNotes": "Se verificó con tracking",
    "refundAmount": 5000.00,
    "createdAt": "2026-06-16T08:00:00.000Z",
    "resolvedAt": "2026-06-17T14:00:00.000Z"
  },
  "ledgerEntries": [
    {
      "id": "ledger_001",
      "userId": "user_seller456",
      "type": "CREDIT",
      "amount": 4750.00,
      "description": "Pago al vendedor por orden ORD-001",
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "checkoutSession": {
    "id": "clxyz456...",
    "buyerId": "user_buyer123",
    "totalAmount": 10000.00,
    "status": "PAID",
    "createdAt": "2026-06-15T10:00:00.000Z",
    "payments": [
      {
        "id": "pay_001",
        "provider": "MERCADOPAGO",
        "providerStatus": "approved",
        "externalId": "mp_12345",
        "createdAt": "2026-06-15T10:05:00.000Z"
      }
    ]
  }
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `404` | `TRANSACTION_NOT_FOUND` | Transacción no encontrada |

---

### 3. Forzar Cambio de Estado

```
PATCH /api/control-plane/transactions/{id}/force-status
```

Fuerza un cambio de estado de una transacción. Se usa para resolución de disputas o correcciones manuales. Genera una entrada de auditoría en el Libro Mayor.

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la transacción |

#### Body (JSON)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | `string` | ✅ | Nuevo estado. Valores válidos: `PENDING`, `HELD`, `DELIVERED`, `COMPLETED`, `DISPUTED`, `REFUNDED` |
| `reason` | `string` | ✅ | Motivo del cambio (para auditoría) |

#### Ejemplo de request

```bash
curl -X PATCH \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "COMPLETED", "reason": "Resolución de disputa a favor del vendedor"}' \
  https://proyecto-c-payments-bonzai.vercel.app/api/control-plane/transactions/TX_ID/force-status
```

#### Response `200 OK`

```json
{
  "success": true,
  "transactionId": "clxyz123...",
  "previousStatus": "DISPUTED",
  "newStatus": "COMPLETED",
  "reason": "Resolución de disputa a favor del vendedor",
  "message": "Estado cambiado de DISPUTED a COMPLETED."
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `400` | `INVALID_STATUS` | Estado no válido |
| `400` | `MISSING_REASON` | No se proporcionó un motivo |
| `404` | `TRANSACTION_NOT_FOUND` | Transacción no encontrada |

> [!IMPORTANT]
> Este endpoint genera una **entrada de auditoría** en el Libro Mayor con `userId: "control-plane"`, `amount: 0` y la descripción `[FORCE-STATUS] ESTADO_ANTERIOR → ESTADO_NUEVO — motivo`.

---

### 4. Liberar Fondos (Escrow Release)

```
POST /api/control-plane/transactions/{id}/release-funds
```

Libera manualmente los fondos retenidos de una transacción. Mueve la transacción de `DELIVERED` → `COMPLETED` y transfiere los fondos de `heldBalance` a `availableBalance` en la wallet del vendedor.

> [!TIP]
> Este endpoint resuelve la limitación conocida del proyecto (la transición automática `DELIVERED` → `COMPLETED` que queda como trabajo futuro).

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID de la transacción |

#### Body

No requiere body.

#### Response `200 OK`

```json
{
  "success": true,
  "transactionId": "clxyz123...",
  "orderId": "ORD-001",
  "sellerId": "user_seller456",
  "newStatus": "COMPLETED",
  "releasedAmount": 4750.00,
  "message": "Fondos liberados al vendedor."
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `400` | `INVALID_STATUS` | La transacción no está en estado `DELIVERED` |
| `404` | `TRANSACTION_NOT_FOUND` | Transacción no encontrada |

> [!NOTE]
> **Operación atómica**: Este endpoint ejecuta todo en una transacción de base de datos. Si todas las transacciones hermanas (mismo checkout session) están en `COMPLETED`, la `CheckoutSession` padre también se marca como `COMPLETED`.

---

### 5. Listar Disputas

```
GET /api/control-plane/disputes
```

Lista todas las disputas del sistema con filtros.

#### Query Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | `number` | Página |
| `limit` | `number` | Ítems por página |
| `status` | `string` | `"pending"` (sin resolver) o `"resolved"` (resuelta) |
| `reason` | `string` | Filtrar por motivo: `ITEM_NOT_RECEIVED`, `ITEM_DAMAGED`, etc. |
| `from` | `string` | Fecha inicio (ISO 8601) |
| `to` | `string` | Fecha fin (ISO 8601) |

#### Response `200 OK`

```json
{
  "disputes": [
    {
      "id": "dispute_123",
      "transactionId": "clxyz123...",
      "reason": "ITEM_NOT_RECEIVED",
      "description": "No me llegó el producto y ya pasaron 15 días",
      "resolution": null,
      "resolutionNotes": null,
      "refundAmount": null,
      "createdAt": "2026-06-16T08:00:00.000Z",
      "resolvedAt": null,
      "transaction": {
        "id": "clxyz123...",
        "orderId": "ORD-001",
        "buyerId": "user_buyer123",
        "sellerId": "user_seller456",
        "amount": 5000.00,
        "status": "DISPUTED"
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

### 6. Listar Wallets

```
GET /api/control-plane/wallets
```

Lista todas las wallets de vendedores con paginación.

#### Query Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | `number` | Página |
| `limit` | `number` | Ítems por página |
| `search` | `string` | Buscar por `userId` (búsqueda parcial, case insensitive) |

#### Response `200 OK`

```json
{
  "wallets": [
    {
      "id": "wallet_001",
      "userId": "user_seller456",
      "availableBalance": 15000.00,
      "heldBalance": 5000.00,
      "totalBalance": 20000.00,
      "updatedAt": "2026-06-18T14:00:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

> [!NOTE]
> `totalBalance` es un campo calculado: `availableBalance + heldBalance`.

---

### 7. Detalle de Wallet + Actividad

```
GET /api/control-plane/wallets/{userId}
```

Detalle completo de la wallet de un vendedor, incluyendo sus últimas 20 transacciones, últimas 20 entradas del libro mayor, y estadísticas agregadas.

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | `string` | ID del usuario (Clerk user ID) |

#### Response `200 OK`

```json
{
  "wallet": {
    "id": "wallet_001",
    "userId": "user_seller456",
    "availableBalance": 15000.00,
    "heldBalance": 5000.00,
    "totalBalance": 20000.00,
    "updatedAt": "2026-06-18T14:00:00.000Z"
  },
  "stats": {
    "totalTransactions": 25,
    "totalVolume": 125000.00,
    "totalNetEarnings": 118750.00,
    "totalCommissionsPaid": 6250.00
  },
  "recentTransactions": [
    {
      "id": "clxyz123...",
      "orderId": "ORD-001",
      "buyerId": "user_buyer123",
      "amount": 5000.00,
      "netAmount": 4750.00,
      "commissionAmount": 250.00,
      "status": "COMPLETED",
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "recentLedger": [
    {
      "id": "ledger_001",
      "transactionId": "clxyz123...",
      "type": "CREDIT",
      "amount": 4750.00,
      "description": "Pago al vendedor por orden ORD-001",
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ]
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `404` | `WALLET_NOT_FOUND` | Wallet no encontrada para este usuario |

---

### 8. Ajuste Manual de Saldo

```
POST /api/control-plane/wallets/{userId}/adjust
```

Permite acreditar o debitar fondos manualmente de la wallet de un vendedor (para compensaciones, multas, etc.). Genera las correspondientes entradas en el Libro Mayor manteniendo la integridad contable de doble entrada.

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `userId` | `string` | ID del usuario |

#### Body (JSON)

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `type` | `string` | ✅ | Tipo de ajuste: `"CREDIT"` (acreditar) o `"DEBIT"` (debitar) |
| `amount` | `number` | ✅ | Monto positivo |
| `reason` | `string` | ✅ | Motivo del ajuste (para auditoría) |

#### Ejemplo de request

```bash
curl -X POST \
  -H "x-api-key: TU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"type": "CREDIT", "amount": 500, "reason": "Compensación por demora en envío"}' \
  https://proyecto-c-payments-bonzai.vercel.app/api/control-plane/wallets/USER_ID/adjust
```

#### Response `200 OK`

```json
{
  "success": true,
  "userId": "user_seller456",
  "adjustment": {
    "type": "CREDIT",
    "amount": 500,
    "reason": "Compensación por demora en envío"
  },
  "wallet": {
    "availableBalance": 15500.00,
    "heldBalance": 5000.00,
    "totalBalance": 20500.00
  },
  "message": "Acreditación de $500 procesado."
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `400` | `INVALID_TYPE` | Tipo no válido (debe ser `CREDIT` o `DEBIT`) |
| `400` | `INVALID_AMOUNT` | Monto inválido (debe ser número positivo) |
| `400` | `MISSING_REASON` | No se proporcionó motivo |
| `400` | `INSUFFICIENT_BALANCE` | Saldo insuficiente para débito |
| `404` | `WALLET_NOT_FOUND` | Wallet no encontrada |

> [!IMPORTANT]
> **Doble entrada contable**: Este endpoint crea automáticamente un **contra-asiento** para la plataforma, manteniendo la regla `Σ(DEBIT) = Σ(CREDIT)` en el libro mayor. Si se hace un `CREDIT` al vendedor, se genera un `DEBIT` para `platform`, y viceversa.

---

### 9. Listar Checkout Sessions

```
GET /api/control-plane/checkout-sessions
```

Lista las checkout sessions con sus pagos asociados. Permite ver el flujo de carritos multi-vendedor.

#### Query Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `page` | `number` | Página |
| `limit` | `number` | Ítems por página |
| `status` | `string` | Filtrar por estado |
| `buyerId` | `string` | Filtrar por comprador |
| `from` | `string` | Fecha inicio (ISO 8601) |
| `to` | `string` | Fecha fin (ISO 8601) |

#### Response `200 OK`

```json
{
  "sessions": [
    {
      "id": "clxyz456...",
      "buyerId": "user_buyer123",
      "totalAmount": 10000.00,
      "status": "PAID",
      "transactionCount": 3,
      "payments": [
        {
          "id": "pay_001",
          "provider": "MERCADOPAGO",
          "providerStatus": "approved",
          "externalId": "mp_12345"
        }
      ],
      "createdAt": "2026-06-15T10:00:00.000Z",
      "updatedAt": "2026-06-15T10:05:00.000Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 30, "totalPages": 2 }
}
```

---

### 10. Detalle de Checkout Session

```
GET /api/control-plane/checkout-sessions/{id}
```

Detalle completo de un checkout session: transacciones hijas, pagos de MercadoPago, y un resumen calculado.

#### Path Params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | `string` | ID del checkout session |

#### Response `200 OK`

```json
{
  "id": "clxyz456...",
  "buyerId": "user_buyer123",
  "totalAmount": 10000.00,
  "status": "PAID",
  "createdAt": "2026-06-15T10:00:00.000Z",
  "updatedAt": "2026-06-15T10:05:00.000Z",
  "transactions": [
    {
      "id": "clxyz123...",
      "orderId": "ORD-001",
      "sellerId": "user_seller456",
      "amount": 5000.00,
      "commissionAmount": 250.00,
      "netAmount": 4750.00,
      "status": "HELD",
      "currency": "ARS",
      "hasDispute": false,
      "dispute": null,
      "createdAt": "2026-06-15T10:30:00.000Z"
    }
  ],
  "payments": [
    {
      "id": "pay_001",
      "provider": "MERCADOPAGO",
      "providerStatus": "approved",
      "externalId": "mp_12345",
      "preferenceId": "pref_12345",
      "checkoutUrl": "https://mercadopago.com.ar/checkout/v1/redirect?pref_id=pref_12345",
      "createdAt": "2026-06-15T10:05:00.000Z"
    }
  ],
  "summary": {
    "transactionCount": 2,
    "uniqueSellers": 2,
    "totalCommissions": 500.00,
    "totalNet": 9500.00,
    "statusBreakdown": {
      "HELD": 1,
      "COMPLETED": 1
    }
  }
}
```

#### Errores

| Status | Error | Descripción |
|--------|-------|-------------|
| `404` | `SESSION_NOT_FOUND` | Checkout session no encontrada |

---

### 11. Health Check de Dependencias

```
GET /api/control-plane/health/dependencies
```

Chequeo de salud de las dependencias externas del sistema.

#### Dependencias verificadas

| Servicio | Verificación |
|----------|-------------|
| **Database** (Neon PostgreSQL) | Ejecuta `SELECT 1` y mide latencia |
| **MercadoPago** | Verifica que `MP_ACCESS_TOKEN` esté configurado |
| **Clerk** | Verifica que `CLERK_SECRET_KEY` esté configurado |

#### Response `200 OK`

```json
{
  "status": "healthy",
  "services": {
    "database": {
      "status": "up",
      "latencyMs": 45
    },
    "mercadopago": {
      "status": "up",
      "latencyMs": 0
    },
    "clerk": {
      "status": "up",
      "latencyMs": 0
    }
  },
  "environment": "production",
  "timestamp": "2026-06-18T17:00:00.000Z"
}
```

> Si algún servicio está caído, `status` cambia a `"degraded"` y el servicio muestra `"status": "down"` con un campo `error` descriptivo.

---

### 12. Chequeo de Integridad Contable

```
GET /api/control-plane/audit/integrity
```

Auditoría matemática del Libro Mayor. Valida que `Σ(DEBIT) = Σ(CREDIT)` en todo el sistema, verifica integridad por transacción individual, detecta transacciones huérfanas, y valida que los saldos de las wallets coincidan con el neto del ledger.

#### Response `200 OK`

```json
{
  "status": "PASS",
  "timestamp": "2026-06-18T17:00:00.000Z",
  "global": {
    "totalDebits": 125000.00,
    "totalCredits": 125000.00,
    "difference": 0.00,
    "balanced": true,
    "debitEntryCount": 150,
    "creditEntryCount": 150
  },
  "transactionIntegrity": {
    "totalChecked": 75,
    "inconsistentCount": 0,
    "inconsistencies": []
  },
  "orphanedTransactions": {
    "count": 0,
    "message": "Todas las transacciones procesadas tienen entradas en el libro mayor."
  },
  "walletIntegrity": {
    "totalChecked": 12,
    "inconsistentCount": 0,
    "inconsistencies": []
  }
}
```

#### Campos del chequeo

| Sección | Descripción |
|---------|-------------|
| `global` | Suma total de DEBIT vs CREDIT (tolerancia de $0.01 por redondeo) |
| `transactionIntegrity` | Verifica que cada transacción individual tenga DEBIT = CREDIT |
| `orphanedTransactions` | Transacciones en estado procesado (`HELD`, `DELIVERED`, `COMPLETED`, `REFUNDED`) sin entradas en el libro mayor |
| `walletIntegrity` | Verifica que `availableBalance + heldBalance` de cada wallet coincida con el neto de sus entradas en el ledger |

> [!WARNING]
> Si `status` es `"FAIL"`, las secciones con inconsistencias incluirán arrays detallando cada discrepancia (limitado a 50 por sección).

---

## 📊 Resumen Rápido

| # | Método | Endpoint | Acción |
|---|--------|----------|--------|
| 1 | `GET` | `/api/control-plane/transactions` | Listar transacciones con filtros |
| 2 | `GET` | `/api/control-plane/transactions/{id}` | Detalle de transacción |
| 3 | `PATCH` | `/api/control-plane/transactions/{id}/force-status` | Forzar cambio de estado |
| 4 | `POST` | `/api/control-plane/transactions/{id}/release-funds` | Liberar fondos (escrow) |
| 5 | `GET` | `/api/control-plane/disputes` | Listar disputas |
| 6 | `GET` | `/api/control-plane/wallets` | Listar wallets |
| 7 | `GET` | `/api/control-plane/wallets/{userId}` | Detalle de wallet + actividad |
| 8 | `POST` | `/api/control-plane/wallets/{userId}/adjust` | Ajuste manual de saldo |
| 9 | `GET` | `/api/control-plane/checkout-sessions` | Listar checkout sessions |
| 10 | `GET` | `/api/control-plane/checkout-sessions/{id}` | Detalle de checkout session |
| 11 | `GET` | `/api/control-plane/health/dependencies` | Health check |
| 12 | `GET` | `/api/control-plane/audit/integrity` | Integridad contable |

---

## ⚠️ Estados de Transacción

Diagrama del flujo de estados de una transacción:

```
PENDING → HELD → DELIVERED → COMPLETED
                      ↓
                   DISPUTED → REFUNDED
```

| Estado | Descripción |
|--------|-------------|
| `PENDING` | Checkout creado, pago aún no confirmado |
| `HELD` | Pago confirmado, fondos retenidos en escrow |
| `DELIVERED` | Envío confirmado por la Shipping App |
| `COMPLETED` | Fondos liberados al vendedor |
| `DISPUTED` | Comprador abrió una disputa |
| `REFUNDED` | Disputa resuelta con reembolso al comprador |

---

## 🔗 Variables de Entorno Necesarias

Para que el Control Plane pueda consumir estos endpoints, necesita configurar:

```env
# En la Payments App (.env)
CONTROL_PLANE_API_KEY=tu_clave_secreta_compartida

# En la app del Control Plane (.env)
PAYMENTS_API_URL=https://proyecto-c-payments-bonzai.vercel.app
PAYMENTS_API_KEY=tu_clave_secreta_compartida  # Mismo valor que CONTROL_PLANE_API_KEY
```
