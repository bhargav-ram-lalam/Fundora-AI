const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  type: {
    type: String,
    enum: [
      'new_investor_match',
      'proposal_review_complete',
      'new_scheme',
      'application_status_change',
      'ai_analysis_complete',
      'funding_readiness_complete',
      'investor_contact',
      'startup_saved',
      'investment_offer',
      'offer_response',
      'system',
    ],
    required: true,
  },

  title: { type: String, required: true },
  message: { type: String, required: true },

  // Related entities
  data: {
    startupId: mongoose.Schema.Types.ObjectId,
    applicationId: mongoose.Schema.Types.ObjectId,
    schemeId: mongoose.Schema.Types.ObjectId,
    investorId: mongoose.Schema.Types.ObjectId,
    analysisId: mongoose.Schema.Types.ObjectId,
    offerId: mongoose.Schema.Types.ObjectId,
  },

  isRead: { type: Boolean, default: false },
  readAt: Date,

  // Action link for frontend
  link: { type: String, default: '' },
}, { timestamps: true });

// Mark as read
NotificationSchema.methods.markRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

module.exports = mongoose.model('Notification', NotificationSchema);
