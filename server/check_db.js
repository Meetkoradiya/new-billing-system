const db = require('./config/db');

async function checkItems() {
    try {
        const [rows] = await db.query('SELECT count(*) as count FROM items');
        console.log('Item Count:', rows[0].count);

        if (rows[0].count > 0) {
            const [items] = await db.query('SELECT * FROM items LIMIT 5');
            console.log('Sample Items:', items);
        } else {
            console.log('No items found in database.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Database Error:', error);
        process.exit(1);
    }
}

checkItems();
