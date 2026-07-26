const mongoose = require('mongoose');

const ProposalSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  title: { type: String, required: true },
  type: { type: String, enum: ['business_plan', 'pitch_deck', 'financial', 'prototype', 'other'], required: true },
  description: { type: String, default: '' },

  // File info
  originalName: { type: String },
  fileName: { type: String },
  filePath: { type: String },
  fileUrl: { type: String },
  fileSize: { type: Number },
  mimeType: { type: String },
  storageType: { type: String, enum: ['local', 'cloudinary'], default: 'local' },
  cloudinaryId: { type: String },

  // Content (for AI processing)
  extractedText: { type: String, default: '' },

  // AI improvement
  originalContent: { type: String, default: '' },
  improvedContent: { type: String, default: '' },
  improvementStatus: { type: String, enum: ['none', 'processing', 'completed', 'failed'], default: 'none' },
  improvementSuggestions: [String],

  analysisStatus: { type: String, enum: ['pending', 'analyzing', 'completed', 'failed'], default: 'pending' },
  version: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Proposal', ProposalSchema);
