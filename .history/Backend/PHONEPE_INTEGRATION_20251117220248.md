# PhonePe Payment Gateway Integration Guide

## Overview
MaxSec Backend implements **PhonePe Standard Checkout API v2** for secure, PCI-compliant payment processing.

**API Version:** v2 (checkout/v2/*)  
**Authentication:** OAuth 2.0 Bearer Token  
**Compliance:** Fully aligned with PhonePe official documentation

---

## Environment Configuration

### Required Variables

```env
# PhonePe Credentials (from PhonePe Business Dashboard)
PHONEPE_CLIENT_ID=M23SRQANWX5JJ_2511172126
PHONEPE_CLIENT_SECRET=ZDZlMTlkMWQtMzI0Yy00NDBlLWJiZGItMTk0YTJmZWY2OTUy
PHONEPE_CLIENT_VERSION=1
PHONEPE_MERCHANT_ID=M23SRQANWX5JJ

# Environment
PHONEPE_ENV=sandbox  # Change to 'production' for live transactions

# Site Configuration
SITE_URL=https://mx-3xxg.onrender.com  # Your public domain
```

**Important:** Never commit credentials to version control. Keep `.env` in `.gitignore`.

---

## API Endpoints

### 1. Initiate Payment
**Endpoint:** `POST /api/payments/phonepe/initiate/:courseId`

**Request:**
```json
{
  "coupon": "DISCOUNT10"  // Optional
}
```

**Response:**
```json
{
  "merchantOrderId": "ORD_course123_user456_abc789",
  "amount": 950.00,
  "currency": "INR",
  "discount_percent": 5,
  "original_amount": 1000.00,
  "payPageUrl": "https://mercury-uat.phonepe.com/transact/uat_v2?token=..."
}
```

**Frontend Action:** Redirect user to `payPageUrl`

---

### 2. Check Order Status
**Endpoint:** `GET /api/payments/phonepe/status/:orderId`

**Response:**
```json
{
  "orderId": "ORD_course123_user456_abc789",
  "phonePeOrderId": "OMO2403282020198641071317",
  "state": "COMPLETED",
  "amount": 95000,  // In paise
  "paymentDetails": [
    {
      "transactionId": "OM2403282020198651071949",
      "paymentMode": "UPI_QR",
      "state": "COMPLETED",
      "rail": {
        "type": "UPI",
        "utr": "455069731511",
        "vpa": "user@upi"
      }
    }
  ],
  "success": true
}
```

**States:**
- `PENDING` – Payment not completed
- `COMPLETED` – Payment successful (enrollment auto-created)
- `FAILED` – Payment failed

---

### 3. Webhook Callback
**Endpoint:** `POST /api/payments/phonepe/callback`

**Webhook Events:**
- `checkout.order.completed`
- `checkout.order.failed`

**Payload Example:**
```json
{
  "type": "checkout.order.completed",
  "payload": {
    "orderId": "OMO2403282020198641071317",
    "originalMerchantOrderId": "ORD_course123_user456_abc789",
    "state": "COMPLETED",
    "amount": 95000,
    "merchantId": "M23SRQANWX5JJ"
  }
}
```

**Configuration Required:**
1. Open PhonePe Business Dashboard
2. Navigate to **Developer Settings** → **Webhooks**
3. Register: `https://yourdomain.com/api/payments/phonepe/callback`
4. Ensure HTTPS is enabled

---

## Payment Flow Diagram

```
┌─────────┐                ┌──────────┐               ┌─────────┐
│ User    │                │ Backend  │               │ PhonePe │
└────┬────┘                └────┬─────┘               └────┬────┘
     │                          │                          │
     │ 1. Initiate Payment      │                          │
     ├─────────────────────────>│                          │
     │                          │ 2. OAuth Token Request   │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │                          │ 3. Create Order (/v2/pay)│
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │<─────────────────────────┤ 4. Return redirectUrl    │
     │                          │                          │
     │ 5. Redirect to PhonePe   │                          │
     ├──────────────────────────────────────────────────>│
     │                          │                          │
     │ 6. Complete Payment (UPI/Card/NetBanking)          │
     │<─────────────────────────────────────────────────>│
     │                          │                          │
     │                          │<─────────────────────────┤
     │                          │ 7. Webhook Notification  │
     │                          │ (checkout.order.completed)
     │                          │                          │
     │ 8. Redirect to Success   │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ 9. Poll Status (optional)│                          │
     ├─────────────────────────>│ 10. Query Status API     │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │<─────────────────────────┤                          │
     │ 11. Show Success         │                          │
```

---

## Security Implementation

### ✅ OAuth Token Management
- Tokens fetched from `/v1/oauth/token` using client credentials
- Cached in memory with automatic refresh 5 minutes before expiry
- All API calls use `Authorization: O-Bearer <token>` header

```javascript
// Token cache implementation
let cachedAuthToken = null;
let tokenExpiry = 0;

async function getPhonePeAuthToken() {
  const now = Date.now();
  if (cachedAuthToken && tokenExpiry > now + 300000) {
    return cachedAuthToken; // Use cached token
  }
  // Fetch new token...
}
```

### ✅ Webhook Security (v2 Specification)
**PhonePe Standard Checkout v2 uses URL whitelisting:**
1. Register callback URL in PhonePe dashboard
2. PhonePe only sends webhooks to registered URLs
3. HTTPS required for production
4. No HMAC signature verification (removed from v2)

**Backend Validation:**
```javascript
export const phonePeCallback = async (req, res) => {
  const { type, payload } = req.body;
  const orderId = payload?.originalMerchantOrderId;
  const state = payload?.state;
  
  // Validate event type and state
  if (type === 'checkout.order.completed' && state === 'COMPLETED') {
    // Auto-approve payment and create enrollment
  }
  
  res.status(200).json({ success: true }); // Always return 200
};
```

### ✅ Server-Side Amount Validation
- All discount calculations done server-side
- Client cannot manipulate payment amounts
- Coupon validation against database with expiry checks

### ✅ Payment State Machine
```
INITIATED → PENDING → COMPLETED ✓
                   → FAILED ✗
```

---

## Testing Guide

### Sandbox Environment

1. **Set Environment Variables:**
```env
PHONEPE_ENV=sandbox
SITE_URL=http://localhost:5173  # For local testing
```

2. **Test Payment Flow:**
   - Use PhonePe sandbox credentials
   - Test UPI IDs and cards provided in PhonePe docs
   - No real money charged

3. **Webhook Testing (Local Development):**
```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Output: https://abc123.ngrok.io

# Register in PhonePe dashboard:
# https://abc123.ngrok.io/api/payments/phonepe/callback
```

### Test Scenarios

**✅ Successful Payment:**
1. Initiate payment
2. Redirect to PhonePe
3. Complete payment using test UPI
4. Verify webhook received (check logs)
5. Confirm enrollment created in database

**✅ Failed Payment:**
1. Initiate payment
2. Cancel or let payment expire
3. Verify state becomes `FAILED`
4. Check payment marked as `rejected`

**✅ Pending Payment:**
1. Initiate payment
2. Don't complete (abandon)
3. Payment expires after 30 minutes
4. State remains `PENDING`

---

## Production Deployment Checklist

- [ ] Change `PHONEPE_ENV=production`
- [ ] Update all credentials to production values
- [ ] Set `SITE_URL` to production domain (HTTPS required)
- [ ] Register production callback URL in PhonePe dashboard
- [ ] Enable HTTPS/SSL certificate on server
- [ ] Test with ₹1-10 transaction
- [ ] Monitor first 10 transactions closely
- [ ] Set up error alerting (email/Slack)
- [ ] Verify enrollment auto-creation works
- [ ] Check webhook delivery in PhonePe dashboard logs

---

## Payment Modes Supported

PhonePe Standard Checkout provides:

| Mode | Description |
|------|-------------|
| **UPI Intent** | App-to-app UPI payments (Google Pay, PhonePe, Paytm) |
| **UPI Collect** | Enter VPA and approve on UPI app |
| **UPI QR** | Scan QR code to pay (desktop only) |
| **Debit Cards** | Visa, Mastercard, RuPay |
| **Credit Cards** | Visa, Mastercard, Amex |
| **Net Banking** | 50+ Indian banks |
| **PhonePe Wallet** | PhonePe wallet balance |

---

## Error Handling

### Common Errors

**1. Authentication Failed**
```
Error: PhonePe authentication failed
```
**Fix:** Verify `PHONEPE_CLIENT_ID`, `PHONEPE_CLIENT_SECRET`, `PHONEPE_CLIENT_VERSION`

**2. Missing Redirect URL**
```
Error: PhonePe response missing redirect URL
```
**Fix:** Check API response structure, ensure using `/checkout/v2/pay` endpoint

**3. Webhook Not Received**
**Fix:**
- Verify URL registered in PhonePe dashboard
- Check server firewall (allow incoming POST)
- Use ngrok for local testing
- Check `/api/payments/phonepe/callback` route exists

**4. Payment Stuck in PENDING**
**Causes:**
- User abandoned payment
- Payment expired (30 min default)
- Network issues

**Solution:** Query status API, show retry option to user

### Error Response Format
```json
{
  "message": "Failed to initiate PhonePe payment",
  "details": {
    "code": "INVALID_MERCHANT_ORDER_ID",
    "message": "Order ID already exists"
  }
}
```

---

## Database Schema

### manual_payments Table
```sql
CREATE TABLE manual_payments (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  amount NUMERIC(10,2),
  payment_method VARCHAR(30),  -- 'PHONEPE' or 'UPI'
  transaction_id VARCHAR(100),  -- merchantOrderId
  receipt_email VARCHAR(160),   -- PhonePe's orderId stored here
  status VARCHAR(20),           -- 'initiated', 'approved', 'rejected'
  coupon_code VARCHAR(50),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Payment States:**
- `initiated` – Order created, payment pending
- `approved` – Payment completed, enrollment created
- `rejected` – Payment failed

---

## Monitoring & Logging

### Key Logs to Monitor

```javascript
// OAuth token refresh
console.log('PhonePe OAuth token refreshed, expires at:', new Date(tokenExpiry));

// Payment status
console.log(`PhonePe Order Status: ${orderId}, State: ${state}, Amount: ${amount}`);

// Webhook events
console.log(`Webhook event: ${type}, Order: ${orderId}, State: ${state}`);

// Enrollment creation
console.log('Enrollment created for PhonePe payment:', enrollData?.id);
```

### Recommended Monitoring
- Track payment success rate (COMPLETED / Total)
- Monitor webhook delivery delays
- Alert on repeated authentication failures
- Log all FAILED payments for manual review
- Track average payment completion time

---

## API Rate Limits

**PhonePe Sandbox:**
- 100 requests/minute per merchant
- No daily limits

**PhonePe Production:**
- Contact PhonePe support for limits
- Typically 1000+ requests/minute

**Backend Protection:**
- Add rate limiting on payment endpoints
- Use express-rate-limit middleware
- Recommended: 5 requests/minute per user

---

## Future Enhancements

### Planned Features
- [ ] Refund API implementation (`/payments/v2/refund`)
- [ ] Split payments support
- [ ] Recurring payments (subscriptions)
- [ ] Payment analytics dashboard
- [ ] Email notifications on payment events
- [ ] SMS notifications via PhonePe
- [ ] Multi-currency support
- [ ] Partial payments

### Code TODOs
- Store complete PhonePe response in database for audit
- Implement retry logic for status checks
- Add payment expiry customization (per course)
- Create admin dashboard for payment monitoring
- Add coupon usage limit enforcement

---

## Support & Resources

**PhonePe Documentation:**  
https://developer.phonepe.com/v1/docs/standard-checkout

**Business Dashboard:**  
https://business.phonepe.com/

**Support Email:**  
merchant.support@phonepe.com

**MaxSec Internal:**  
Contact backend team for credential access

---

## Compliance Notes

✅ **PCI DSS Compliant:** PhonePe handles all card data, MaxSec never stores card details  
✅ **Data Protection:** Client secrets stored server-side only, never exposed to frontend  
✅ **Audit Trail:** All transactions logged with timestamps and states  
✅ **Secure Transmission:** All API calls over HTTPS (TLS 1.2+)  
✅ **Token Security:** OAuth tokens auto-expire and refresh  

---

**Last Updated:** November 17, 2025  
**Integration Version:** PhonePe Standard Checkout API v2  
**Backend Version:** MaxSec v1.0
