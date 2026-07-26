const express = require('express');
const router = express.Router();
const { getFounderDashboard, getInvestorDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/founder', protect, authorize('founder'), getFounderDashboard);
router.get('/investor', protect, authorize('investor'), getInvestorDashboard);
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

module.exports = router;
