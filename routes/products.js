const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const { requireLogin, requireSeller } = require('../middleware/auth');
const upload = require('../config/multer');

// Public
router.get('/', ctrl.getProducts);
router.get('/search/suggestions', ctrl.getSearchSuggestions);
router.get('/:id', ctrl.getProductDetail);

// Reviews (login required)
router.post('/:id/review', requireLogin, ctrl.postReview);
router.delete('/:id/review/:reviewId', requireLogin, ctrl.deleteReview);

module.exports = router;
