const db = require('../config/db');

async function createUsersTable() {
    try {
        console.log('🔌 Verifying Users Table...');

        // 1. Create Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS app_users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'admin',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);
        console.log('✅ app_users table checked/created.');

        // 2. Insert Admin User
        // Note: In a real app, passwords should be hashed (e.g., bcrypt). 
        // For this existing setup, it seems plain text is used based on the schema file.
        await db.query(`
            INSERT IGNORE INTO app_users (username, password, role) 
            VALUES ('admin', 'admin123', 'admin');
        `);
        console.log('✅ Admin user (admin/admin123) ensured.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating users table:', error);
        process.exit(1);
    }
}

createUsersTable();
