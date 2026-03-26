const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { requireSeller } = require('../middleware/auth');
const upload = require('../config/multer');

router.use(requireSeller);

router.get('/products', ctrl.getSellerProducts);
router.get('/products/new', ctrl.getAddProduct);
router.post('/products', upload.array('images', 5), ctrl.postAddProduct);
router.get('/products/:id/edit', ctrl.getEditProduct);
router.put('/products/:id', upload.array('images', 5), ctrl.putEditProduct);
router.delete('/products/:id', ctrl.deleteProduct);

module.exports = router;
