const db = require('./config/db');

async function fixAccountsTable() {
    try {
        console.log('Checking for accounts table...');

        // Try to select to check if it's accessible (handles "doesn't exist in engine" corruption)
        try {
            await db.query("SELECT 1 FROM accounts LIMIT 1");
            console.log('Accounts table exists and is accessible.');
        } catch (err) {
            console.log('Error accessing accounts table (might be corrupted or missing):', err.message);
            console.log('Attempting to drop and recreate...');

            // Drop if exists (in case of corruption)
            try {
                await db.query("DROP TABLE IF EXISTS accounts");
                console.log('Dropped accounts table if it existed.');
            } catch (dropErr) {
                console.log('Error dropping table (might be fine):', dropErr.message);
            }

            const createTableQuery = `
                CREATE TABLE accounts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(150) NOT NULL,
                    group_id INT DEFAULT 1 COMMENT '1=Farmer, 2=Supplier',
                    mobile VARCHAR(15),
                    address TEXT,
                    city VARCHAR(100),
                    gst_number VARCHAR(20),
                    balance DECIMAL(15,2) DEFAULT 0.00,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB;
            `;
            await db.query(createTableQuery);
            console.log('Accounts table created successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error fixing accounts table:', error);
        process.exit(1);
    }
}

fixAccountsTable();
