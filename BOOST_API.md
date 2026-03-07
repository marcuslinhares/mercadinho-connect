# Boost API Documentation

## Overview

The Boost API enables users to pay $0.01 to boost their offers for 7 days, featuring them at the top of the list. Supports both **Stripe** and **Mercado Pago** as payment methods.

---

## Endpoints

### POST `/api/offers/:id/boost`

Create a boost payment for an offer.

**Authentication:** Required (JWT via Supabase Auth)

**Request Body:**
```json
{
  "paymentMethod": "stripe" | "mercado_pago"
}
```

**Success Response (201):**
```json
{
  "boostId": "uuid-of-boost",
  "clientSecret": "pi_xxx_secret_xxx" | null,
  "redirectUrl": "https://mercadopago.com/checkout/xxx" | null,
  "paymentMethod": "stripe" | "mercado_pago",
  "amount": 0.01,
  "currency": "USD",
  "boostDuration": 7
}
```

**For Stripe:** Use `clientSecret` with Stripe.js to confirm payment
**For Mercado Pago:** Redirect user to `redirectUrl` for checkout

**Error Responses:**

| Status | Error | Reason |
|--------|-------|--------|
| 401 | Unauthorized | User not authenticated |
| 400 | Invalid payment method | Must be "stripe" or "mercado_pago" |
| 404 | Offer not found | Offer ID doesn't exist |
| 409 | Already has active boost | This offer already has a valid boost |
| 500 | Payment creation failed | Stripe/Mercado Pago API error |

---

## Webhook Endpoints

### POST `/api/webhooks/stripe`

Stripe webhook for payment status updates.

**Headers Required:**
- `stripe-signature`: Stripe signature header

**Webhook Events Handled:**
- `payment_intent.succeeded` → Boost status → `completed`
- `payment_intent.payment_failed` → Boost status → `failed`
- `charge.refunded` → Boost status → `refunded`

---

### POST `/api/webhooks/mercado-pago`

Mercado Pago webhook for payment status updates.

**Expected Body:**
```json
{
  "type": "payment",
  "id": "payment-id",
  "data": { ... }
}
```

**Webhook Events Handled:**
- `type: payment` → Updates boost to `completed`

---

## Database Schema

### `boosts` Table

| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID | Primary key |
| `offer_id` | UUID | FK to `offers.id`, cascade delete |
| `user_id` | UUID | FK to `auth.users.id` |
| `payment_id` | VARCHAR(255) | Stripe PI ID or Mercado Pago preference ID |
| `amount` | DECIMAL(10,2) | Amount in USD (0.01) |
| `currency` | VARCHAR(3) | Currency code (USD) |
| `status` | VARCHAR(50) | pending, completed, failed, refunded, expired |
| `payment_method` | VARCHAR(50) | stripe or mercado_pago |
| `created_at` | TIMESTAMP | When boost was created |
| `updated_at` | TIMESTAMP | Last update timestamp |
| `expires_at` | TIMESTAMP | Expiry date (created_at + 7 days) |
| `stripe_payment_intent_id` | VARCHAR(255) | Stripe-specific ID |
| `mercado_pago_preference_id` | VARCHAR(255) | Mercado Pago preference ID |
| `mercado_pago_payment_id` | VARCHAR(255) | Mercado Pago payment ID |
| `error_message` | TEXT | Error details if failed |
| `retry_count` | INT | Number of retry attempts |

**Indexes:**
- `offer_id, created_at DESC` (for list reordering)
- `user_id, created_at DESC` (for user boost history)
- `status` (for filtering)
- `expires_at` (for cleanup jobs)
- `payment_id` (for webhook lookups)

---

## Integration Guide

### Frontend: Stripe Payment

```typescript
import { loadStripe } from '@stripe/js'
import { createPaymentMethod } from '@stripe/react-stripe-js'

async function boostOfferWithStripe(offerId: string) {
  // 1. Create boost payment
  const response = await fetch(`/api/offers/${offerId}/boost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod: 'stripe' }),
  })

  const { clientSecret, boostId } = await response.json()

  // 2. Confirm payment with Stripe.js
  const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY)
  const { paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { /* ... */ }
    }
  })

  // 3. On success, offer is boosted (webhook confirms)
  // Listen for boost status via real-time Supabase subscription
}
```

### Frontend: Mercado Pago

```typescript
async function boostOfferWithMercadoPago(offerId: string) {
  // 1. Create boost payment (returns redirectUrl)
  const response = await fetch(`/api/offers/${offerId}/boost`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod: 'mercado_pago' }),
  })

  const { redirectUrl } = await response.json()

  // 2. Redirect user to Mercado Pago
  window.location.href = redirectUrl
  
  // 3. User completes payment and is redirected back
  // Webhook confirms payment automatically
}
```

---

## Setup Instructions

### 1. Environment Variables

Create `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
MERCADO_PAGO_ACCESS_TOKEN=TEST-xxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Mercado Pago Webhook

1. Go to Mercado Pago Developer Settings
2. Add webhook URL: `https://yourdomain.com/api/webhooks/mercado-pago`
3. Save and enable

### 4. Database Migration

Run Supabase migration:
```bash
supabase migration up
```

Or manually execute SQL in Supabase dashboard from `/supabase/migrations/001_create_boosts_table.sql`.

---

## Testing

### Stripe Test Cards

- **Success:** `4242 4242 4242 4242` (any future exp, any CVC)
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0025 0000 3155`

### Mercado Pago Sandbox

1. Use sandbox credentials in `.env.local`
2. Test payment flow with sandbox cards
3. Webhooks fire automatically in sandbox

---

## Error Handling

**Payment Intent Creation Failed:**
- Boost record created in `pending` status
- Webhook will update status when payment is processed
- If webhook doesn't arrive, reconciliation job (runs hourly) will check status

**Webhook Validation Failure:**
- Request rejected with 401
- Verify signature headers and secret keys
- Check logs for signature mismatch errors

**Duplicate Boost Prevention:**
- Before creating, API checks for active boosts
- Returns 409 Conflict if one exists
- User can only have one active boost per offer

---

## Monitoring

### Pending Boosts

Track boosts stuck in "pending" state:
```sql
SELECT * FROM boosts 
WHERE status = 'pending' 
AND created_at < now() - interval '30 minutes';
```

### Failed Boosts

Review failed payments:
```sql
SELECT id, offer_id, user_id, error_message, retry_count 
FROM boosts 
WHERE status = 'failed' 
ORDER BY created_at DESC;
```

### Expiring Soon

Boosts expiring in next 48 hours:
```sql
SELECT id, offer_id, expires_at 
FROM boosts 
WHERE status = 'completed'
AND expires_at BETWEEN now() AND now() + interval '2 days';
```

---

## Cost Breakdown

- **Per Boost:** $0.01 USD (payment fee included)
- **Stripe Processing:** ~2.9% + $0.30 (paid by customer via margin if applicable)
- **Mercado Pago:** ~3.99% (paid by customer)
- **Revenue (Mercadinho):** $0.01 per boost (gross, before fees)

---

## Future Enhancements

- [ ] Tiered boost plans ($0.05, $0.10 for extended duration)
- [ ] Bulk discounts (boost 3 offers, save 10%)
- [ ] Analytics dashboard (boost performance, CTR, conversions)
- [ ] Auto-renewal option
- [ ] A/B testing of boost badge designs

---

**Last Updated:** 2026-03-07
**Status:** ✅ Production Ready
