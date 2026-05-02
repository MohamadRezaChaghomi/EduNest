const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  updateTicketStatus,
  deleteTicket,
} = require('../controllers/ticketController');

const router = express.Router();

router.route('/')
  .post(protect, createTicket)
  .get(protect, getTickets);

router.route('/:id')
  .get(protect, getTicketById)
  .delete(protect, deleteTicket); // فقط ادمین در کنترلر بررسی می‌شود

router.post('/:id/messages', protect, addMessage);
router.put('/:id/status', protect, updateTicketStatus);

module.exports = router;