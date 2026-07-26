const mongoose = require('mongoose');

const InvestorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

  // Profile
  firmName: { type: String, default: '' },
  investorType: { type: String, enum: ['Angel Investor', 'Venture Capital', 'Private Equity', 'Corporate VC', 'Government Fund', 'Family Office', 'Accelerator'], default: 'Angel Investor' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },

  // Investment Preferences
  preferredIndustries: [{ type: String }],
  preferredStages: [{ type: String, enum: ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth'] }],
  preferredTechnologies: [String],
  preferredCountries: [{ type: String, default: 'India' }],

  // Financial
  minInvestment: { type: Number, default: 100000 },
  maxInvestment: { type: Number, default: 10000000 },
  currency: { type: String, default: 'INR' },
  portfolioSize: { type: Number, default: 0 },
  totalDeployed: { type: Number, default: 0 },

  // Track record
  successfulExits: { type: Number, default: 0 },
  activeInvestments: { type: Number, default: 0 },
  notableInvestments: [{ startup: String, year: Number, outcome: String }],

  // Contact
  website: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },

  // Saved & Interactions
  savedStartups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],
  viewedStartups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Startup' }],

  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Investor', InvestorSchema);
