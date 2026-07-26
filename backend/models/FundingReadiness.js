const mongoose = require('mongoose');

const CategoryScoreSchema = new mongoose.Schema({
  category: String,
  score: Number,
  maxScore: Number,
  status: { type: String, enum: ['excellent', 'good', 'fair', 'poor'] },
  details: String,
}, { _id: false });

const ActionItemSchema = new mongoose.Schema({
  priority: { type: String, enum: ['high', 'medium', 'low'] },
  action: String,
  timeline: String,
  impact: String,
}, { _id: false });

const FundingReadinessSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  overallScore: { type: Number, default: 0, min: 0, max: 100 },
  readinessLevel: { type: String, enum: ['Not Ready', 'Early Stage', 'Developing', 'Ready', 'Highly Ready'], default: 'Not Ready' },

  categoryScores: [CategoryScoreSchema],

  missingItems: [String],
  completedItems: [String],
  actionPlan: [ActionItemSchema],

  insights: { type: String, default: '' },
  nextSteps: [String],
  estimatedTimeToReady: { type: String, default: '' },

  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
}, { timestamps: true });

module.exports = mongoose.model('FundingReadiness', FundingReadinessSchema);
