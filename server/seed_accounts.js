const db = require('./config/db');

async function seedAccounts() {
    try {
        console.log('Seeding accounts...');

        // Insert a sample Farmer
        await db.query(`
            INSERT INTO accounts (name, group_id, mobile, city, address) 
            VALUES ('Ramesh Bhai Patel', 1, '9876543210', 'Anand', 'Village High Street')
        `);
        console.log('✅ Added Sample Farmer: Ramesh Bhai Patel');

        // Insert a sample Company
        await db.query(`
            INSERT INTO accounts (name, group_id, mobile, city, address, gst_number) 
            VALUES ('Agro Super Supplies', 2, '9988776655', 'Ahmedabad', 'GIDC Phase 4', '24ABCDE1234F1Z5')
        `);
        console.log('✅ Added Sample Company: Agro Super Supplies');

        console.log('Seeding complete. You should now see options in the dropdowns.');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding accounts:', error);
        process.exit(1);
    }
}

seedAccounts();
