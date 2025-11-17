# MaxSec Backend

## Payment Flows

We support two payment paths:
1. Manual Direct UPI / Bank Transfer (legacy): User pays externally then submits transaction/UTR or receipt email. Admin approves to activate enrollment.
2. PhonePe Gateway (standard checkout): User is redirected to PhonePe and completes payment via UPI, cards or net banking. On success we auto‑create enrollment.

## Manual Direct UPI
Env variables used:
- `MANUAL_UPI` – UPI ID shown to user.
- `MANUAL_UPI_QR` – Public URL (or path served via frontend) to QR image.
- `DIRECT_UPI_EXTRA_DISCOUNT` – Flat INR amount subtracted AFTER coupon (default 50). Enforced server‑side in `createCheckoutSession` and `submitManualPayment`.

Discount Order: Original Price → Coupon % → Direct UPI Flat Discount.

## PhonePe Integration
Endpoints:
- `POST /api/payments/phonepe/initiate/:courseId` – Creates PhonePe order and returns `payPageUrl`.
- `GET  /api/payments/phonepe/status/:orderId` – Polls PhonePe for order status; on success enrollment is created and manual_payments row updated to `approved`.
- `POST /api/payments/phonepe/callback` – Placeholder for future webhook signature validation.

### Required Environment Variables
| Variable | Description |
|----------|-------------|
| `PHONEPE_CLIENT_ID` | Client ID from PhonePe dashboard |
| `PHONEPE_CLIENT_SECRET` | Client Secret (keep private) |
| `PHONEPE_CLIENT_VERSION` | Version value provided by PhonePe |
| `PHONEPE_MERCHANT_ID` | Merchant ID |
| `PHONEPE_ENV` | `sandbox` or `production` (defaults to sandbox) |
| `SITE_URL` | Public site base URL used for redirect/callback |
| `DIRECT_UPI_EXTRA_DISCOUNT` | Flat INR discount for manual UPI (default 50) |

### Redirect Flow
We generate a `merchantOrderId` and send `redirectUrl=SITE_URL/payment-success?order_id=<merchantOrderId>` so the frontend can poll status after the user returns.

### Enrollment Creation
On successful status (`COMPLETED` | `SUCCESS` | `PAID`) we:
1. Update `manual_payments` row (created as status `initiated`) to `approved`.
2. Create enrollment if not already active.

### Webhook Verification
`/api/payments/phonepe/callback` now checks an HMAC signature header (`x-phonepe-signature` or `x-verify`) using `sha256(body, PHONEPE_CLIENT_SECRET)`. Ensure this matches PhonePe’s official specification (adjust if payload + salt pattern is required). Raw body captured via `server.js` JSON verify function.

### TODO / Hardening
- Confirm exact signature construction per latest PhonePe docs (salt / base64 variants) and update verification logic.
- Evaluate need for OAuth token (`/v1/oauth/token`) in production and implement token caching if required.
- Add refund endpoint support once needed.
- Enforce coupon usage limits (usage_limit decrement + denial beyond limit).

## Security Notes
- Service role key is only used server‑side via `connectSupabaseAdmin()`.
- Ensure PhonePe secrets are never exposed client‑side; they live only in backend environment.
- Rate limit payment endpoints if public usage grows.

## Local Testing
1. Set env vars in a `.env` file (do not commit):
```
PHONEPE_CLIENT_ID=xxx
PHONEPE_CLIENT_SECRET=xxx
PHONEPE_CLIENT_VERSION=1
PHONEPE_MERCHANT_ID=MERCHANT123
PHONEPE_ENV=sandbox
SITE_URL=http://localhost:5173
MANUAL_UPI=example@upi
MANUAL_UPI_QR=https://example.com/qr.png
DIRECT_UPI_EXTRA_DISCOUNT=50
```
2. Start backend: `npm run dev`
3. Start frontend: `npm run dev`
4. Perform a checkout, choose PhonePe, confirm redirect and return.
5. Polling occurs on `PaymentSuccess` page until success.

## Future Improvements
- Merge manual / PhonePe payment tracking into a unified `payments` table with type field.
- Store raw PhonePe responses for audit.
- Add coupon usage decrement / limit enforcement.
