const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const schemaPath = path.join(__dirname, '..', 'database', 'full_schema.sql');

async function runSchema() {
    try {
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');

        // 1. Connect to MySQL Server (checking if DB exists)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true // Keep this for SET FOREIGN_KEY_CHECKS
        });

        console.log('🔄 Checking Database...');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);

        console.log('🔄 Applying Schema Tables...');

        // Disable FK checks to allow dropping tables in any order
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Execute the full schema
        await connection.query(sqlContent);

        // Re-enable FK checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('✅ Full Database Tables Created Successfully!');

        await connection.end();
    } catch (error) {
        console.error('❌ Error executing schema:', error);
        process.exit(1);
    }
}

runSchema();
