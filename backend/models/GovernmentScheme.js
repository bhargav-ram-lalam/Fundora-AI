const mongoose = require('mongoose');

const GovernmentSchemeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortName: { type: String, default: '' },
  description: { type: String, required: true },
  category: { type: String, enum: ['Central Government', 'State Government', 'AI Grant', 'MSME', 'Women Entrepreneur', 'University', 'International', 'Other'], required: true },

  // Eligibility
  eligibility: {
    stages: [String],
    industries: [String],
    countries: [{ type: String, default: 'India' }],
    minRevenue: { type: Number, default: 0 },
    maxRevenue: { type: Number },
    teamSizeMin: { type: Number, default: 1 },
    teamSizeMax: { type: Number },
    isRegistered: { type: Boolean },
    womenLed: { type: Boolean, default: false },
    specificRequirements: [String],
  },

  // Benefits
  benefits: { type: String, required: true },
  fundingAmount: { type: String, default: '' },
  fundingType: { type: String, enum: ['Grant', 'Loan', 'Equity', 'Subsidy', 'Tax Benefit', 'Mentorship', 'Mixed'], default: 'Grant' },

  // Dates
  deadline: { type: Date },
  launchDate: { type: Date },
  isOngoing: { type: Boolean, default: false },

  // Links
  officialLink: { type: String, default: '' },
  applicationLink: { type: String, default: '' },

  // Admin
  isActive: { type: Boolean, default: true },
  tags: [String],
  applicantsCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GovernmentScheme', GovernmentSchemeSchema);
