const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/receipt', paymentController.createReceipt); // Money In
router.post('/payment', paymentController.createPayment); // Money Out
router.get('/', paymentController.getRecentTransactions);

module.exports = router;
