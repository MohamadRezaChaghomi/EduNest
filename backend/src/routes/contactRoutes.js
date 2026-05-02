const express = require('express');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const { submitContact, getContacts, markAsRead } = require('../controllers/contactController');

const router = express.Router();

router.post('/', submitContact); // عمومی
router.get('/', protect, adminOnly, getContacts);
router.put('/:id/read', protect, adminOnly, markAsRead);

module.exports = router;