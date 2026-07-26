const mongoose = require('mongoose');

const AIAnalysisSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  analyzedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Core Scores (0-100)
  scores: {
    overall: { type: Number, default: 0 },
    innovation: { type: Number, default: 0 },
    marketPotential: { type: Number, default: 0 },
    fundingReadiness: { type: Number, default: 0 },
    technology: { type: Number, default: 0 },
    teamStrength: { type: Number, default: 0 },
    businessModel: { type: Number, default: 0 },
    riskScore: { type: Number, default: 0 }, // Lower is better risk
    investmentPotential: { type: Number, default: 0 },
  },

  // Qualitative Analysis
  swot: {
    strengths: [String],
    weaknesses: [String],
    opportunities: [String],
    threats: [String],
  },

  // Detailed Analysis
  riskAnalysis: { type: String, default: '' },
  marketAnalysis: { type: String, default: '' },
  competitorAnalysis: { type: String, default: '' },
  technologyAssessment: { type: String, default: '' },
  teamAssessment: { type: String, default: '' },

  // Recommendations
  improvementSuggestions: [String],
  missingElements: [String],
  keyStrengths: [String],

  // Summary
  executiveSummary: { type: String, default: '' },
  investmentHighlights: [String],
  redFlags: [String],

  // Meta
  modelUsed: { type: String, default: 'gemini-1.5-flash' },
  tokensUsed: { type: Number, default: 0 },
  version: { type: Number, default: 1 },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  errorMessage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AIAnalysis', AIAnalysisSchema);
