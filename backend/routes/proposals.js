const express = require('express');
const router = express.Router();
const { uploadProposal, getProposals, deleteProposal } = require('../controllers/proposalController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, authorize('founder'), upload.single('file'), uploadProposal);
router.get('/:startupId', protect, getProposals);
router.delete('/:id', protect, authorize('founder', 'admin'), deleteProposal);

module.exports = router;
