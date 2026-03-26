const Cart = require('../models/Cart');
const Product = require('../models/Product');

// GET /cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
    res.render('cart/index', { title: 'Shopping Cart', cart });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// POST /cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.stock < 1) {
      req.flash('error', 'Product unavailable');
      return res.redirect('back');
    }
    const price = product.discountedPrice || product.price;
    let cart = await Cart.findOne({ user: req.session.userId });
    if (!cart) {
      cart = new Cart({ user: req.session.userId, items: [] });
    }
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      cart.items[idx].quantity = Math.min(cart.items[idx].quantity + Number(quantity), product.stock);
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity), price });
    }
    await cart.save();
    req.flash('success', 'Added to cart');
    res.redirect('back');
  } catch (err) {
    req.flash('error', 'Failed to add to cart');
    res.redirect('back');
  }
};

// POST /cart/update
exports.updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: req.session.userId });
    if (!cart) return res.redirect('/cart');
    const product = await Product.findById(productId);
    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx > -1) {
      const qty = Math.min(Math.max(Number(quantity), 1), product.stock);
      cart.items[idx].quantity = qty;
    }
    await cart.save();
    res.redirect('/cart');
  } catch (err) {
    res.redirect('/cart');
  }
};

// POST /cart/remove
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    await Cart.findOneAndUpdate(
      { user: req.session.userId },
      { $pull: { items: { product: productId } } }
    );
    req.flash('success', 'Item removed');
    res.redirect('/cart');
  } catch (err) {
    req.flash('error', 'Failed to remove');
    res.redirect('/cart');
  }
};

// POST /cart/clear
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.session.userId }, { items: [] });
    res.redirect('/cart');
  } catch (err) {
    res.redirect('/cart');
  }
};
