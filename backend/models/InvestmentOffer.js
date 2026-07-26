const mongoose = require('mongoose');

const InvestmentOfferSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  investorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },

  amount: { type: Number, required: true }, // Offered investment amount in INR
  equity: { type: Number, required: true }, // Offered equity %
  valuation: { type: Number }, // Calculated implied valuation
  message: { type: String, required: true },
  terms: { type: String, default: '' },

  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'negotiating'],
    default: 'pending',
  },
  responseMessage: { type: String, default: '' },
  respondedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('InvestmentOffer', InvestmentOfferSchema);
