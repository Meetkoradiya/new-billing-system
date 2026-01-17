const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Configure dotenv to read from the server/.env file
dotenv.config({ path: path.join(__dirname, '../.env') });

async function initAuth() {
    console.log('🔌 Connecting to database...');
    console.log('Host:', process.env.DB_HOST);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'agro_billing',
        multipleStatements: true
    });

    console.log('✅ Connected.');

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'admin',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Using INSERT IGNORE to avoid duplicate entry error
    const insertUserQuery = `
        INSERT IGNORE INTO users (username, password, role) 
        VALUES ('admin', 'admin123', 'admin');
    `;

    try {
        console.log('🔨 Creating users table...');
        await connection.query(createTableQuery);
        console.log('✅ Users table ensured.');

        console.log('👤 Creating admin user...');
        await connection.query(insertUserQuery);
        console.log('✅ Admin user ensured (admin/admin123).');

    } catch (err) {
        console.error('❌ Error initializing auth DB:', err);
    } finally {
        await connection.end();
        console.log('👋 Done.');
    }
}

initAuth();
