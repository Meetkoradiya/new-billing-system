const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);
router.get('/search', accountController.searchAccounts);
router.delete('/:id', accountController.deleteAccount);

module.exports = router;
