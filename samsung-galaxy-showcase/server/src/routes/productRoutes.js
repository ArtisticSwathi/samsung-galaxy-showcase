const express = require('express');
const router = express.Router();
const { getProducts, getNewlyLaunched } = require('../controllers/productController');

router.get('/', getProducts);
router.get('/newly-launched', getNewlyLaunched);

module.exports = router;
