const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/wishlistController');
const { requireLogin } = require('../middleware/auth');

router.use(requireLogin);

router.get('/', ctrl.getWishlist);
router.post('/toggle', ctrl.toggleWishlist);
router.post('/move-to-cart', ctrl.moveToCart);

module.exports = router;
