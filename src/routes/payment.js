const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createOrder);
router.get('/status/:orderId', paymentController.checkStatus);

module.exports = router;
