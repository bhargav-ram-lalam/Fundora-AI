const express = require('express');
const router = express.Router();
const { createApplication, getMyApplications, getInvestorApplications, updateStatus, getApplication, getAllApplications } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllApplications);
router.post('/', protect, authorize('founder'), createApplication);
router.get('/my', protect, authorize('founder'), getMyApplications);
router.get('/investor', protect, authorize('investor', 'admin'), getInvestorApplications);
router.get('/:id', protect, getApplication);
router.put('/:id/status', protect, authorize('investor', 'admin'), updateStatus);

module.exports = router;
