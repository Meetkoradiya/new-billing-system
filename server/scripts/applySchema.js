const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load env from server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const schemaPath = path.join(__dirname, '..', 'database', 'schema_updates.sql');

async function runSchema() {
    try {
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');

        // Create connection with multipleStatements: true
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to database. Running schema updates...');

        await connection.query(sqlContent);

        console.log('✅ Schema updated successfully!');
        await connection.end();
    } catch (error) {
        console.error('❌ Error updating schema:', error);
        process.exit(1);
    }
}

runSchema();
