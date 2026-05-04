// backend/src/routes/statsRoutes.js

const express = require('express');
const { getSiteStats } = require('../controllers/statsController');

const router = express.Router();

// Public route - site statistics (courses, students, instructors, earnings)
router.get('/site', getSiteStats);

module.exports = router;