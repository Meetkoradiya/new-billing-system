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

        console.log('Connected to Database');

        // Fix "parfect" -> "Perfect"
        const [res] = await conn.query("UPDATE items SET company = 'Perfect' WHERE company LIKE 'parfect' OR company LIKE 'Parfect'");
        console.log('Fixed Typo:', res.info);

        // Also ensure flakon specifically is fixed if it had no company or bad company
        const [res2] = await conn.query("UPDATE items SET company = 'Perfect' WHERE name = 'flakon' AND (company = '' OR company IS NULL OR company LIKE 'parfect')");
        console.log('Fixed Flakon:', res2.info);

        await conn.end();
    } catch (e) {
        console.error('Error:', e);
    }
})();
