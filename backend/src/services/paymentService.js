/**
 * paymentService.js
 * Abstraction layer for payment gateways.
 * Currently supports: Razorpay, Stripe (mocked), Manual.
 * To add a new gateway, implement the interface and register it below.
 */

// ─── Razorpay Integration ─────────────────────────────────────────────────────
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  // Lazily require Razorpay to avoid crash if not installed
  const Razorpay = require('razorpay');
  const instance = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  const options = {
    amount:   Math.round(amount * 100), // Razorpay expects paise
    currency,
    receipt,
    notes
  };
  return await instance.orders.create(options);
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const crypto = require('crypto');
  const body   = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

// ─── Stripe Integration (stub) ────────────────────────────────────────────────
const createStripePaymentIntent = async ({ amount, currency = 'inr' }) => {
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // return await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency });
  throw new Error('Stripe integration is not yet configured.');
};

// ─── Manual / Test Payment ────────────────────────────────────────────────────
const processManualPayment = async ({ amount, reference }) => {
  // For development / admin-granted subscriptions
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
      return true; // Always valid for manual/admin grants
    default:
      throw new Error(`Unsupported payment gateway for verification: ${gateway}`);
  }
};

module.exports = { initiatePayment, verifyPayment, processManualPayment };
