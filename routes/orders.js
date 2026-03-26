const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

router.get('/checkout', ctrl.getCheckout);
router.post('/checkout/place-order', ctrl.placeOrder);
router.post('/checkout/address', ctrl.addAddress);
router.get('/', ctrl.getOrders);
router.get('/:id', ctrl.getOrderDetail);
router.post('/:id/cancel', ctrl.cancelOrder);

module.exports = router;
