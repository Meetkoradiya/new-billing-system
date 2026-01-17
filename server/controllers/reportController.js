const db = require('../config/db');

exports.getStockSummary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.item_name,
                i.unit,
                IFNULL(p.total_purchased, 0) as total_purchased,
                IFNULL(s.total_sold, 0) as total_sold,
                (IFNULL(p.total_purchased, 0) - IFNULL(s.total_sold, 0)) as current_stock
            FROM items i
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
            ORDER BY i.item_name
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
