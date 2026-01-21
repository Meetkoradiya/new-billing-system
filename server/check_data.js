const db = require('./config/db');

async function checkData() {
    try {
        console.log('--- Checking Database Content ---');

        // Check Accounts
        const [accounts] = await db.query('SELECT * FROM accounts');
        console.log(`Total Accounts Found: ${accounts.length}`);
        if (accounts.length > 0) {
            console.table(accounts);
        } else {
            console.log('⚠️  Accounts table is EMPTY!');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error checking data:', error);
        process.exit(1);
    }
}

checkData();
