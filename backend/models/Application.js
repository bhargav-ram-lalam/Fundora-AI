const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  status: String,
  date: { type: Date, default: Date.now },
  note: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const ApplicationSchema = new mongoose.Schema({
  startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Target (investor or scheme)
  type: { type: String, enum: ['investor', 'scheme'], required: true },
  investor: { type: mongoose.Schema.Types.ObjectId, ref: 'Investor' },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentScheme' },

  // Status
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'shortlisted', 'interview', 'approved', 'rejected'],
    default: 'submitted',
  },

  // Details
  coverLetter: { type: String, default: '' },
  fundingRequested: { type: Number },
  equityOffered: { type: Number },

  // Timeline
  timeline: [TimelineEventSchema],

  // Feedback
  reviewerNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  interviewDate: { type: Date },

  // Attachments
  attachments: [{ name: String, url: String }],

  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
}, { timestamps: true });

// Add to timeline on status change
ApplicationSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.timeline.push({ status: this.status, date: new Date() });
  }
  next();
});

module.exports = mongoose.model('Application', ApplicationSchema);
