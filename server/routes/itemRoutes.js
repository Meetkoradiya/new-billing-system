const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.get('/', itemController.getAllItems);
router.post('/', itemController.createItem);
router.get('/search', itemController.searchItems);
router.put('/:id/stock', itemController.addStock);
router.delete('/:id', itemController.deleteItem);

module.exports = router;
