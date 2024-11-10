const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController'); // Assume getUserProfile is defined
const router = express.Router();

router.post('/create', authMiddleware, customerController.createCustomer);
router.post('/update', authMiddleware, customerController.updateCustomer);
router.post('/delete', authMiddleware, customerController.deleteCustomer);

module.exports = router;
