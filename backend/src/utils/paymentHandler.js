/**
 * paymentHandler.js
 * Centralized payment handler for donation transactions.
 * Currently returns placeholder payload for seamless Razorpay cutover later.
 */
exports.handleDonationPayment = async (donationId, amount, donorInfo = {}) => {
  /*
   * Razorpay Cutover Example:
   * const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
   * const order = await instance.orders.create({
   *   amount: amount * 100, // amount in paise
   *   currency: "INR",
   *   receipt: `receipt_don_${donationId}_${Date.now()}`
   * });
   * return { success: true, orderId: order.id, razorpayKey: process.env.RAZORPAY_KEY_ID };
   */

  return {
    integrationPending: true,
    message: 'Payment simulation active. Razorpay cutover pending.',
    donationId,
    amount,
    donorInfo,
    paymentStatus: 'success',
    txnId: `SIM_DON_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  };
};
