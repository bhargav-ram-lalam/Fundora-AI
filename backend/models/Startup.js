const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  linkedin: String,
  experience: String,
});

const StartupSchema = new mongoose.Schema({
  founder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Basic Info
  name: { type: String, required: [true, 'Startup name is required'], trim: true },
  tagline: { type: String, default: '' },
  industry: { type: String, required: [true, 'Industry is required'], enum: ['AI/ML', 'FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech', 'E-Commerce', 'SaaS', 'IoT', 'Blockchain', 'Cybersecurity', 'Gaming', 'Real Estate', 'Logistics', 'Other'] },
  subIndustry: { type: String, default: '' },
  stage: { type: String, enum: ['Idea', 'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Growth'], default: 'Idea' },
  foundedYear: { type: Number },
  country: { type: String, default: 'India' },
  city: { type: String, default: '' },

  // Team
  founderDetails: {
    name: String,
    title: String,
    linkedin: String,
    experience: String,
    education: String,
  },
  teamMembers: [TeamMemberSchema],
  teamSize: { type: Number, default: 1 },

  // Business
  problemStatement: { type: String, default: '' },
  proposedSolution: { type: String, default: '' },
  targetMarket: { type: String, default: '' },
  marketSize: { type: String, default: '' },
  businessModel: { type: String, default: '' },
  revenueModel: { type: String, default: '' },
  currentRevenue: { type: String, default: '0' },
  projectedRevenue: { type: String, default: '' },
  competitors: [String],
  uniqueValueProp: { type: String, default: '' },

  // Technology
  techStack: [String],
  hasPrototype: { type: Boolean, default: false },
  hasPatent: { type: Boolean, default: false },

  // Funding
  fundingRequired: { type: Number, default: 0 },
  fundingCurrency: { type: String, default: 'INR' },
  fundingPurpose: { type: String, default: '' },
  previousFunding: { type: Number, default: 0 },
  equityOffered: { type: Number, default: 0 },

  // Legal
  isRegistered: { type: Boolean, default: false },
  registrationType: { type: String, default: '' },
  gstin: { type: String, default: '' },

  // Online presence
  website: { type: String, default: '' },
  demoVideo: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  instagram: { type: String, default: '' },

  // AI Scores (cached)
  aiScore: {
    overall: { type: Number, default: 0 },
    innovation: { type: Number, default: 0 },
    market: { type: Number, default: 0 },
    team: { type: Number, default: 0 },
    business: { type: Number, default: 0 },
    technology: { type: Number, default: 0 },
    risk: { type: Number, default: 0 },
    lastAnalyzed: Date,
  },

  // Status
  profileCompleteness: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'active', 'funded', 'closed'], default: 'draft' },

  views: { type: Number, default: 0 },
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// Calculate profile completeness before save
StartupSchema.pre('save', function (next) {
  const fields = ['name', 'industry', 'stage', 'problemStatement', 'proposedSolution', 'targetMarket', 'businessModel', 'revenueModel', 'fundingRequired'];
  const filled = fields.filter(f => this[f] && this[f] !== '').length;
  this.profileCompleteness = Math.round((filled / fields.length) * 100);
  next();
});

module.exports = mongoose.model('Startup', StartupSchema);
