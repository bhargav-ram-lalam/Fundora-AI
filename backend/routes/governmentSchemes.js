const express = require('express');
const router = express.Router();
const { getSchemes, getScheme, matchSchemes, createScheme, updateScheme, deleteScheme } = require('../controllers/governmentSchemeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSchemes);
router.get('/match/:startupId', protect, authorize('founder'), matchSchemes);
router.get('/:id', protect, getScheme);
router.post('/', protect, authorize('admin'), createScheme);
router.put('/:id', protect, authorize('admin'), updateScheme);
router.delete('/:id', protect, authorize('admin'), deleteScheme);

module.exports = router;
