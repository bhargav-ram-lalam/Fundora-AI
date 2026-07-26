const GovernmentScheme = require('../models/GovernmentScheme');
const Startup = require('../models/Startup');

// @desc    Get all schemes
// @route   GET /api/government-schemes
exports.getSchemes = async (req, res) => {
  const { category, search, active } = req.query;
  const query = {};
  if (category) query.category = category;
  if (active !== undefined) query.isActive = active === 'true';
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  const schemes = await GovernmentScheme.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: schemes, count: schemes.length });
};

// @desc    Get scheme by ID
// @route   GET /api/government-schemes/:id
exports.getScheme = async (req, res) => {
  const scheme = await GovernmentScheme.findById(req.params.id);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, data: scheme });
};

// @desc    Match schemes to startup automatically
// @route   GET /api/government-schemes/match/:startupId
exports.matchSchemes = async (req, res) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });

  const schemes = await GovernmentScheme.find({ isActive: true });

  // Score schemes by eligibility
  const matched = schemes.map(scheme => {
    let score = 0;
    const reasons = [];

    // Stage match
    if (!scheme.eligibility.stages || scheme.eligibility.stages.length === 0 || scheme.eligibility.stages.includes(startup.stage)) {
      score += 25;
      reasons.push('Stage matches');
    }

    // Industry match
    if (!scheme.eligibility.industries || scheme.eligibility.industries.length === 0 || scheme.eligibility.industries.includes(startup.industry)) {
      score += 30;
      reasons.push('Industry eligible');
    }

    // Registration status
    if (scheme.eligibility.isRegistered === undefined || scheme.eligibility.isRegistered === startup.isRegistered) {
      score += 20;
      reasons.push('Registration status matches');
    }

    // Team size
    const teamOk = (!scheme.eligibility.teamSizeMin || startup.teamSize >= scheme.eligibility.teamSizeMin) &&
      (!scheme.eligibility.teamSizeMax || startup.teamSize <= scheme.eligibility.teamSizeMax);
    if (teamOk) { score += 15; reasons.push('Team size eligible'); }

    // Deadline not passed
    if (!scheme.deadline || scheme.deadline > new Date()) {
      score += 10;
    }

    return { scheme, compatibilityScore: score, reasons };
  });

  const sorted = matched
    .filter(m => m.compatibilityScore >= 25)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  res.json({ success: true, data: sorted });
};

// @desc    Create scheme (admin)
// @route   POST /api/government-schemes
exports.createScheme = async (req, res) => {
  const scheme = await GovernmentScheme.create(req.body);
  res.status(201).json({ success: true, data: scheme });
};

// @desc    Update scheme (admin)
// @route   PUT /api/government-schemes/:id
exports.updateScheme = async (req, res) => {
  const scheme = await GovernmentScheme.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  res.json({ success: true, data: scheme });
};

// @desc    Delete scheme (admin)
// @route   DELETE /api/government-schemes/:id
exports.deleteScheme = async (req, res) => {
  const scheme = await GovernmentScheme.findById(req.params.id);
  if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
  await scheme.deleteOne();
  res.json({ success: true, message: 'Scheme deleted' });
};
