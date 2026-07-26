const InvestmentOffer = require('../models/InvestmentOffer');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Notification = require('../models/Notification');

// @desc    Create investment offer (investor -> startup founder)
// @route   POST /api/offers
exports.createOffer = async (req, res) => {
  const { startupId, amount, equity, message, terms } = req.body;

  if (!startupId || !amount || !equity || !message) {
    return res.status(400).json({ success: false, message: 'Startup ID, amount, equity, and message are required' });
  }

  const startup = await Startup.findById(startupId);
  if (!startup) {
    return res.status(404).json({ success: false, message: 'Startup not found' });
  }

  // Get investor profile if exists
  const investorProfile = await Investor.findOne({ user: req.user.id });

  // Calculate valuation if equity > 0
  const valuation = equity > 0 ? Math.round((Number(amount) / Number(equity)) * 100) : 0;

  const offer = await InvestmentOffer.create({
    startup: startupId,
    founder: startup.founder,
    investorUser: req.user.id,
    investorProfile: investorProfile ? investorProfile._id : null,
    amount: Number(amount),
    equity: Number(equity),
    valuation,
    message,
    terms: terms || '',
    status: 'pending',
  });

  // Notify the founder
  const amountLakhs = (Number(amount) / 100000).toFixed(1);
  await Notification.create({
    recipient: startup.founder,
    type: 'investment_offer',
    title: '🎉 Investment Offer Received!',
    message: `Investor "${req.user.name}" offered ₹${amountLakhs}L for ${equity}% equity in "${startup.name}".`,
    data: { offerId: offer._id, startupId: startup._id },
    link: '/founder/applications',
  });

  const populated = await InvestmentOffer.findById(offer._id)
    .populate('startup', 'name industry stage')
    .populate('investorUser', 'name email avatar')
    .populate('investorProfile');

  res.status(201).json({ success: true, data: populated });
};

// @desc    Get offers received by founder
// @route   GET /api/offers/founder
exports.getFounderOffers = async (req, res) => {
  const offers = await InvestmentOffer.find({ founder: req.user.id })
    .populate('startup', 'name industry stage tagline logo')
    .populate('investorUser', 'name email avatar')
    .populate('investorProfile')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: offers, count: offers.length });
};

// @desc    Get offers sent by investor
// @route   GET /api/offers/investor
exports.getInvestorOffers = async (req, res) => {
  const offers = await InvestmentOffer.find({ investorUser: req.user.id })
    .populate('startup', 'name industry stage tagline founder')
    .populate('founder', 'name email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: offers, count: offers.length });
};

// @desc    Founder responds to investment offer (accept/decline/negotiate)
// @route   PUT /api/offers/:id/respond
exports.respondToOffer = async (req, res) => {
  const { status, responseMessage } = req.body;

  if (!['accepted', 'declined', 'negotiating'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status response' });
  }

  const offer = await InvestmentOffer.findById(req.params.id).populate('startup', 'name');
  if (!offer) {
    return res.status(404).json({ success: false, message: 'Investment offer not found' });
  }

  if (offer.founder.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized to respond to this offer' });
  }

  offer.status = status;
  if (responseMessage) offer.responseMessage = responseMessage;
  offer.respondedAt = new Date();

  await offer.save();

  // Notify investor
  const statusFormatted = status.toUpperCase();
  await Notification.create({
    recipient: offer.investorUser,
    type: 'offer_response',
    title: `Investment Offer ${statusFormatted}`,
    message: `The founder of "${offer.startup?.name || 'Startup'}" has ${status} your investment offer.`,
    data: { offerId: offer._id, startupId: offer.startup?._id },
    link: '/investor/applications',
  });

  res.json({ success: true, data: offer });
};
