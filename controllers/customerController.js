const Customer = require('../models/Customer');

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
				const userId = req.params.userId;
				const response = await Customer.deleteCustomer(userId);
				res.status(200).json(response);
		} catch (error) {
				console.error('Delete customer error:', error);
				res.status(500).json({ message: 'Failed to delete customer' });
		}
}

module.exports = { createCustomer, updateCustomer, deleteCustomer };
