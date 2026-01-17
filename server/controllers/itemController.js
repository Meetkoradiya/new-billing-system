const db = require('../config/db');

// Get all items
exports.getAllItems = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM items ORDER BY name ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new item
exports.createItem = async (req, res) => {
    const { name, category, code, sales_rate, purchase_rate, gst_percent, unit } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO items (name, category, code, sales_rate, purchase_rate, gst_percent, unit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, code, sales_rate, purchase_rate, gst_percent, unit]
        );
        res.status(201).json({ id: result.insertId, message: 'Item created' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search items
exports.searchItems = async (req, res) => {
    const { query } = req.query;
    try {
        const [rows] = await db.query('SELECT * FROM items WHERE name LIKE ? OR code LIKE ?', [`%${query}%`, `%${query}%`]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
