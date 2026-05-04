// backend/src/routes/ticketRoutes.js

const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  updateTicketStatus,
  deleteTicket,
} = require('../controllers/ticketController');

const router = express.Router();

// All ticket routes require authentication (role checks inside controllers)
router.use(protect);

// ========== Routes ==========
router.route('/')
  .post(createTicket)
  .get(getTickets);

router.route('/:id')
  .get(getTicketById)
  .delete(deleteTicket); // Admin only (checked in controller)

router.post('/:id/messages', addMessage);
router.put('/:id/status', updateTicketStatus); // Instructor/Admin only (checked in controller)

module.exports = router;