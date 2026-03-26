const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// GET /admin/dashboard
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // Monthly sales (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const monthlySales = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category distribution
    const categoryDist = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      stats: { totalUsers, totalSellers, totalProducts, totalOrders, totalRevenue },
      monthlySales: JSON.stringify(monthlySales),
      categoryDist: JSON.stringify(categoryDist),
      recentOrders
    });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// GET /admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// POST /admin/users/:id/role
exports.updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'seller'].includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('/admin/users');
    }
    await User.findByIdAndUpdate(req.params.id, { role });
    req.flash('success', 'Role updated');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/admin/users');
  }
};

// POST /admin/users/:id/block
exports.toggleBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { req.flash('error', 'User not found'); return res.redirect('/admin/users'); }
    user.isBlocked = !user.isBlocked;
    await user.save();
    req.flash('success', `User ${user.isBlocked ? 'blocked' : 'unblocked'}`);
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/admin/users');
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success', 'User deleted');
    res.redirect('/admin/users');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/admin/users');
  }
};

// GET /admin/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.render('admin/orders', { title: 'All Orders', orders });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// POST /admin/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) { req.flash('error', 'Order not found'); return res.redirect('/admin/orders'); }
    order.orderStatus = status;
    order.statusHistory.push({ status, note: 'Updated by admin' });
    await order.save();
    req.flash('success', 'Order status updated');
    res.redirect('/admin/orders');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/admin/orders');
  }
};

// GET /admin/products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('seller', 'name');
    res.render('admin/products', { title: 'All Products', products });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};
