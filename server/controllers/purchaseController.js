const db = require('../config/db');

// Create Purchase Invoice
exports.createPurchase = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { bill_no, bill_date, account_id, items, remarks } = req.body;
        let sub_total = 0;
        const details = [];

        for (const item of items) {
            const amount = parseFloat(item.qty) * parseFloat(item.rate);
            sub_total += amount;
            details.push({ ...item, amount });
        }

        const grand_total = sub_total;

        const [headResult] = await connection.query(
            'INSERT INTO purchase_head (bill_no, bill_date, account_id, sub_total, grand_total, remarks) VALUES (?, ?, ?, ?, ?, ?)',
            [bill_no, bill_date, account_id, sub_total, grand_total, remarks]
        );
        const purchase_id = headResult.insertId;

        for (const d of details) {
            await connection.query(
                'INSERT INTO purchase_detail (purchase_id, item_id, qty, rate, amount) VALUES (?, ?, ?, ?, ?)',
                [purchase_id, d.item_id, d.qty, d.rate, d.amount]
            );
            // Optional: Increase Stock
            // await connection.query('UPDATE items SET stock = stock + ? WHERE id = ?', [d.qty, d.item_id]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Purchase Bill Saved Successfully', purchase_id });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Get All Purchases
exports.getAllPurchases = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, a.name as party_name 
            FROM purchase_head p 
            JOIN accounts a ON p.account_id = a.id 
            ORDER BY p.bill_date DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
