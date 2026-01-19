const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/stock', reportController.getStockSummary);
router.get('/payments', reportController.getPaymentStats);

module.exports = router;
