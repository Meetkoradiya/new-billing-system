const db = require('../config/db');

exports.getStockSummary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.name as item_name,
                i.unit,
                IFNULL(curr_stock.stock, 0) as current_stock,
                IFNULL(p.total_purchased, 0) as total_purchased,
                IFNULL(s.total_sold, 0) as total_sold
            FROM items i
            LEFT JOIN (SELECT id, stock FROM items) curr_stock ON i.id = curr_stock.id
            LEFT JOIN (
                SELECT item_id, SUM(qty) as total_purchased 
                FROM purchase_detail 
                GROUP BY item_id
            ) p ON i.id = p.item_id
            LEFT JOIN (
                SELECT item_id, SUM(qty) as total_sold 
                FROM sales_detail 
                GROUP BY item_id
            ) s ON i.id = s.item_id
            ORDER BY i.name
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
