require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function resetDb() {
    try {
        const sqlPath = path.join(__dirname, '../database/full_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Connect without database selected initially to allow DROP DATABASE
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Resetting Database...');
        await connection.query(sql);
        console.log('Database Reset Successfully!');

        await connection.end();
    } catch (error) {
        console.error('Error resetting database:', error);
        process.exit(1);
    }
}

resetDb();
