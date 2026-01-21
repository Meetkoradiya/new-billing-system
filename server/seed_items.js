const db = require('./config/db');

async function seedItems() {
    try {
        console.log('Seeding items...');

        const items = [
            { name: 'Urea 50Kg', company: 'IFFCO', category: 'Fertilizer', purchase_rate: 260, sales_rate: 266.5, stock: 100, unit: 'Bag' },
            { name: 'DAP 50Kg', company: 'IPL', category: 'Fertilizer', purchase_rate: 1300, sales_rate: 1350, stock: 50, unit: 'Bag' },
            { name: 'Roundup 1L', company: 'Monsanto', category: 'Pesticide', purchase_rate: 450, sales_rate: 550, stock: 200, unit: 'Ltr' },
            { name: 'Cotton Seeds', company: 'Kaveri', category: 'Seeds', purchase_rate: 700, sales_rate: 850, stock: 0, unit: 'Pkt' }
        ];

        for (const item of items) {
            await db.query(`
                INSERT INTO items (name, company, category, purchase_rate, sales_rate, stock, unit) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [item.name, item.company, item.category, item.purchase_rate, item.sales_rate, item.stock, item.unit]
            );
        }

        console.log(`✅ Added ${items.length} sample items.`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding items:', error);
        process.exit(1);
    }
}

seedItems();
