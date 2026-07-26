const express = require('express');
const router = express.Router();
const { analyzeStartup, getAnalysis, getAnalysisById, generateFundingReadiness, getFundingReadiness, improveProposal, handleChat } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

router.post('/analyze/:startupId', protect, authorize('founder'), analyzeStartup);
router.get('/analysis/:startupId', protect, getAnalysis);
router.get('/analysis/result/:id', protect, getAnalysisById);
router.post('/funding-readiness/:startupId', protect, authorize('founder'), generateFundingReadiness);
router.get('/funding-readiness/:startupId', protect, getFundingReadiness);
router.post('/improve-proposal/:proposalId', protect, authorize('founder'), improveProposal);
router.post('/chat', protect, handleChat);

module.exports = router;
