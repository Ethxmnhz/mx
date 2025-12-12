// Frontend/src/pages/PaymentSuccess.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [status, setStatus] = useState('CHECKING');
  const [attempts, setAttempts] = useState(0);
  const [lastResponse, setLastResponse] = useState(null);

  const API_BASE = (import.meta?.env?.VITE_API_URL || window?.VITE_API_URL || '').replace(/\/$/, '');
  const orderId = searchParams.get('order_id');

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      setStatus('NO_ORDER');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/api/payments/phonepe/status/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      setLastResponse(data);
      
      // Backend returns: { orderId, phonePeOrderId, state, amount, paymentDetails, success }
      const state = data?.state || 'UNKNOWN';
      const success = data?.success || false;
      
      console.log('Payment status check:', { orderId, state, success, data });

      if (state === 'COMPLETED' || success) {
        setStatus('SUCCESS');
        toast.success('Payment confirmed! Activating access...');
        setTimeout(() => {
          navigate('/my-learning');
        }, 1500);
      } else if (state === 'FAILED') {
        setStatus('FAILED');
        toast.error('Payment failed or cancelled.');
      } else {
        setStatus('PENDING');
      }
    } catch (e) {
      console.error('Status check error:', e);
      setStatus('ERROR');
    } finally {
      setAttempts(a => a + 1);
    }
  }, [orderId, API_BASE, navigate]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (status === 'PENDING' && attempts < 20) { // poll up to ~60s (3s * 20)
      const id = setTimeout(fetchStatus, 3000);
      return () => clearTimeout(id);
    }
  }, [status, attempts, fetchStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6 rounded-xl bg-white/5 border border-white/10">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">
          {status === 'SUCCESS' ? 'Payment Confirmed' : status === 'FAILED' ? 'Payment Failed' : 'Verifying Payment'}
        </h1>
        {status === 'PENDING' && <p className="text-sm text-slate-400">Checking PhonePe order status… (attempt {attempts})</p>}
        {status === 'SUCCESS' && <p className="text-sm text-emerald-300">Access will activate shortly. Redirecting…</p>}
        {status === 'FAILED' && <p className="text-sm text-red-400">The payment could not be completed. Please retry from checkout.</p>}
        {status === 'NO_ORDER' && <p className="text-sm text-slate-400">Missing order reference. Return to checkout.</p>}
        {status === 'ERROR' && <p className="text-sm text-yellow-400">Network error while verifying. You can retry.</p>}
        {(status === 'PENDING' || status === 'ERROR') && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={fetchStatus} className="px-4 py-2 rounded-md bg-emerald-500/15 text-emerald-200 border border-emerald-400/30 text-sm hover:bg-emerald-500/25">Retry</button>
            <button onClick={() => navigate('/my-learning')} className="px-4 py-2 rounded-md bg-white/5 border border-white/10 text-slate-200 text-sm">Go to My Learning</button>
          </div>
        )}
        {lastResponse && status !== 'SUCCESS' && (
          <pre className="mt-6 text-left text-[10px] max-h-48 overflow-auto p-2 rounded bg-black/40 border border-white/10 text-slate-400">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        )}
        {status === 'SUCCESS' && courseId && (
          <div className="mt-4 text-xs text-slate-400">Course ID: {courseId}</div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;