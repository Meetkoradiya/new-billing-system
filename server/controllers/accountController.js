const db = require('../config/db');

// Get all accounts
exports.getAllAccounts = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM accounts ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new account
exports.createAccount = async (req, res) => {
    const { name, group_id, address, city, mobile, gst_number } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO accounts (name, group_id, address, city, mobile, gst_number) VALUES (?, ?, ?, ?, ?, ?)',
            [name, group_id, address, city, mobile, gst_number || null]
        );
        res.status(201).json({ id: result.insertId, message: 'Account created' });
    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: error.message });
    }
};

// Search accounts
exports.searchAccounts = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM accounts WHERE name LIKE ?', [`%${query}%`]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
