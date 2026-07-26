const Investor = require('../models/Investor');
const Startup = require('../models/Startup');

// @desc    Create investor profile
// @route   POST /api/investors
exports.createInvestorProfile = async (req, res) => {
  const existing = await Investor.findOne({ user: req.user.id });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Investor profile already exists' });
  }
  const investor = await Investor.create({ ...req.body, user: req.user.id });
  res.status(201).json({ success: true, data: investor });
};

// @desc    Get my investor profile
// @route   GET /api/investors/me
exports.getMyProfile = async (req, res) => {
  let investor = await Investor.findOne({ user: req.user.id }).populate('user', 'name email avatar');
  if (!investor) {
    investor = await Investor.create({ user: req.user.id });
    investor = await Investor.findById(investor._id).populate('user', 'name email avatar');
  }
  res.json({ success: true, data: investor });
};

// @desc    Update investor profile
// @route   PUT /api/investors/me
exports.updateProfile = async (req, res) => {
  let investor = await Investor.findOneAndUpdate(
    { user: req.user.id },
    req.body,
    { new: true, runValidators: true, upsert: true }
  ).populate('user', 'name email avatar');

  res.json({ success: true, data: investor });
};

// @desc    Get investor recommendations for a startup
// @route   GET /api/investors/recommendations/:startupId
exports.getRecommendations = async (req, res) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

  // Get all active investors
  const allInvestors = await Investor.find({ isActive: true }).populate('user', 'name email avatar');
  const totalInvestors = allInvestors.length;

  // Score each investor by compatibility
  const scoredInvestors = allInvestors.map(investor => {
    let score = 0;

    // Industry match (30 points)
    if (investor.preferredIndustries.includes(startup.industry)) score += 30;

    // Stage match (25 points)
    if (investor.preferredStages.includes(startup.stage)) score += 25;

    // Funding range match (25 points)
    if (startup.fundingRequired >= investor.minInvestment && startup.fundingRequired <= investor.maxInvestment) score += 25;

    // Technology match (20 points)
    const techOverlap = startup.techStack?.filter(t => investor.preferredTechnologies.includes(t)) || [];
    score += Math.min(20, techOverlap.length * 5);

    return { investor, score };
  });

  // Sort by score — include ALL investors (even score=0), ranked from best to worst
  const ranked = scoredInvestors
    .sort((a, b) => b.score - a.score)
    .map(i => ({ ...i.investor.toObject(), compatibilityScore: i.score }));

  res.json({ success: true, data: ranked, total: totalInvestors, matched: ranked.filter(i => i.compatibilityScore > 0).length });
};

// @desc    Get all investors for founders (with search & filter)
// @route   GET /api/investors/browse
exports.getAllInvestorsForFounder = async (req, res) => {
  const { search = '', investorType = '', page = 1, limit = 12 } = req.query;

  // Build MongoDB query — only filter on fields that exist in the Investor doc itself
  const query = { isActive: true };
  if (investorType) query.investorType = investorType;

  // Fetch all matching investors (we'll do name search in JS after populate)
  let investors = await Investor.find(query)
    .populate('user', 'name email avatar')
    .sort({ rating: -1, createdAt: -1 });

  // Apply search filter in JS — covers user.name, firmName, investorType
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    investors = investors.filter(inv =>
      inv.user?.name?.toLowerCase().includes(q) ||
      inv.firmName?.toLowerCase().includes(q) ||
      inv.investorType?.toLowerCase().includes(q) ||
      inv.bio?.toLowerCase().includes(q)
    );
  }

  const total = investors.length;
  const skip = (Number(page) - 1) * Number(limit);
  const paginated = investors.slice(skip, skip + Number(limit));

  res.json({
    success: true,
    data: paginated,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)) || 1,
    },
  });
};

// @desc    Get saved startups
// @route   GET /api/investors/saved
exports.getSavedStartups = async (req, res) => {
  let investor = await Investor.findOne({ user: req.user.id }).populate({
    path: 'savedStartups',
    populate: { path: 'founder', select: 'name email' },
  });
  // Auto-create profile if it doesn't exist
  if (!investor) {
    investor = await Investor.create({ user: req.user.id });
    return res.json({ success: true, data: [] });
  }
  const validStartups = (investor.savedStartups || []).filter(s => s != null && s._id);
  res.json({ success: true, data: validStartups });
};

// @desc    Save/remove startup
// @route   POST /api/investors/save/:startupId
exports.toggleSaveStartup = async (req, res) => {
  // Auto-create investor profile if it doesn't exist yet
  let investor = await Investor.findOne({ user: req.user.id });
  if (!investor) {
    investor = await Investor.create({ user: req.user.id });
  }

  const startupId = req.params.startupId;
  const isSaved = investor.savedStartups.some(id => id.toString() === startupId);

  if (isSaved) {
    investor.savedStartups = investor.savedStartups.filter(id => id.toString() !== startupId);
  } else {
    investor.savedStartups.push(startupId);
  }

  await investor.save();
  res.json({ success: true, isSaved: !isSaved });
};

// @desc    Get all investors (admin)
// @route   GET /api/investors
exports.getAllInvestors = async (req, res) => {
  const investors = await Investor.find().populate('user', 'name email avatar');
  res.json({ success: true, data: investors, count: investors.length });
};
