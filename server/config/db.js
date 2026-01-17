const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Promisify for Node.js async/await usage
const promisePool = pool.promise();

const testConnection = async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1');
    console.log('✅ MySQL Adapter Connected Successfully');
  } catch (error) {
    console.error('❌ Database Connection Failed:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
        console.log('⚠️ Database might not exist. Please run the schema.sql script.');
    }
  }
};

testConnection();

module.exports = promisePool;
