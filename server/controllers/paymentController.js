const db = require('../config/db');

// Create Receipt (Payment In - from Customer)
exports.createReceipt = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { date, account_id, amount, payment_mode, remarks } = req.body;

        // Insert into payments
        await connection.query(
            'INSERT INTO payments (payment_date, account_id, amount, payment_mode, type, remarks) VALUES (?, ?, ?, ?, ?, ?)',
            [date, account_id, amount, payment_mode || 'Cash', 'receipt', remarks]
        );

        // Update Account Balance (Debit Balance decreases when money is received)
        // Customer has Positive Debit Balance. Receipt reduces it.
        // Balance = Balance - Amount
        await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);

        await connection.commit();
        res.status(201).json({ message: 'Receipt Entry Saved Successfully' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Create Payment (Payment Out - to Supplier)
exports.createPayment = async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const { date, account_id, amount, payment_mode, remarks } = req.body;

        // Insert into payments
        await connection.query(
            'INSERT INTO payments (payment_date, account_id, amount, payment_mode, type, remarks) VALUES (?, ?, ?, ?, ?, ?)',
            [date, account_id, amount, payment_mode || 'Cash', 'payment', remarks]
        );

        // Update Account Balance (If Supplier has Credit Balance (negative in our logic? or we treat supplier balance as Payable?)
        // Let's assume a unified "Balance" column.
        // If "Funds Go Out" (Payment), it reduces our liability (or increases asset).
        // If we owe Supplier 1000 (Credit), and we pay 500. New Balance 500.
        // So balance change depends on how we stored it.
        // If Supplier Balance stored as Positive (Credit), then Payment reduces it.
        // If Client Balance stored as Positive (Debit), then Receipt reduces it.
        // Let's assume Positive = Outstanding (whether Payable or Receivable depends on Group).

        await connection.query('UPDATE accounts SET balance = balance - ? WHERE id = ?', [amount, account_id]);

        await connection.commit();
        res.status(201).json({ message: 'Payment Entry Saved Successfully' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: error.message });
    } finally {
        connection.release();
    }
};

// Get Recent Transactions
exports.getRecentTransactions = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT p.*, a.name as party_name 
            FROM payments p
            JOIN accounts a ON p.account_id = a.id
            ORDER BY p.id DESC LIMIT 20
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
