const User = require('../models/User');
const Startup = require('../models/Startup');
const Investor = require('../models/Investor');
const Application = require('../models/Application');
const AIAnalysis = require('../models/AIAnalysis');
const GovernmentScheme = require('../models/GovernmentScheme');
const Notification = require('../models/Notification');

// @desc    Founder dashboard stats
// @route   GET /api/dashboard/founder
exports.getFounderDashboard = async (req, res) => {
  const startup = await Startup.findOne({ founder: req.user.id });
  if (!startup) {
    return res.json({
      success: true,
      data: {
        hasStartup: false,
        stats: { applications: 0, aiAnalyses: 0, profileCompleteness: 0, savedByInvestors: 0 },
      },
    });
  }

  const [applications, analyses, notifications] = await Promise.all([
    Application.countDocuments({ startup: startup._id }),
    AIAnalysis.countDocuments({ startup: startup._id, status: 'completed' }),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  const applicationsByStatus = await Application.aggregate([
    { $match: { startup: startup._id } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentAnalyses = await AIAnalysis.find({ startup: startup._id, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('scores createdAt');

  res.json({
    success: true,
    data: {
      hasStartup: true,
      startup: {
        id: startup._id,
        name: startup.name,
        stage: startup.stage,
        industry: startup.industry,
        profileCompleteness: startup.profileCompleteness,
        aiScore: startup.aiScore,
        views: startup.views,
        savedBy: startup.savedBy.length,
      },
      stats: {
        applications,
        aiAnalyses: analyses,
        profileCompleteness: startup.profileCompleteness,
        savedByInvestors: startup.savedBy.length,
        unreadNotifications: notifications,
      },
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentAnalyses,
    },
  });
};

// @desc    Investor dashboard stats
// @route   GET /api/dashboard/investor
exports.getInvestorDashboard = async (req, res) => {
  const investor = await Investor.findOne({ user: req.user.id });

  const [totalStartups, notifications] = await Promise.all([
    Startup.countDocuments({ isPublic: true }),
    Notification.countDocuments({ recipient: req.user.id, isRead: false }),
  ]);

  const industryDistribution = await Startup.aggregate([
    { $match: { isPublic: true } },
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 8 },
  ]);

  const stageDistribution = await Startup.aggregate([
    { $match: { isPublic: true } },
    { $group: { _id: '$stage', count: { $sum: 1 } } },
  ]);

  const topStartups = await Startup.find({ isPublic: true, 'aiScore.overall': { $gt: 0 } })
    .sort({ 'aiScore.overall': -1 })
    .limit(5)
    .select('name industry stage aiScore fundingRequired')
    .populate('founder', 'name avatar');

  res.json({
    success: true,
    data: {
      investor,
      stats: {
        totalStartups,
        savedStartups: investor?.savedStartups?.length || 0,
        unreadNotifications: notifications,
      },
      industryDistribution,
      stageDistribution,
      topStartups,
    },
  });
};

// @desc    Admin dashboard stats
// @route   GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
  const [totalUsers, totalStartups, totalInvestors, totalApplications, totalSchemes, totalAnalyses] = await Promise.all([
    User.countDocuments(),
    Startup.countDocuments(),
    Investor.countDocuments(),
    Application.countDocuments(),
    GovernmentScheme.countDocuments(),
    AIAnalysis.countDocuments({ status: 'completed' }),
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const startupsByIndustry = await Startup.aggregate([
    { $group: { _id: '$industry', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const applicationsByStatus = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt');
  const recentStartups = await Startup.find().sort({ createdAt: -1 }).limit(5)
    .select('name industry stage profileCompleteness')
    .populate('founder', 'name email');

  // Monthly signups (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlySignups = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: { totalUsers, totalStartups, totalInvestors, totalApplications, totalSchemes, totalAnalyses },
      usersByRole: usersByRole.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      startupsByIndustry,
      applicationsByStatus: applicationsByStatus.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {}),
      recentUsers,
      recentStartups,
      monthlySignups,
    },
  });
};
