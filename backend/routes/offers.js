const express = require('express');
const router = express.Router();
const { createOffer, getFounderOffers, getInvestorOffers, respondToOffer } = require('../controllers/offerController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('investor'), createOffer);
router.get('/founder', protect, authorize('founder'), getFounderOffers);
router.get('/investor', protect, authorize('investor'), getInvestorOffers);
router.put('/:id/respond', protect, authorize('founder'), respondToOffer);

module.exports = router;
