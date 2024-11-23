const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const customerController = require('../controllers/customerController'); // Assume getUserProfile is defined
const router = express.Router();

router.post('/create', authMiddleware, customerController.createCustomer);
router.post('/update', authMiddleware, customerController.updateCustomer);
router.post('/delete', authMiddleware, customerController.deleteCustomer);
router.get('/getall', authMiddleware, customerController.getAllCustomers);
router.get('/getbyId:userId', authMiddleware, customerController.getCustomerById);
router.post('/insertPayment', authMiddleware, customerController.insertPayment);
router.get('/getPaymentsByUserId', authMiddleware, customerController.getPaymentsByUserId);
router.get('/getRoomRent', authMiddleware, customerController.getRoomRent);

module.exports = router;
