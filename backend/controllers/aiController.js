const AIAnalysis = require('../models/AIAnalysis');
const FundingReadiness = require('../models/FundingReadiness');
const Startup = require('../models/Startup');
const Proposal = require('../models/Proposal');
const Notification = require('../models/Notification');
const geminiService = require('../services/geminiService');

// @desc    Analyze startup with Gemini AI
// @route   POST /api/ai/analyze/:startupId
exports.analyzeStartup = async (req, res) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });
  if (startup.founder.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  // Create pending analysis record
  const analysis = await AIAnalysis.create({
    startup: startup._id,
    analyzedBy: req.user.id,
    status: 'processing',
  });

  // Return immediately and process in background
  res.status(202).json({ success: true, data: { analysisId: analysis._id, status: 'processing' }, message: 'Analysis started' });

  // Process async
  try {
    const result = await geminiService.analyzeStartup(startup.toObject());

    await AIAnalysis.findByIdAndUpdate(analysis._id, {
      scores: result.scores,
      swot: result.swot,
      riskAnalysis: result.riskAnalysis,
      marketAnalysis: result.marketAnalysis,
      competitorAnalysis: result.competitorAnalysis,
      technologyAssessment: result.technologyAssessment,
      teamAssessment: result.teamAssessment,
      improvementSuggestions: result.improvementSuggestions,
      missingElements: result.missingElements,
      keyStrengths: result.keyStrengths,
      executiveSummary: result.executiveSummary,
      investmentHighlights: result.investmentHighlights,
      redFlags: result.redFlags,
      status: 'completed',
    });

    // Update startup AI scores cache
    await Startup.findByIdAndUpdate(startup._id, {
      aiScore: {
        overall: result.scores.overall,
        innovation: result.scores.innovation,
        market: result.scores.marketPotential,
        team: result.scores.teamStrength,
        business: result.scores.businessModel,
        technology: result.scores.technology,
        risk: result.scores.riskScore,
        lastAnalyzed: new Date(),
      },
    });

    // Send notification
    await Notification.create({
      recipient: req.user.id,
      type: 'ai_analysis_complete',
      title: 'AI Analysis Complete',
      message: `Your startup "${startup.name}" has been analyzed. Overall score: ${result.scores.overall}/100`,
      data: { startupId: startup._id, analysisId: analysis._id },
      link: '/founder/ai-analysis',
    });
  } catch (err) {
    console.error('AI Analysis error:', err);
    await AIAnalysis.findByIdAndUpdate(analysis._id, {
      status: 'failed',
      errorMessage: err.message,
    });
  }
};

// @desc    Get analysis results
// @route   GET /api/ai/analysis/:startupId
exports.getAnalysis = async (req, res) => {
  const analysis = await AIAnalysis.find({ startup: req.params.startupId })
    .sort({ createdAt: -1 })
    .limit(5);
  res.json({ success: true, data: analysis });
};

// @desc    Get analysis by ID
// @route   GET /api/ai/analysis/result/:id
exports.getAnalysisById = async (req, res) => {
  const analysis = await AIAnalysis.findById(req.params.id).populate('startup', 'name industry');
  if (!analysis) return res.status(404).json({ success: false, message: 'Analysis not found' });
  res.json({ success: true, data: analysis });
};

// @desc    Generate funding readiness
// @route   POST /api/ai/funding-readiness/:startupId
exports.generateFundingReadiness = async (req, res) => {
  const startup = await Startup.findById(req.params.startupId);
  if (!startup) return res.status(404).json({ success: false, message: 'Startup not found' });
  if (startup.founder.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const readiness = await FundingReadiness.create({
    startup: startup._id,
    generatedBy: req.user.id,
    status: 'processing',
  });

  res.status(202).json({ success: true, data: { readinessId: readiness._id, status: 'processing' } });

  try {
    const result = await geminiService.generateFundingReadiness(startup.toObject());

    await FundingReadiness.findByIdAndUpdate(readiness._id, {
      ...result,
      status: 'completed',
    });

    await Notification.create({
      recipient: req.user.id,
      type: 'funding_readiness_complete',
      title: 'Funding Readiness Report Ready',
      message: `Your funding readiness score: ${result.overallScore}/100 - ${result.readinessLevel}`,
      data: { startupId: startup._id },
      link: '/founder/funding-readiness',
    });
  } catch (err) {
    console.error('Funding Readiness error:', err);
    await FundingReadiness.findByIdAndUpdate(readiness._id, { status: 'failed' });
  }
};

// @desc    Get funding readiness reports
// @route   GET /api/ai/funding-readiness/:startupId
exports.getFundingReadiness = async (req, res) => {
  const reports = await FundingReadiness.find({ startup: req.params.startupId }).sort({ createdAt: -1 });
  res.json({ success: true, data: reports });
};

// @desc    Improve proposal with AI
// @route   POST /api/ai/improve-proposal/:proposalId
exports.improveProposal = async (req, res) => {
  const proposal = await Proposal.findById(req.params.proposalId).populate('startup');
  if (!proposal) return res.status(404).json({ success: false, message: 'Proposal not found' });

  const { originalText } = req.body;
  if (!originalText || originalText.trim().length < 50) {
    return res.status(400).json({ success: false, message: 'Please provide at least 50 characters of content to improve' });
  }

  await Proposal.findByIdAndUpdate(req.params.proposalId, {
    originalContent: originalText,
    improvementStatus: 'processing',
  });

  res.status(202).json({ success: true, message: 'Improvement started', data: { proposalId: proposal._id } });

  try {
    const result = await geminiService.improveProposal(originalText, proposal.startup?.name || 'Startup', proposal.type);

    await Proposal.findByIdAndUpdate(req.params.proposalId, {
      improvedContent: result.improvedContent,
      improvementSuggestions: result.suggestions,
      improvementStatus: 'completed',
    });
  } catch (err) {
    console.error('Proposal improvement error:', err);
    await Proposal.findByIdAndUpdate(req.params.proposalId, { improvementStatus: 'failed' });
  }
};
// @desc    Handle chat with AI assistant
// @route   POST /api/ai/chat
exports.handleChat = async (req, res) => {
  const { history, message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  try {
    const userProfile = {
      name: req.user.name,
      role: req.user.role
    };
    
    const reply = await geminiService.chatWithAI(history || [], message, userProfile);
    res.json({ success: true, data: reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ success: false, message: 'Failed to communicate with AI' });
  }
};
