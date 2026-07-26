const Application = require('../models/Application');
const Startup = require('../models/Startup');
const Notification = require('../models/Notification');

// @desc    Submit application
// @route   POST /api/applications
exports.createApplication = async (req, res) => {
  const { startupId, type, investorId, schemeId, coverLetter, fundingRequested, equityOffered } = req.body;

  const startup = await Startup.findById(startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });
  if (startup.founder.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const application = await Application.create({
    startup: startupId,
    applicant: req.user.id,
    type,
    investor: investorId,
    scheme: schemeId,
    coverLetter,
    fundingRequested,
    equityOffered,
    timeline: [{ status: 'submitted', date: new Date() }],
  });

  res.status(201).json({ success: true, data: application });
};

// @desc    Get my applications (founder)
// @route   GET /api/applications/my
exports.getMyApplications = async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user.id });
  if (!startup) return res.status(404).json({ success: false, message: 'No startup found' });

  const applications = await Application.find({ startup: startup._id })
    .populate('investor')
    .populate('scheme', 'name category benefits')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: applications });
};

// @desc    Get applications for investor
// @route   GET /api/applications/investor
exports.getInvestorApplications = async (req, res) => {
  const { status } = req.query;
  const query = { type: 'investor' };
  if (status) query.status = status;

  const applications = await Application.find(query)
    .populate({ path: 'startup', populate: { path: 'founder', select: 'name email' } })
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: applications });
};

// @desc    Update application status (investor/admin)
// @route   PUT /api/applications/:id/status
exports.updateStatus = async (req, res) => {
  const { status, reviewerNotes, rejectionReason, interviewDate } = req.body;

  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

  application.status = status;
  if (reviewerNotes) application.reviewerNotes = reviewerNotes;
  if (rejectionReason) application.rejectionReason = rejectionReason;
  if (interviewDate) application.interviewDate = interviewDate;

  await application.save();

  // Notify applicant
  const startup = await Startup.findById(application.startup);
  await Notification.create({
    recipient: application.applicant,
    type: 'application_status_change',
    title: 'Application Status Updated',
    message: `Your application for "${startup?.name}" has been updated to: ${status.replace('_', ' ').toUpperCase()}`,
    data: { applicationId: application._id, startupId: application.startup },
    link: '/founder/applications',
  });

  res.json({ success: true, data: application });
};

// @desc    Get application by ID
// @route   GET /api/applications/:id
exports.getApplication = async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('startup')
    .populate('investor')
    .populate('scheme');
  if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
  res.json({ success: true, data: application });
};

// @desc    Get all applications (admin)
// @route   GET /api/applications
exports.getAllApplications = async (req, res) => {
  const applications = await Application.find()
    .populate('startup', 'name industry')
    .populate('applicant', 'name email')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: applications, count: applications.length });
};
