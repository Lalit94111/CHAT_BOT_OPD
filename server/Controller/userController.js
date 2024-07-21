
const User = require('../models/User'); 

const createUser = async (req, res) => {
    try {
        const { name, age } = req.body;

        if (!name || !age) {
            return res.status(400).json({ message: 'Name and age are required' });
        }
        const newUser = await User.create({ name, age });

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getUserById = async (req, res) => {
    try {
        const userId = parseInt(req.query.id, 10);

        if (isNaN(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createUser,
    getUserById
};
