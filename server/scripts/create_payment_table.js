require('dotenv').config();
const mysql = require('mysql2/promise');

async function createPaymentTable() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'agro_billing'
        });

        console.log('Connected to database.');

        const sql = `
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                payment_date DATE NOT NULL,
                account_id INT NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                payment_mode VARCHAR(20) DEFAULT 'Cash',
                type ENUM('receipt', 'payment') NOT NULL DEFAULT 'receipt',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
            ) ENGINE=InnoDB;
        `;

        await connection.query(sql);
        console.log('Payments table created/verified.');

        await connection.end();
    } catch (error) {
        console.error('Error creating payments table:', error);
    }
}

createPaymentTable();
