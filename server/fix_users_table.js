const db = require('./config/db');

async function fixUsersTable() {
    try {
        console.log('Checking for app_users table (using alternative name to bypass corruption)...');

        const [tables] = await db.query("SHOW TABLES LIKE 'app_users'");

        if (tables.length === 0) {
            console.log('app_users table missing. Creating it...');
            const createTableQuery = `
                CREATE TABLE app_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) NOT NULL UNIQUE,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(20) DEFAULT 'admin',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB;
            `;
            await db.query(createTableQuery);
            console.log('app_users table created successfully.');

            // Insert default admin user
            const insertUserQuery = `INSERT INTO app_users (username, password, role) VALUES ('admin', 'admin123', 'admin')`;
            await db.query(insertUserQuery);
            console.log('Default admin user inserted.');
        } else {
            console.log('app_users table already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing users table:', error);
        process.exit(1);
    }
}

fixUsersTable();
