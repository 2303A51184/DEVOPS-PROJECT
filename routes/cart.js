const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

router.get('/', ctrl.getCart);
router.post('/add', ctrl.addToCart);
router.post('/update', ctrl.updateCart);
router.post('/remove', ctrl.removeFromCart);
router.post('/clear', ctrl.clearCart);

module.exports = router;
