const db = require('../config/db');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login Attempt: Username=${username}, Password=${password ? '******' : 'MISSING'}`);

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

        if (rows.length > 0) {
            const user = rows[0];
            // Remove password from response
            delete user.password;

            res.json({
                success: true,
                message: 'Login successful',
                user: user
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error Full:', error);

        if (error.code === 'ER_NO_SUCH_TABLE') {
            return res.status(500).json({
                success: false,
                message: 'Database not setup. Please run the SQL command to create the "users" table.'
            });
        }

        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
