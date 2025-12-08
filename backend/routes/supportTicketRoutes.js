const express = require('express');
const router = express.Router();
const {
    createTicket,
    getUserTickets,
    getAllTickets,
    updateTicketStatus,
    getTicketStats
} = require('../controllers/supportTicketController');

/**
 * @route   POST /api/support-tickets
 * @desc    Create a new support ticket
 * @access  Private (any authenticated user)
 */
router.post('/', createTicket);

/**
 * @route   GET /api/support-tickets/user/:userId
 * @desc    Get all tickets for a specific user
 * @access  Private (user's own tickets)
 */
router.get('/user/:userId', getUserTickets);

/**
 * @route   GET /api/support-tickets
 * @desc    Get all tickets (with optional filters)
 * @access  Private (admin only)
 */
router.get('/', getAllTickets);

/**
 * @route   PATCH /api/support-tickets/:ticketId
 * @desc    Update ticket status and add admin response
 * @access  Private (admin only)
 */
router.patch('/:ticketId', updateTicketStatus);

/**
 * @route   GET /api/support-tickets/stats
 * @desc    Get ticket statistics
 * @access  Private (admin only)
 */
router.get('/stats/overview', getTicketStats);

module.exports = router;
