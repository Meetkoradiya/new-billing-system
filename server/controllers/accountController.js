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

// Delete account
exports.deleteAccount = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM accounts WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ message: 'Cannot delete account because it has associated bills.' });
        } else {
            console.error('Error deleting account:', error);
            res.status(500).json({ message: error.message });
        }
    }
};
