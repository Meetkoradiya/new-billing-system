const db = require('./config/db');

async function fixAllTables() {
    console.log('--- STARTING COMPREHENSIVE TABLE CHECK & REPAIR ---');

    const tables = [
        {
            name: 'items',
            create: `CREATE TABLE items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                company VARCHAR(100),
                category VARCHAR(50) DEFAULT 'Pesticide',
                code VARCHAR(50),
                unit VARCHAR(20) DEFAULT 'Nos',
                purchase_rate DECIMAL(15,2) DEFAULT 0.00,
                sales_rate DECIMAL(15,2) DEFAULT 0.00,
                gst_percent DECIMAL(5,2) DEFAULT 0.00,
                stock DECIMAL(15,2) DEFAULT 0.00,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;`
        },
        {
            name: 'sales_head',
            create: `CREATE TABLE sales_head (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bill_no VARCHAR(20) NOT NULL UNIQUE,
                bill_date DATE NOT NULL,
                account_id INT NOT NULL,
                sub_total DECIMAL(15,2) DEFAULT 0.00,
                grand_total DECIMAL(15,2) DEFAULT 0.00,
                payment_mode VARCHAR(20) DEFAULT 'Cash',
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_sales_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'sales_detail',
            create: `CREATE TABLE sales_detail (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sales_id INT NOT NULL,
                item_id INT NOT NULL,
                qty DECIMAL(15,2) NOT NULL,
                rate DECIMAL(15,2) NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                CONSTRAINT fk_sales_head FOREIGN KEY (sales_id) REFERENCES sales_head(id) ON DELETE CASCADE,
                CONSTRAINT fk_sales_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'purchase_head',
            create: `CREATE TABLE purchase_head (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bill_no VARCHAR(20) NOT NULL UNIQUE,
                bill_date DATE NOT NULL,
                account_id INT NOT NULL,
                sub_total DECIMAL(15,2) DEFAULT 0.00,
                grand_total DECIMAL(15,2) DEFAULT 0.00,
                remarks TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT fk_purchase_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON UPDATE CASCADE
            ) ENGINE=InnoDB;`
        },
        {
            name: 'purchase_detail',
            create: `CREATE TABLE purchase_detail (
                id INT AUTO_INCREMENT PRIMARY KEY,
                purchase_id INT NOT NULL,
                item_id INT NOT NULL,
                qty DECIMAL(15,2) NOT NULL,
                rate DECIMAL(15,2) NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                CONSTRAINT fk_purchase_head FOREIGN KEY (purchase_id) REFERENCES purchase_head(id) ON DELETE CASCADE,
                CONSTRAINT fk_purchase_item FOREIGN KEY (item_id) REFERENCES items(id) ON UPDATE CASCADE
            ) ENGINE=InnoDB;`
        }
    ];

    for (const table of tables) {
        try {
            process.stdout.write(`Checking ${table.name}... `);
            await db.query(`SELECT 1 FROM ${table.name} LIMIT 1`);
            console.log('✅ OK');
        } catch (error) {
            console.log('❌ CORRUPTED/MISSING');
            console.log(`   Attempting to fix ${table.name}...`);

            // Force Drop
            try { await db.query(`DROP TABLE IF EXISTS ${table.name}`); } catch (e) { }

            // Recreate
            try {
                await db.query(table.create);
                console.log(`   ✅ Recreated ${table.name}`);
            } catch (createError) {
                console.error(`   ❌ FAILED to recreate ${table.name}:`, createError.message);
            }
        }
    }

    process.exit(0);
}

fixAllTables();
