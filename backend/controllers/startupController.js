const Startup = require('../models/Startup');
const Notification = require('../models/Notification');

// @desc    Create startup profile
// @route   POST /api/startups
exports.createStartup = async (req, res) => {
  const existing = await Startup.findOne({ founder: req.user.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'You already have a startup profile. Use PUT to update.' });
  }
  const startup = await Startup.create({ ...req.body, founder: req.user.id });
  res.status(201).json({ success: true, data: startup });
};

// @desc    Get my startup
// @route   GET /api/startups/my
exports.getMyStartup = async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user.id }).populate('founder', 'name email avatar');
  if (!startup) {
    return res.status(404).json({ success: false, message: 'No startup profile found. Please create one.' });
  }
  res.json({ success: true, data: startup });
};

// @desc    Get startup by ID
// @route   GET /api/startups/:id
exports.getStartup = async (req, res) => {
  const startup = await Startup.findById(req.params.id).populate('founder', 'name email avatar');
  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found' });
  }
  // Increment view count
  startup.views += 1;
  await startup.save({ validateBeforeSave: false });
  res.json({ success: true, data: startup });
};

// @desc    Update startup
// @route   PUT /api/startups/:id
exports.updateStartup = async (req, res) => {
  let startup = await Startup.findById(req.params.id);
  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found' });
  }
  if (startup.founder.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this startup' });
  }
  // Use .save() instead of findByIdAndUpdate so pre-save hooks (profileCompleteness) run
  const allowedFields = [
    'name', 'tagline', 'industry', 'subIndustry', 'stage', 'foundedYear', 'country', 'city',
    'founderDetails', 'teamMembers', 'teamSize',
    'problemStatement', 'proposedSolution', 'targetMarket', 'marketSize',
    'businessModel', 'revenueModel', 'currentRevenue', 'projectedRevenue', 'competitors', 'uniqueValueProp',
    'techStack', 'hasPrototype', 'hasPatent',
    'fundingRequired', 'fundingCurrency', 'fundingPurpose', 'previousFunding', 'equityOffered',
    'isRegistered', 'registrationType', 'gstin',
    'website', 'demoVideo', 'linkedin', 'twitter', 'instagram',
    'isPublic', 'status',
  ];
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) startup[field] = req.body[field];
  });
  await startup.save();
  res.json({ success: true, data: startup });
};

// @desc    Get all startups (investor/admin)
// @route   GET /api/startups
exports.getAllStartups = async (req, res) => {
  const { industry, stage, search, minFunding, maxFunding, page = 1, limit = 12 } = req.query;

  const query = { isPublic: true, status: { $ne: 'closed' } };

  if (industry) query.industry = industry;
  if (stage) query.stage = stage;
  if (minFunding) query.fundingRequired = { $gte: Number(minFunding) };
  if (maxFunding) query.fundingRequired = { ...query.fundingRequired, $lte: Number(maxFunding) };
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
      { industry: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const total = await Startup.countDocuments(query);
  const startups = await Startup.find(query)
    .populate('founder', 'name email avatar')
    .sort({ 'aiScore.overall': -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: startups,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
};

// @desc    Save/unsave startup (investor)
// @route   POST /api/startups/:id/save
exports.toggleSaveStartup = async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

  const isSaved = startup.savedBy.includes(req.user.id);
  if (isSaved) {
    startup.savedBy = startup.savedBy.filter(id => id.toString() !== req.user.id);
  } else {
    startup.savedBy.push(req.user.id);
    // Notify founder
    await Notification.create({
      recipient: startup.founder,
      sender: req.user.id,
      type: 'startup_saved',
      title: 'Investor Saved Your Startup',
      message: `An investor has saved your startup "${startup.name}"`,
      data: { startupId: startup._id },
      link: '/founder/investors',
    });
  }
  await startup.save({ validateBeforeSave: false });
  res.json({ success: true, isSaved: !isSaved, savedCount: startup.savedBy.length });
};

// @desc    Delete startup
// @route   DELETE /api/startups/:id
exports.deleteStartup = async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });
  if (startup.founder.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  await startup.deleteOne();
  res.json({ success: true, message: 'Startup deleted' });
};
