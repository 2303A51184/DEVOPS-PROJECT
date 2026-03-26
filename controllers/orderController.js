const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// GET /checkout
exports.getCheckout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Cart is empty');
      return res.redirect('/cart');
    }
    const user = await User.findById(req.session.userId);
    res.render('orders/checkout', { title: 'Checkout', cart, user });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// POST /checkout/place-order
exports.placeOrder = async (req, res) => {
  try {
    const { addressIndex, paymentMethod, simulatePayment } = req.body;
    const cart = await Cart.findOne({ user: req.session.userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Cart is empty');
      return res.redirect('/cart');
    }
    const user = await User.findById(req.session.userId);
    const address = user.addresses[Number(addressIndex)];
    if (!address) {
      req.flash('error', 'Please select a valid address');
      return res.redirect('/checkout');
    }

    // Simulate payment
    let paymentStatus = 'Pending';
    if (paymentMethod === 'ONLINE') {
      paymentStatus = simulatePayment === 'success' ? 'Paid' : 'Failed';
      if (paymentStatus === 'Failed') {
        req.flash('error', 'Payment failed. Try again or use COD.');
        return res.redirect('/checkout');
      }
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images[0],
      price: item.price,
      quantity: item.quantity
    }));

    const subtotal = cart.subtotal;
    const tax = cart.tax;
    const total = cart.total;

    const order = await Order.create({
      user: req.session.userId,
      items,
      shippingAddress: address,
      paymentMethod,
      paymentStatus,
      subtotal, tax, total,
      invoiceId: 'INV-' + uuidv4().slice(0, 8).toUpperCase(),
      statusHistory: [{ status: 'Pending', note: 'Order placed' }]
    });

    // Reduce stock
    for (const item of cart.items) {
      await require('../models/Product').findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.session.userId }, { items: [] });

    req.flash('success', 'Order placed successfully!');
    res.redirect(`/orders/${order._id}`);
  } catch (err) {
    req.flash('error', 'Order failed: ' + err.message);
    res.redirect('/checkout');
  }
};

// GET /orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.session.userId }).sort({ createdAt: -1 });
    res.render('orders/list', { title: 'My Orders', orders });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// GET /orders/:id
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.session.userId });
    if (!order) return res.status(404).render('errors/404');
    res.render('orders/detail', { title: 'Order Details', order });
  } catch (err) {
    res.status(404).render('errors/404');
  }
};

// POST /orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.session.userId });
    if (!order) return res.status(404).json({ error: 'Not found' });
    if (!['Pending', 'Confirmed'].includes(order.orderStatus)) {
      req.flash('error', 'Order cannot be cancelled at this stage');
      return res.redirect(`/orders/${order._id}`);
    }
    order.orderStatus = 'Cancelled';
    order.cancelReason = req.body.reason || 'User requested';
    order.statusHistory.push({ status: 'Cancelled', note: order.cancelReason });
    await order.save();
    req.flash('success', 'Order cancelled');
    res.redirect(`/orders/${order._id}`);
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('back');
  }
};

// POST /orders/:id/address  (add address during checkout)
exports.addAddress = async (req, res) => {
  try {
    const { fullName, phone, pincode, street, city, state } = req.body;
    const user = await User.findById(req.session.userId);
    if (user.addresses.length === 0) {
      user.addresses.push({ fullName, phone, pincode, street, city, state, isDefault: true });
    } else {
      user.addresses.push({ fullName, phone, pincode, street, city, state });
    }
    await user.save();
    req.flash('success', 'Address added');
    res.redirect('/checkout');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/checkout');
  }
};
