require('dotenv').config();
const mysql = require('mysql2/promise');

async function addBalanceColumn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'agro_billing'
        });

        console.log('Connected to database.');

        // Add balance column to accounts
        try {
            await connection.query("ALTER TABLE accounts ADD COLUMN balance DECIMAL(15,2) DEFAULT 0.00 AFTER city");
            console.log('Added balance column to accounts table.');
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('balance column already exists in accounts table.');
            } else {
                throw err;
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error adding column:', error);
    }
}

addBalanceColumn();
