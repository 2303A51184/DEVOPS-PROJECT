const User = require('../models/User');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /wishlist
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('wishlist');
    res.render('user/wishlist', { title: 'My Wishlist', wishlist: user.wishlist });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// POST /wishlist/toggle
exports.toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.session.userId);
    const idx = user.wishlist.indexOf(productId);
    if (idx > -1) {
      user.wishlist.splice(idx, 1);
      req.flash('info', 'Removed from wishlist');
    } else {
      user.wishlist.push(productId);
      req.flash('success', 'Added to wishlist');
    }
    await user.save();
    res.redirect('back');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('back');
  }
};

// POST /wishlist/move-to-cart
exports.moveToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.stock < 1) {
      req.flash('error', 'Product unavailable');
      return res.redirect('/wishlist');
    }
    const price = product.discountedPrice || product.price;
    let cart = await Cart.findOne({ user: req.session.userId });
    if (!cart) cart = new Cart({ user: req.session.userId, items: [] });
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx === -1) cart.items.push({ product: productId, quantity: 1, price });
    await cart.save();

    // Remove from wishlist
    await User.findByIdAndUpdate(req.session.userId, { $pull: { wishlist: productId } });
    req.flash('success', 'Moved to cart');
    res.redirect('/cart');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/wishlist');
  }
};
