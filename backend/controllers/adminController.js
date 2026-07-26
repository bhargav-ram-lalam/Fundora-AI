const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Application = require('../models/Application');
const AIAnalysis = require('../models/AIAnalysis');
const GovernmentScheme = require('../models/GovernmentScheme');
const Notification = require('../models/Notification');

// @desc    Get all users
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, data: users, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
};

// @desc    Update user (admin)
// @route   PUT /api/admin/users/:id
exports.updateUser = async (req, res) => {
  const { isActive, role } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive, role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
};

// @desc    Get all startups (admin)
// @route   GET /api/admin/startups
exports.getAllStartups = async (req, res) => {
  const { industry, stage, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (industry) query.industry = industry;
  if (stage) query.stage = stage;
  if (status) query.status = status;
  const skip = (page - 1) * limit;
  const total = await Startup.countDocuments(query);
  const startups = await Startup.find(query)
    .populate('founder', 'name email')
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
  res.json({ success: true, data: startups, pagination: { page: Number(page), total, pages: Math.ceil(total / limit) } });
};

// @desc    Get AI usage stats
// @route   GET /api/admin/ai-stats
exports.getAIStats = async (req, res) => {
  const totalAnalyses = await AIAnalysis.countDocuments();
  const completedAnalyses = await AIAnalysis.countDocuments({ status: 'completed' });
  const failedAnalyses = await AIAnalysis.countDocuments({ status: 'failed' });

  const analysesByDay = await AIAnalysis.aggregate([
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: -1 } }, { $limit: 30 },
  ]);

  const avgScores = await AIAnalysis.aggregate([
    { $match: { status: 'completed' } },
    {
      $group: {
        _id: null,
        avgOverall: { $avg: '$scores.overall' },
        avgInnovation: { $avg: '$scores.innovation' },
        avgMarket: { $avg: '$scores.marketPotential' },
        avgTeam: { $avg: '$scores.teamStrength' },
      },
    },
  ]);

  res.json({
    success: true,
    data: {
      totalAnalyses, completedAnalyses, failedAnalyses,
      successRate: totalAnalyses > 0 ? Math.round((completedAnalyses / totalAnalyses) * 100) : 0,
      analysesByDay: analysesByDay.reverse(),
      avgScores: avgScores[0] || {},
    },
  });
};

// @desc    Send system notification to all users
// @route   POST /api/admin/notify
exports.sendSystemNotification = async (req, res) => {
  const { title, message, role } = req.body;
  const query = role ? { role } : {};
  const users = await User.find(query).select('_id');

  const notifications = users.map(u => ({
    recipient: u._id,
    type: 'system',
    title,
    message,
    link: '/',
  }));

  await Notification.insertMany(notifications);
  res.json({ success: true, message: `Notification sent to ${notifications.length} users` });
};
