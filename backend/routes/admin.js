const express = require('express');
const router = express.Router();
const { getAllUsers, updateUser, deleteUser, getAllStartups, getAIStats, sendSystemNotification } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/startups', getAllStartups);
router.get('/ai-stats', getAIStats);
router.post('/notify', sendSystemNotification);

module.exports = router;
