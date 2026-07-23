/**
 * paymentService.js
 * Abstraction layer for payment gateways.
 * Supports Razorpay REST API natively without external SDK dependencies.
 */
const crypto = require('crypto');

const getAuthHeader = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const authStr = `${keyId}:${keySecret}`;
  return `Basic ${Buffer.from(authStr).toString('base64')}`;
};

// ─── Razorpay Integration ─────────────────────────────────────────────────────
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing in environment variables');
  }

  const safeReceipt = (receipt || `rcpt_${Date.now()}`).slice(0, 40);

  // Use Razorpay official REST API
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt: safeReceipt,
      notes
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.description || 'Razorpay order creation failed');
  }

  return data;
};

const fetchRazorpayPaymentDetails = async (paymentId) => {
  try {
    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader()
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.description || 'Razorpay payment fetch failed');
    }
    return data;
  } catch (err) {
    console.warn('Razorpay fetch payment warning:', err.message);
    return null;
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

// ─── Stripe Integration (stub) ────────────────────────────────────────────────
const createStripePaymentIntent = async ({ amount, currency = 'inr' }) => {
  throw new Error('Stripe integration is not yet configured.');
};

// ─── Manual / Test Payment ────────────────────────────────────────────────────
const processManualPayment = async ({ amount, reference }) => {
  return {
    id: reference || `MANUAL_${Date.now()}`,
    status: 'success',
    amount
  };
};

// ─── Gateway Dispatcher ───────────────────────────────────────────────────────
const initiatePayment = async ({ gateway = 'razorpay', amount, currency, receipt, notes }) => {
  switch (gateway) {
    case 'razorpay':
      return await createRazorpayOrder({ amount, currency, receipt, notes });
    case 'stripe':
      return await createStripePaymentIntent({ amount, currency });
    case 'manual':
      return await processManualPayment({ amount });
    default:
      throw new Error(`Unsupported payment gateway: ${gateway}`);
  }
};

const verifyPayment = ({ gateway = 'razorpay', ...params }) => {
  switch (gateway) {
    case 'razorpay':
      return verifyRazorpaySignature(params);
    case 'manual':
      return true;
    default:
      throw new Error(`Unsupported payment gateway for verification: ${gateway}`);
  }
};

module.exports = { initiatePayment, verifyPayment, processManualPayment, fetchRazorpayPaymentDetails };
