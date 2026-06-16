const express = require('express');
const router = express.Router();
const { getUrlAnalytics } = require('../controllers/analyticsController');
const { protectOptional } = require('../middleware/auth');

router.get('/:shortCode', protectOptional, getUrlAnalytics);

module.exports = router;
