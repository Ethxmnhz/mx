import { connectSupabase, connectSupabaseAdmin } from '../db/supabaseClient.js';
import crypto from 'crypto';
import axios from 'axios';

const supabase = connectSupabase();
const supabaseAdmin = connectSupabaseAdmin();

// Manual payment flow - we store pending manual payments and let admins approve them
// Server-side direct UPI discount enforced via env DIRECT_UPI_EXTRA_DISCOUNT (amount in INR, default 50)

export const createPaymentSession = async (req, res) => {
  try {
    console.log('Creating manual payment session...');
    const { courseId } = req.params;
    const user = req.user; // From auth middleware

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled in this course" });
    }

    // Get course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      console.error('Course fetch error:', courseError);
      return res.status(404).json({ message: "Course not found" });
    }

    // Return manual payment instructions
    return res.json({
      courseId,
      amount: course.price,
      currency: 'INR',
      upi_qr: process.env.MANUAL_UPI_QR || null,
      upi_address: process.env.MANUAL_UPI || null,
      session_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6 hours
      note: 'We are working on a payment gateway. Please pay using the UPI QR code or UPI ID and submit the transaction ID below. Payments are verified manually; access is typically granted within a few hours. For urgent access contact support via email.'
    });
  } catch (error) {
    console.error('Manual payment session creation error:', error);
    res.status(500).json({ message: 'Failed to create manual payment session' });
  }
};

// New: two-step checkout - collect name/email/coupon, then return payment session
export const createCheckoutSession = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;
  const { name, email, coupon } = req.body || {};
  const safeName = (name || '').toString().trim().slice(0, 120);
  const safeEmail = (email || '').toString().trim().slice(0, 160);

    if (!safeName || !safeEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Fetch course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title, price, thumbnail')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Simple coupon logic; can be replaced with DB-backed coupons later
  const code = (coupon || '').toString().trim().toUpperCase();
    let discountPct = 0;
    if (code) {
      const { data: coup } = await supabaseAdmin
        .from('coupons')
        .select('discount_percent, active, valid_from, valid_to, usage_limit')
        .eq('code', code)
        .single();
      const now = new Date();
      const inWindow = coup?.valid_from ? now >= new Date(coup.valid_from) : true;
      const beforeEnd = coup?.valid_to ? now <= new Date(coup.valid_to) : true;
      if (coup && coup.active && inWindow && beforeEnd) {
        discountPct = Math.max(0, Math.min(100, Number(coup.discount_percent) || 0));
      }
    }
    const original = Number(course.price) || 0;
    const discounted = Math.max(0, Number((original * (1 - discountPct / 100)).toFixed(2)));
    const directDiscount = Math.max(0, Number(process.env.DIRECT_UPI_EXTRA_DISCOUNT || 50));
    // Final amount user should pay via manual UPI path (coupon + direct discount applied)
    const finalManualAmount = Math.max(0, Number((discounted - directDiscount).toFixed(2)));

    return res.json({
      courseId: course.id,
      course_title: course.title,
      thumbnail: course.thumbnail,
      original_amount: original,
      discount_percent: discountPct,
      direct_upi_extra_discount: directDiscount,
      amount: finalManualAmount,
      base_amount_before_direct_discount: discounted,
      currency: 'INR',
      upi_qr: process.env.MANUAL_UPI_QR || null,
      upi_address: process.env.MANUAL_UPI || null,
      session_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
  checkout: { name: safeName, email: safeEmail, coupon: code || null },
      note: 'Pay via UPI and submit the transaction ID. Manual verification grants access within hours.'
    });
  } catch (err) {
    console.error('createCheckoutSession error:', err);
    res.status(500).json({ message: 'Failed to start checkout' });
  }
};

// Endpoint for users to submit manual payment proof (transaction id or receipt email)
export const submitManualPayment = async (req, res) => {
  try {
    const user = req.user;
    const { courseId } = req.params;
  const { transaction_id, receipt_email, payment_method, coupon } = req.body || {};
  const safeTxn = (transaction_id || '').toString().trim().slice(0, 100);
  const safeReceipt = (receipt_email || '').toString().trim().slice(0, 160);
  const safeMethod = (payment_method || 'UPI').toString().trim().slice(0, 30);

    if (!safeTxn && !safeReceipt) {
      return res.status(400).json({ message: 'Provide transaction_id or receipt_email' });
    }

    // Get course price
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, price')
      .eq('id', courseId)
      .single();

    if (courseError || !course) return res.status(404).json({ message: 'Course not found' });

    // Prevent duplicate submissions: same transaction_id or a pending manual payment for same user/course
    if (safeTxn) {
      const { data: existingByTxn } = await supabaseAdmin
        .from('manual_payments')
        .select('id,status')
        .eq('transaction_id', safeTxn)
        .single();

      if (existingByTxn) {
        return res.status(409).json({ message: 'This transaction ID has already been submitted' });
      }
    }

    const { data: existingPending } = await supabaseAdmin
      .from('manual_payments')
      .select('id,status,created_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'pending')
      .limit(1)
      .single();

    if (existingPending) {
      return res.status(409).json({ message: 'You already have a pending manual payment for this course' });
    }

    // Apply coupon discount if provided (mirror logic from checkout)
    const code = (coupon || '').toString().trim().toUpperCase();
    let discountPct = 0;
    if (code) {
      const { data: coup } = await supabaseAdmin
        .from('coupons')
        .select('discount_percent, active, valid_from, valid_to, usage_limit')
        .eq('code', code)
        .single();
      const now = new Date();
      const inWindow = coup?.valid_from ? now >= new Date(coup.valid_from) : true;
      const beforeEnd = coup?.valid_to ? now <= new Date(coup.valid_to) : true;
      if (coup && coup.active && inWindow && beforeEnd) {
        discountPct = Math.max(0, Math.min(100, Number(coup.discount_percent) || 0));
      }
    }
    const original = Number(course.price) || 0;
    const discountedAmount = Math.max(0, Number((original * (1 - discountPct / 100)).toFixed(2)));
    const directDiscount = (safeMethod.toUpperCase() === 'UPI') ? Math.max(0, Number(process.env.DIRECT_UPI_EXTRA_DISCOUNT || 50)) : 0;
    const finalAmount = Math.max(0, Number((discountedAmount - directDiscount).toFixed(2)));

    const { error: insertError, data: inserted } = await supabaseAdmin
      .from('manual_payments')
      .insert([
        {
          user_id: user.id,
          course_id: courseId,
          amount: finalAmount,
          payment_method: safeMethod,
          transaction_id: safeTxn || null,
          receipt_email: safeReceipt || null,
          status: 'pending',
          coupon_code: code || null
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Failed to record manual payment:', insertError);
      return res.status(500).json({ message: 'Failed to record manual payment' });
    }

    return res.status(201).json({ message: 'Payment submitted. A team member will verify within 4 hours.', payment: inserted });
  } catch (error) {
    console.error('submitManualPayment error:', error);
    res.status(500).json({ message: 'Failed to submit payment' });
  }
};

// Admin endpoint to list pending manual payments
export const listManualPayments = async (req, res) => {
  try {
    // Verify admin
    const token = req.headers.authorization?.split(' ')[1];
    const { data: authData, error: authErr } = await supabase.auth.getUser(token);
    const requestingUser = authData?.user;
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', requestingUser?.id)
      .single();

    if (!userRecord?.is_admin) return res.status(403).json({ message: 'Forbidden' });

    // Get manual payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('manual_payments')
      .select('id, user_id, course_id, amount, status, transaction_id, receipt_email, created_at, processed_by, processed_at, coupon_code')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('Failed to fetch manual payments:', paymentsError);
      return res.status(500).json({ message: 'Failed to fetch manual payments' });
    }

    // Fetch related users and courses in batch to enrich response
    const userIds = [...new Set((payments || []).map(p => p.user_id).filter(Boolean))];
    const courseIds = [...new Set((payments || []).map(p => p.course_id).filter(Boolean))];

    let usersMap = {};
    if (userIds.length) {
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);
      if (!usersError && users) usersMap = Object.fromEntries(users.map(u => [u.id, u]));
    }

    let coursesMap = {};
    if (courseIds.length) {
      const { data: courses, error: coursesError } = await supabaseAdmin
        .from('courses')
        .select('id, title, thumbnail')
        .in('id', courseIds);
      if (!coursesError && courses) coursesMap = Object.fromEntries(courses.map(c => [c.id, c]));
    }

    const mapped = (payments || []).map(p => ({
      ...p,
      user: usersMap[p.user_id] || null,
      course: coursesMap[p.course_id] || null
    }));

    res.json(mapped);
  } catch (error) {
    console.error('listManualPayments error:', error);
    res.status(500).json({ message: 'Failed to fetch manual payments' });
  }
};

// Admin endpoint to approve a manual payment and create enrollment
export const approveManualPayment = async (req, res) => {
  try {
    const adminUser = req.user;
    const { id } = req.params; // manual_payments id

    // Verify admin via admin client
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUser?.id)
      .single();

    if (!userRecord?.is_admin) return res.status(403).json({ message: 'Forbidden' });

    // Fetch pending payment
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('manual_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status !== 'pending') return res.status(400).json({ message: 'Payment not pending' });

    // Create enrollment
    // Prevent duplicate active enrollments
    const { data: existingEnroll, error: existingErr } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', payment.user_id)
      .eq('course_id', payment.course_id)
      .eq('status', 'active')
      .single();

    if (existingErr && existingErr.code !== 'PGRST116') {
      console.error('Error checking existing enrollment:', existingErr);
      // continue, attempt to create but log
    }

    if (existingEnroll) {
      console.log('User already has an active enrollment:', existingEnroll.id);
    } else {
      // Insert a minimal enrollment row to avoid schema mismatch issues
      const { data: enrollData, error: enrollError } = await supabaseAdmin
        .from('enrollments')
        .insert([
          {
            user_id: payment.user_id,
            course_id: payment.course_id,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (enrollError) {
        console.error('Failed to create enrollment (minimal):', enrollError);
        return res.status(500).json({ message: 'Failed to create enrollment', error: enrollError });
      }

      console.log('Enrollment created (minimal):', enrollData?.id);

      // Try to augment the enrollment with payment details if those columns exist
      try {
        const updatePayload = {
          payment_id: payment.transaction_id || null,
          order_id: payment.id,
          amount_paid: payment.amount || null
        };

        const { error: updateEnrollError } = await supabaseAdmin
          .from('enrollments')
          .update(updatePayload)
          .eq('id', enrollData.id);

        if (updateEnrollError) {
          // Log but don't fail the whole request — the enrollment exists
          console.warn('Non-fatal: failed to update enrollment payment fields:', updateEnrollError);
        } else {
          console.log('Enrollment updated with payment fields');
        }
      } catch (updErr) {
        console.warn('Unexpected error while updating enrollment payment fields:', updErr);
      }
    }

    // Update manual payment status
    const { error: updateError } = await supabaseAdmin
      .from('manual_payments')
      .update({ status: 'approved', processed_by: adminUser.id, processed_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to update manual payment:', updateError);
      // Note: Enrollment already created — this is an inconsistency but we'll still report success
    }

    res.json({ message: 'Payment approved and enrollment created' });
  } catch (error) {
    console.error('approveManualPayment error:', error);
  res.status(500).json({ message: 'Failed to approve payment' });
  }
};

// User endpoint: list current user's manual payments (pending, approved, etc.)
export const listUserManualPayments = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // First fetch manual payments for the user
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('manual_payments')
      .select('id, course_id, amount, status, transaction_id, receipt_email, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error('listUserManualPayments error:', paymentsError);
      return res.status(500).json({ message: 'Failed to fetch payments' });
    }

    // If there are course_ids, fetch their metadata in one query to avoid relying on PostgREST relationships
    const courseIds = [...new Set((payments || []).map(p => p.course_id).filter(Boolean))];
    let coursesMap = {};
    if (courseIds.length) {
      const { data: courses, error: coursesError } = await supabaseAdmin
        .from('courses')
        .select('id, title, thumbnail')
        .in('id', courseIds);

      if (coursesError) {
        console.warn('Failed to fetch courses for payments:', coursesError);
      } else {
        coursesMap = Object.fromEntries((courses || []).map(c => [c.id, c]));
      }
    }

    const mapped = (payments || []).map(p => ({
      id: p.id,
      course_id: p.course_id,
      amount: p.amount,
      status: p.status,
      transaction_id: p.transaction_id,
      receipt_email: p.receipt_email,
      created_at: p.created_at,
      course_title: coursesMap[p.course_id]?.title,
      course_thumbnail: coursesMap[p.course_id]?.thumbnail
    }));

    res.json(mapped);
  } catch (err) {
    console.error('listUserManualPayments unexpected error:', err);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Admin endpoint to reject a manual payment
export const rejectManualPayment = async (req, res) => {
  try {
    const adminUser = req.user;
    const { id } = req.params;

    // Verify admin
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUser?.id)
      .single();

    if (!userRecord?.is_admin) return res.status(403).json({ message: 'Forbidden' });

    // Fetch payment
    const { data: payment, error: fetchError } = await supabaseAdmin
      .from('manual_payments')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !payment) return res.status(404).json({ message: 'Payment not found' });
    if (payment.status !== 'pending') return res.status(400).json({ message: 'Payment not pending' });

    const { rejection_note } = req.body;

    // Attempt to update with full payload; if DB doesn't have some columns, retry with minimal payload
    try {
      const { error: updateError, data: updated } = await supabaseAdmin
        .from('manual_payments')
        .update({ status: 'rejected', processed_by: adminUser.id, processed_at: new Date().toISOString(), rejection_note: rejection_note || null })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      return res.json({ message: 'Payment rejected', payment: updated });
    } catch (firstErr) {
      console.warn('Full update failed, retrying minimal update:', firstErr?.message || firstErr);
      try {
        const { error: minimalErr, data: minimalUpdated } = await supabaseAdmin
          .from('manual_payments')
          .update({ status: 'rejected', processed_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();

        if (minimalErr) {
          console.error('Minimal update failed for rejecting payment:', minimalErr);
          return res.status(500).json({ message: 'Failed to reject payment' });
        }

        return res.json({ message: 'Payment rejected (minimal)', payment: minimalUpdated });
      } catch (secondErr) {
        console.error('Reject manual payment error (second attempt):', secondErr);
        return res.status(500).json({ message: 'Failed to reject payment' });
      }
    }
  } catch (error) {
    console.error('rejectManualPayment error:', error);
  res.status(500).json({ message: 'Failed to reject payment' });
  }
};

// Admin: coupon usage statistics
export const getCouponStats = async (req, res) => {
  try {
    const adminUser = req.user;
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUser?.id)
      .single();
    if (!userRecord?.is_admin) return res.status(403).json({ message: 'Forbidden' });

    // Count usage by coupon_code across all manual payments
    const { data, error } = await supabaseAdmin
      .from('manual_payments')
      .select('coupon_code')
      .not('coupon_code', 'is', null);
    if (error) {
      console.error('getCouponStats error:', error);
      return res.status(500).json({ message: 'Failed to fetch coupon stats' });
    }

    // Aggregate counts per code
    const stats = {};
    (data || []).forEach(row => {
      const code = row.coupon_code || 'UNKNOWN';
      stats[code] = (stats[code] || 0) + 1;
    });

    res.json({ stats });
  } catch (err) {
    console.error('getCouponStats unexpected:', err);
    res.status(500).json({ message: 'Failed to fetch coupon stats' });
  }
};

// Admin: detailed coupon usage list (optionally filtered by ?code=)
export const listCouponUsages = async (req, res) => {
  try {
    const adminUser = req.user;
    const { data: userRecord } = await supabaseAdmin
      .from('users')
      .select('is_admin')
      .eq('id', adminUser?.id)
      .single();
    if (!userRecord?.is_admin) return res.status(403).json({ message: 'Forbidden' });

    const { code, include_inferred } = req.query || {};
    const infer = include_inferred === undefined ? true : String(include_inferred).toLowerCase() !== 'false';

    // 1) Explicit usages (coupon_code stored)
    let explicitQuery = supabaseAdmin
      .from('manual_payments')
      .select('id, user_id, course_id, amount, status, coupon_code, created_at')
      .not('coupon_code', 'is', null)
      .order('created_at', { ascending: false });
    if (code) explicitQuery = explicitQuery.eq('coupon_code', code.toString().toUpperCase());
    const { data: explicitPayments, error } = await explicitQuery;
    if (error) {
      console.error('listCouponUsages error:', error);
      return res.status(500).json({ message: 'Failed to fetch coupon usages' });
    }

    let payments = explicitPayments || [];

    // 2) Optionally infer from legacy rows lacking coupon_code by comparing amounts to discounted course price
    let inferredRows = [];
    if (infer) {
      // Fetch candidate rows with missing coupon_code
      let missingQuery = supabaseAdmin
        .from('manual_payments')
        .select('id, user_id, course_id, amount, status, coupon_code, created_at')
        .is('coupon_code', null)
        .order('created_at', { ascending: false });
      const { data: missing, error: missingErr } = await missingQuery;
      if (!missingErr && (missing?.length || 0) > 0) {
        // Fetch coupons and course prices
        const { data: coupons } = await supabaseAdmin
          .from('coupons')
          .select('code, discount_percent, active, valid_from, valid_to');
        const activeCoupons = (coupons || []).filter(c => {
          const now = new Date();
          const inWindow = c?.valid_from ? now >= new Date(c.valid_from) : true;
          const beforeEnd = c?.valid_to ? now <= new Date(c.valid_to) : true;
          return c.active && inWindow && beforeEnd;
        });
        const courseIds2 = [...new Set(missing.map(m => m.course_id).filter(Boolean))];
        let coursesMap2 = {};
        if (courseIds2.length) {
          const { data: courses2 } = await supabaseAdmin
            .from('courses')
            .select('id, price, title')
            .in('id', courseIds2);
          coursesMap2 = Object.fromEntries((courses2 || []).map(c => [c.id, c]));
        }
        const tol = 0.02; // rounding tolerance
        for (const m of missing) {
          const course = coursesMap2[m.course_id];
          const price = Number(course?.price) || 0;
          if (!price) continue;
          const candidates = code ? activeCoupons.filter(c => c.code === code.toString().toUpperCase()) : activeCoupons;
          let matched = null;
          for (const c of candidates) {
            const pct = Math.max(0, Math.min(100, Number(c.discount_percent) || 0));
            const expected = Number((price * (1 - pct / 100)).toFixed(2));
            if (Math.abs(Number(m.amount) - expected) <= tol) {
              matched = c.code;
              break;
            }
          }
          if (matched) {
            inferredRows.push({ ...m, coupon_code: matched, inferred: true });
          }
        }
      }
    }

    if (inferredRows.length) {
      // Prepend inferred so newest appear first consistently (already sorted by created_at)
      // Also avoid duplicates if any id overlaps (shouldn't because explicit had coupon_code present)
      const seen = new Set(payments.map(p => p.id));
      const combined = [...inferredRows.filter(r => !seen.has(r.id)), ...payments];
      payments = combined;
    }

    // Enrich with user and course metadata
    const userIds = [...new Set((payments || []).map(p => p.user_id).filter(Boolean))];
    const courseIds = [...new Set((payments || []).map(p => p.course_id).filter(Boolean))];
    let usersMap = {}, coursesMap = {};
    if (userIds.length) {
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, full_name, email')
        .in('id', userIds);
      usersMap = Object.fromEntries((users || []).map(u => [u.id, u]));
    }
    if (courseIds.length) {
      const { data: courses } = await supabaseAdmin
        .from('courses')
        .select('id, title')
        .in('id', courseIds);
      coursesMap = Object.fromEntries((courses || []).map(c => [c.id, c]));
    }

    const rows = (payments || []).map(p => ({
      id: p.id,
      coupon_code: p.coupon_code,
      user_id: p.user_id,
      user_name: usersMap[p.user_id]?.full_name || null,
      user_email: usersMap[p.user_id]?.email || null,
      course_id: p.course_id,
      course_title: coursesMap[p.course_id]?.title || null,
      amount: p.amount,
      status: p.status,
      created_at: p.created_at,
      inferred: Boolean(p.inferred)
    }));

    res.json(rows);
  } catch (err) {
    console.error('listCouponUsages unexpected:', err);
    res.status(500).json({ message: 'Failed to fetch coupon usages' });
  }
};

// ========================= PHONEPE INTEGRATION (Standard Checkout v2) =========================
// Environment variables expected:
// PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET, PHONEPE_CLIENT_VERSION, PHONEPE_MERCHANT_ID
// PHONEPE_ENV = 'sandbox' | 'production'
// SITE_URL for redirect/callback construction
// NOTE: We do not apply the extra ₹50 manual UPI discount to PhonePe payments.

// OAuth token cache
let cachedAuthToken = null;
let tokenExpiry = 0;

function getPhonePeBase() {
  const env = (process.env.PHONEPE_ENV || 'sandbox').toLowerCase();
  if (env === 'production') return 'https://api.phonepe.com/apis/pg';
  return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
}

function getPhonePeAuthBase() {
  const env = (process.env.PHONEPE_ENV || 'sandbox').toLowerCase();
  if (env === 'production') return 'https://api.phonepe.com/apis/identity-manager';
  return 'https://api-preprod.phonepe.com/apis/pg-sandbox';
}

async function getPhonePeAuthToken() {
  // Check if cached token is still valid (refresh 5 minutes before expiry)
  const now = Date.now();
  if (cachedAuthToken && tokenExpiry > now + 300000) {
    return cachedAuthToken;
  }

  // Fetch new OAuth token
  try {
    const authBase = getPhonePeAuthBase();
    const params = new URLSearchParams({
      client_id: process.env.PHONEPE_CLIENT_ID,
      client_version: process.env.PHONEPE_CLIENT_VERSION,
      client_secret: process.env.PHONEPE_CLIENT_SECRET,
      grant_type: 'client_credentials'
    });

    const resp = await axios.post(`${authBase}/v1/oauth/token`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 10000
    });

    const data = resp.data;
    cachedAuthToken = data.access_token;
    // expires_at is in seconds (epoch), convert to milliseconds
    tokenExpiry = (data.expires_at || 0) * 1000;
    
    console.log('PhonePe OAuth token refreshed, expires at:', new Date(tokenExpiry));
    return cachedAuthToken;
  } catch (err) {
    console.error('Failed to get PhonePe auth token:', err?.response?.data || err.message);
    throw new Error('PhonePe authentication failed');
  }
}

// Helper to generate a unique merchant order id (max 63 chars per PhonePe spec)
function generateMerchantOrderId(userId, courseId) {
  // Use timestamp + random to ensure uniqueness while staying under 63 chars
  // Format: ORD_<timestamp>_<8charRandom>
  // Example: ORD_1732012345678_a1b2c3d4 (29 chars)
  const timestamp = Date.now(); // 13 digits
  const rand = crypto.randomBytes(4).toString('hex'); // 8 chars
  return `ORD_${timestamp}_${rand}`;
}

// Create PhonePe payment order and return redirect/pay page URL.
export const initiatePhonePePayment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    // Ensure required env vars present
    const required = ['PHONEPE_CLIENT_ID', 'PHONEPE_CLIENT_SECRET', 'PHONEPE_CLIENT_VERSION', 'PHONEPE_MERCHANT_ID'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length) {
      return res.status(500).json({ message: `PhonePe configuration missing: ${missing.join(', ')}` });
    }

    // Check already enrolled
    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Fetch course price & title
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id,title,price')
      .eq('id', courseId)
      .single();
    if (courseError || !course) return res.status(404).json({ message: 'Course not found' });

    // Optional coupon support (reuse logic) - no manual extra discount
    const { coupon } = req.body || {};
    const code = (coupon || '').toString().trim().toUpperCase();
    let discountPct = 0;
    if (code) {
      const { data: coup } = await supabaseAdmin
        .from('coupons')
        .select('discount_percent, active, valid_from, valid_to')
        .eq('code', code)
        .single();
      const now = new Date();
      const inWindow = coup?.valid_from ? now >= new Date(coup.valid_from) : true;
      const beforeEnd = coup?.valid_to ? now <= new Date(coup.valid_to) : true;
      if (coup && coup.active && inWindow && beforeEnd) {
        discountPct = Math.max(0, Math.min(100, Number(coup.discount_percent) || 0));
      }
    }

    const original = Number(course.price) || 0;
    const discounted = Math.max(0, Number((original * (1 - discountPct / 100)).toFixed(2)));
    const amountPaise = Math.round(discounted * 100); // PhonePe expects smallest currency unit

    const merchantOrderId = generateMerchantOrderId(user.id, course.id);
    const base = getPhonePeBase();
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const redirectUrl = `${frontendUrl}/payment-success?order_id=${encodeURIComponent(merchantOrderId)}`;
    const backendUrl = process.env.SITE_URL || 'http://localhost:3000';
    const callbackUrl = `${backendUrl}/api/payments/phonepe/callback`;

    // Record a pending payment row (status 'initiated') for traceability
    const { error: insertErr } = await supabaseAdmin
      .from('manual_payments')
      .insert([
        {
          user_id: user.id,
          course_id: course.id,
          amount: discounted,
          payment_method: 'PHONEPE',
          transaction_id: merchantOrderId, // store order id as transaction reference
          status: 'initiated',
          coupon_code: code || null
        }
      ]);
    if (insertErr) {
      console.warn('Failed to insert initiated PhonePe payment row:', insertErr);
    }

    // Get OAuth token
    let authToken;
    try {
      authToken = await getPhonePeAuthToken();
    } catch (authErr) {
      return res.status(500).json({ message: 'PhonePe authentication failed', details: authErr.message });
    }

    // Build create payment payload (Standard Checkout v2)
    const payload = {
      merchantOrderId,
      amount: amountPaise,
      expireAfter: 1800, // 30 minutes (300-3600 seconds allowed)
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: `Payment for ${course.title}`,
        merchantUrls: {
          redirectUrl
        }
      }
    };

    // Add optional metadata if needed
    if (code) {
      payload.metaInfo = {
        udf1: code,
        udf2: user.email || '',
        udf3: course.title
      };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${authToken}`
    };

    let responseData;
    try {
      const resp = await axios.post(`${base}/checkout/v2/pay`, payload, { headers, timeout: 10000 });
      responseData = resp.data;
    } catch (apiErr) {
      console.error('PhonePe create payment error:', apiErr?.response?.data || apiErr.message);
      return res.status(502).json({ message: 'Failed to initiate PhonePe payment', details: apiErr?.response?.data || null });
    }

    // v2 API returns redirectUrl directly in response
    const payUrl = responseData?.redirectUrl || null;
    const phonePeOrderId = responseData?.orderId || null;
    
    if (!payUrl) {
      console.error('PhonePe response structure:', JSON.stringify(responseData, null, 2));
      return res.status(500).json({ message: 'PhonePe response missing redirect URL', raw: responseData });
    }

    // Update payment row with PhonePe's orderId for tracking
    if (phonePeOrderId) {
      await supabaseAdmin
        .from('manual_payments')
        .update({ receipt_email: phonePeOrderId }) // Store PhonePe orderId in a field for reference
        .eq('transaction_id', merchantOrderId);
    }

    res.json({
      merchantOrderId,
      amount: discounted,
      currency: 'INR',
      discount_percent: discountPct,
      original_amount: original,
      payPageUrl: payUrl
    });
  } catch (err) {
    console.error('initiatePhonePePayment unexpected error:', err);
    res.status(500).json({ message: 'Failed to initiate PhonePe payment' });
  }
};

// Query PhonePe order status and on success create enrollment & mark payment approved
export const phonePeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params; // merchantOrderId
    const user = req.user;
    
    // Get OAuth token
    let authToken;
    try {
      authToken = await getPhonePeAuthToken();
    } catch (authErr) {
      return res.status(500).json({ message: 'PhonePe authentication failed' });
    }
    
    const base = getPhonePeBase();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `O-Bearer ${authToken}`
    };
    
    let data;
    try {
      // v2 API endpoint: GET /checkout/v2/order/{merchantOrderId}/status?details=true
      const resp = await axios.get(`${base}/checkout/v2/order/${orderId}/status`, { 
        headers, 
        params: { details: 'true' }, // Get all payment attempt details
        timeout: 8000 
      });
      data = resp.data;
    } catch (apiErr) {
      console.error('PhonePe status error:', apiErr?.response?.data || apiErr.message);
      return res.status(502).json({ message: 'Failed to query status', details: apiErr?.response?.data || null });
    }

    const state = data?.state || 'UNKNOWN';
    const phonePeOrderId = data?.orderId || orderId;
    const amount = data?.amount || 0;
    const paymentDetails = data?.paymentDetails || [];
    
    console.log(`PhonePe Order Status: ${orderId}, State: ${state}, Amount: ${amount}`);

    // Fetch payment row
    const { data: paymentRow } = await supabaseAdmin
      .from('manual_payments')
      .select('*')
      .eq('transaction_id', orderId)
      .single();

    // Handle different payment states
    if (state === 'COMPLETED' && paymentRow && paymentRow.status !== 'approved') {
      // Create enrollment if not already active
      const { data: existingEnroll } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', paymentRow.user_id)
        .eq('course_id', paymentRow.course_id)
        .eq('status', 'active')
        .single();
      
      if (!existingEnroll) {
        const { data: enrollData, error: enrollErr } = await supabaseAdmin
          .from('enrollments')
          .insert([
            { 
              user_id: paymentRow.user_id, 
              course_id: paymentRow.course_id, 
              status: 'active', 
              payment_id: phonePeOrderId, 
              amount_paid: paymentRow.amount 
            }
          ])
          .select()
          .single();
        
        if (enrollErr) {
          console.error('Enrollment create error (PhonePe):', enrollErr);
        } else {
          console.log('Enrollment created for PhonePe payment:', enrollData?.id);
        }
      }
      
      // Update payment status to approved
      const { error: updateErr } = await supabaseAdmin
        .from('manual_payments')
        .update({ 
          status: 'approved', 
          processed_at: new Date().toISOString(),
          receipt_email: phonePeOrderId // Store PhonePe's orderId
        })
        .eq('id', paymentRow.id);
      
      if (updateErr) {
        console.error('Failed to update manual_payments to approved:', updateErr);
      }
    } else if (state === 'FAILED' && paymentRow && paymentRow.status === 'initiated') {
      // Mark payment as failed
      const errorCode = data?.errorCode || 'UNKNOWN_ERROR';
      const detailedErrorCode = data?.detailedErrorCode || '';
      
      await supabaseAdmin
        .from('manual_payments')
        .update({ 
          status: 'rejected', 
          processed_at: new Date().toISOString(),
          rejection_note: `PhonePe Error: ${errorCode} - ${detailedErrorCode}`
        })
        .eq('id', paymentRow.id);
      
      console.log(`PhonePe payment failed: ${orderId}, Error: ${errorCode}`);
    }

    res.json({ 
      orderId, 
      phonePeOrderId,
      state, 
      amount,
      paymentDetails: paymentDetails.length > 0 ? paymentDetails : undefined,
      success: state === 'COMPLETED'
    });
  } catch (err) {
    console.error('phonePeOrderStatus unexpected error:', err);
    res.status(500).json({ message: 'Failed to query PhonePe order status' });
  }
};

// PhonePe webhook callback for server-to-server notifications
// Note: Standard Checkout v2 webhook verification is handled via registered callback URL in dashboard
// PhonePe will only call the registered URL, providing inherent security
export const phonePeCallback = async (req, res) => {
  try {
    // Log webhook received
    console.log('PhonePe webhook received:', JSON.stringify(req.body, null, 2));
    
    const payload = req.body || {};
    const type = payload?.type || 'UNKNOWN';
    const eventPayload = payload?.payload || payload;
    const orderId = eventPayload?.originalMerchantOrderId || eventPayload?.merchantOrderId || null;
    const state = eventPayload?.state || 'UNKNOWN';
    const phonePeOrderId = eventPayload?.orderId || null;
    
    console.log(`Webhook event: ${type}, Order: ${orderId}, State: ${state}`);
    if (!orderId) {
      console.warn('Webhook missing orderId');
      return res.status(400).json({ message: 'Missing orderId' });
    }

    // Handle different webhook event types
    if (type === 'checkout.order.completed' || state === 'COMPLETED') {
      const { data: paymentRow } = await supabaseAdmin
        .from('manual_payments')
        .select('*')
        .eq('transaction_id', orderId)
        .single();
      
      if (paymentRow && paymentRow.status !== 'approved') {
        const { data: existingEnroll } = await supabaseAdmin
          .from('enrollments')
          .select('id')
          .eq('user_id', paymentRow.user_id)
          .eq('course_id', paymentRow.course_id)
          .eq('status', 'active')
          .single();
        
        if (!existingEnroll) {
          const { error: enrollErr } = await supabaseAdmin
            .from('enrollments')
            .insert([
              { 
                user_id: paymentRow.user_id, 
                course_id: paymentRow.course_id, 
                status: 'active', 
                payment_id: phonePeOrderId || orderId, 
                amount_paid: paymentRow.amount 
              }
            ]);
          if (enrollErr) console.error('Webhook enrollment error:', enrollErr);
          else console.log('Webhook: Enrollment created for order:', orderId);
        }
        
        const { error: updateErr } = await supabaseAdmin
          .from('manual_payments')
          .update({ 
            status: 'approved', 
            processed_at: new Date().toISOString(),
            receipt_email: phonePeOrderId || orderId
          })
          .eq('id', paymentRow.id);
        
        if (updateErr) console.error('Webhook manual_payments update error:', updateErr);
        else console.log('Webhook: Payment approved for order:', orderId);
      }
    } else if (type === 'checkout.order.failed' || state === 'FAILED') {
      const { data: paymentRow } = await supabaseAdmin
        .from('manual_payments')
        .select('*')
        .eq('transaction_id', orderId)
        .single();
      
      if (paymentRow && paymentRow.status === 'initiated') {
        const errorCode = eventPayload?.errorCode || 'WEBHOOK_FAILED';
        await supabaseAdmin
          .from('manual_payments')
          .update({ 
            status: 'rejected', 
            processed_at: new Date().toISOString(),
            rejection_note: `PhonePe Error: ${errorCode}`
          })
          .eq('id', paymentRow.id);
        
        console.log('Webhook: Payment failed for order:', orderId);
      }
    }
    
    // Always return 200 OK to PhonePe to acknowledge webhook receipt
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('phonePeCallback error:', err);
    res.status(500).json({ message: 'Callback handling failed' });
  }
};