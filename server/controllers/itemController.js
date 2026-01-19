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
    const { name, company, category, code, sales_rate, purchase_rate, gst_percent, unit } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO items (name, company, category, code, sales_rate, purchase_rate, gst_percent, unit, stock) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, company || '', category, code, sales_rate, purchase_rate, gst_percent, unit, req.body.stock || 0]
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

// Add Stock (Quick Adjustment)
exports.addStock = async (req, res) => {
    const { id } = req.params;
    const { qty } = req.body;
    try {
        await db.query('UPDATE items SET stock = stock + ? WHERE id = ?', [qty, id]);
        res.json({ message: 'Stock updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
