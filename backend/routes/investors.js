const express = require('express');
const router = express.Router();
const { createInvestorProfile, getMyProfile, updateProfile, getRecommendations, getSavedStartups, toggleSaveStartup, getAllInvestors, getAllInvestorsForFounder } = require('../controllers/investorController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllInvestors);
router.post('/', protect, authorize('investor'), createInvestorProfile);
router.get('/me', protect, authorize('investor'), getMyProfile);
router.put('/me', protect, authorize('investor'), updateProfile);
router.get('/saved', protect, authorize('investor'), getSavedStartups);
router.post('/save/:startupId', protect, authorize('investor'), toggleSaveStartup);
router.get('/browse', protect, authorize('founder', 'admin'), getAllInvestorsForFounder);
router.get('/recommendations/:startupId', protect, authorize('founder', 'admin'), getRecommendations);

module.exports = router;
