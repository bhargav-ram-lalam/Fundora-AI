const express = require('express');
const router = express.Router();
const { createStartup, getMyStartup, getStartup, updateStartup, getAllStartups, toggleSaveStartup, deleteStartup } = require('../controllers/startupController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('investor', 'admin'), getAllStartups);
router.post('/', protect, authorize('founder'), createStartup);
router.get('/my', protect, authorize('founder'), getMyStartup);
router.get('/:id', protect, getStartup);
router.put('/:id', protect, authorize('founder', 'admin'), updateStartup);
router.delete('/:id', protect, authorize('founder', 'admin'), deleteStartup);
router.post('/:id/save', protect, authorize('investor'), toggleSaveStartup);

module.exports = router;
