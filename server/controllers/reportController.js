const db = require('../config/db');

exports.getStockSummary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                i.id,
                i.name as item_name,
                i.unit,
                i.purchase_rate,
                i.sales_rate,
                IFNULL(curr_stock.stock, 0) as current_stock,
                (IFNULL(curr_stock.stock, 0) * i.purchase_rate) as stock_value,
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

exports.getPaymentStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = `
            SELECT 
                payment_mode, 
                COUNT(*) as count, 
                SUM(grand_total) as total_amount 
            FROM sales_head 
        `;
        const params = [];

        if (startDate && endDate) {
            query += ` WHERE bill_date BETWEEN ? AND ? `;
            params.push(startDate, endDate);
        }

        query += ` GROUP BY payment_mode`;

        const [rows] = await db.query(query, params);

        let stats = {
            cash: { count: 0, total: 0 },
            debit: { count: 0, total: 0 }
        };

        rows.forEach(row => {
            const mode = (row.payment_mode || 'Cash').toLowerCase();
            if (mode === 'cash') {
                stats.cash.count = row.count;
                stats.cash.total = parseFloat(row.total_amount || 0);
            } else if (mode === 'debit') {
                stats.debit.count = row.count;
                stats.debit.total = parseFloat(row.total_amount || 0);
            }
        });

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
