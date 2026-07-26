const Proposal = require('../models/Proposal');
const Startup = require('../models/Startup');
const path = require('path');

// @desc    Upload proposal/document
// @route   POST /api/proposals/upload
exports.uploadProposal = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const { startupId, title, type, description } = req.body;

  const startup = await Startup.findById(startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });
  if (startup.founder.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const fileUrl = `/uploads/${req.user.id}/${req.file.filename}`;

  const proposal = await Proposal.create({
    startup: startupId,
    uploadedBy: req.user.id,
    title: title || req.file.originalname,
    type: type || 'other',
    description: description || '',
    originalName: req.file.originalname,
    fileName: req.file.filename,
    filePath: req.file.path,
    fileUrl,
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    storageType: 'local',
  });

  res.status(201).json({ success: true, data: proposal });
};

// @desc    Get proposals for a startup
// @route   GET /api/proposals/:startupId
exports.getProposals = async (req, res) => {
  const proposals = await Proposal.find({ startup: req.params.startupId }).sort({ createdAt: -1 });
  res.json({ success: true, data: proposals, count: proposals.length });
};

// @desc    Delete proposal
// @route   DELETE /api/proposals/:id
exports.deleteProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.id);
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });
  if (proposal.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await proposal.deleteOne();
  res.json({ success: true, message: 'Document deleted' });
};
