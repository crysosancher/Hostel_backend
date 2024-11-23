const Customer = require('../models/Customer');
const Payments = require('../models/Payment');

async function createCustomer(req, res) {
    try {
        const tokenUsername = req.user.username;  // Assuming req.user is populated with decoded JWT
        const data = {
            ...req.body,
            createdBy: tokenUsername
        };
        
        const response = await Customer.createCustomer(data);
        res.status(201).json(response);
    } catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Failed to create customer' });
    }
}

async function updateCustomer(req, res) {
		try {
				const tokenUsername = req.user.username;  // Assuming req.user is populated with decoded JWT
				const userId = req.body.userId;
				const data = {
						...req.body,
						lastUpdatedBy: tokenUsername
				};
				
				const response = await Customer.updateCustomer(userId, data);
				if(response.status === 404) {
						return res.status(404).json(response);
				}
				res.status(200).json(response);
		} catch (error) {
				console.error('Update customer error:', error);
				res.status(500).json({ message: 'Failed to update customer' });
		}
}
async function deleteCustomer(req, res) {
		try {
			const tokenUsername = req.user.username;  // Assuming req.user is populated with decoded JWT
				const userId = req.body.userId;
				const response = await Customer.deleteCustomer(userId, tokenUsername);
				res.status(200).json(response);
		} catch (error) {
				console.error('Delete customer error:', error);
				res.status(500).json({ message: 'Failed to delete customer' });
		}
}
async function getAllCustomers(req, res) {
		try {
				const response = await Customer.getAllCustomers();
				res.status(200).json(response);
		} catch (error) {
				console.error('Get all customers error:', error);
				res.status(500).json({ message: 'Failed to get all customers' });
		}
}
async function getCustomerById(req, res) {
		try {
				const userId = req.params.userId;
				const response = await Customer.getCustomerById(userId);
				if (!response) {
						return res.status(404).json({ message: 'Customer not found' });
				}
				res.status(200).json(response);
		} catch (error) {
				console.error('Get customer by ID error:', error);
				res.status(500).json({ message: 'Failed to get customer by ID' });
		}
}
async function insertPayment(req, res) {
	try {
			// Extract the username from the decoded JWT (assumed to be present in `req.user`)
			const tokenUsername = req.user.username;

			// Prepare payment data by merging request body with additional fields
			const paymentData = {
					...req.body,
					createdBy: tokenUsername, // Add the creator's username
					creationDate: new Date(), // Add the current date as the creation date
			};

			// Call the Payments class's createPayment method
			const response = await Payments.createPayment(paymentData);

			// Respond with success
			res.status(201).json({
					message: 'Payment inserted successfully',
					data: response,
			});
	} catch (error) {
			console.error('Insert payment error:', error);

			// Respond with an error message
			res.status(500).json({
					message: 'Failed to insert payment',
					error: error.message || 'Internal Server Error',
			});
	}
}


module.exports = { createCustomer, updateCustomer, deleteCustomer, getAllCustomers, getCustomerById, insertPayment };
