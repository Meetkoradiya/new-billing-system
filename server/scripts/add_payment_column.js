const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to DB');

        // Check if column exists
        const [columns] = await conn.query("SHOW COLUMNS FROM sales_head LIKE 'payment_mode'");
        if (columns.length === 0) {
            console.log('Adding payment_mode column...');
            await conn.query("ALTER TABLE sales_head ADD COLUMN payment_mode VARCHAR(20) DEFAULT 'Cash' AFTER grand_total");
            console.log('Column added successfully.');
        } else {
            console.log('Column payment_mode already exists.');
        }

        await conn.end();
    } catch (e) {
        console.error('Error:', e);
    }
})();
