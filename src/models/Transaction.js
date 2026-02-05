const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  project: { type: String },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  type: { type: String, enum: ['direct_purchase', 'reseller_registration'], required: true },
  plan: { type: String }, // e.g., '9GB', '10GB', 'unlimited', 'reseller'
  email: { type: String, required: true },
  username: { type: String },
  paymentNumber: { type: String }, // QRIS content
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
