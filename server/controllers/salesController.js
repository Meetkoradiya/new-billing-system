const db = require('../config/db');

// Create Sales Invoice
exports.createSale = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { bill_no, bill_date, account_id, payment_mode, items, remarks } = req.body;
        // Calculate totals server-side for security (or trust client for now/MVP)
        // We will trust client sent totals for MVP simplicity or recalculate.
        // Let's recalculate basic totals.
        let sub_total = 0;
        const details = [];

        // Verify items and calc totals
        for (const item of items) {
            const amount = parseFloat(item.qty) * parseFloat(item.rate);
            sub_total += amount;
            details.push({ ...item, amount });
        }

        // Simple logic: no extra discount/tax on head for now, just sum
        const grand_total = sub_total;

        // Insert Head
        const [headResult] = await connection.query(
            'INSERT INTO sales_head (bill_no, bill_date, account_id, sub_total, grand_total, payment_mode, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [bill_no, bill_date, account_id, sub_total, grand_total, payment_mode || 'Cash', remarks]
        );
        const sales_id = headResult.insertId;

        // Insert Details
        for (const d of details) {
            await connection.query(
                'INSERT INTO sales_detail (sales_id, item_id, qty, rate, amount) VALUES (?, ?, ?, ?, ?)',
                [sales_id, d.item_id, d.qty, d.rate, d.amount]
            );
            // Stock Update: Decrease on Sale
            await connection.query('UPDATE items SET stock = stock - ? WHERE id = ?', [d.qty, d.item_id]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Bill Saved Successfully', sales_id });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Get All Sales Headers
exports.getAllSales = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, a.name as party_name 
            FROM sales_head s 
            JOIN accounts a ON s.account_id = a.id 
            ORDER BY s.bill_date DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
