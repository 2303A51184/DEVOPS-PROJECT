const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const productCtrl = require('../controllers/productController');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/dashboard', ctrl.getDashboard);
router.get('/users', ctrl.getUsers);
router.post('/users/:id/role', ctrl.updateRole);
router.post('/users/:id/block', ctrl.toggleBlock);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/orders', ctrl.getOrders);
router.post('/orders/:id/status', ctrl.updateOrderStatus);
router.get('/products', ctrl.getProducts);
router.delete('/products/:id', productCtrl.deleteProduct);

module.exports = router;
