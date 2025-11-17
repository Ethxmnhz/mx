 // Backend/src/routes/Payment.routes.js
import express from 'express';
import { createPaymentSession, submitManualPayment, listManualPayments, approveManualPayment, listUserManualPayments, rejectManualPayment, createCheckoutSession, getCouponStats, listCouponUsages, initiatePhonePePayment, phonePeOrderStatus, phonePeCallback } from '../controllers/Payment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-session/:courseId', authenticate, createPaymentSession);
// New two-step: collect name/email/coupon then return payment session data
router.post('/checkout/:courseId', authenticate, createCheckoutSession);
// Endpoint for submitting manual payment proof
router.post('/submit/:courseId', authenticate, submitManualPayment);

// Admin endpoints
router.get('/manual-payments', authenticate, listManualPayments);
router.post('/manual-payments/:id/approve', authenticate, approveManualPayment);
router.post('/manual-payments/:id/reject', authenticate, rejectManualPayment);
router.get('/coupons/stats', authenticate, getCouponStats);
router.get('/coupons/usages', authenticate, listCouponUsages);

// User endpoints
router.get('/mine', authenticate, listUserManualPayments);

// PhonePe routes
router.post('/phonepe/initiate/:courseId', authenticate, initiatePhonePePayment);
router.get('/phonepe/status/:orderId', authenticate, phonePeOrderStatus);
router.post('/phonepe/callback', phonePeCallback); // public endpoint (ensure signature validation later)

// (Legacy verify endpoint removed)

export default router;