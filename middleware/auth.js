const User = require('../models/User');

// Require login
exports.requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please login to continue');
    return res.redirect('/auth/login');
  }
  next();
};

// Require admin
exports.requireAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please login');
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user || user.role !== 'admin') {
      req.flash('error', 'Admin access only');
      return res.redirect('/');
    }
    res.locals.currentUser = user;
    next();
  } catch (e) {
    next(e);
  }
};

// Require seller or admin
exports.requireSeller = async (req, res, next) => {
  if (!req.session.userId) {
    req.flash('error', 'Please login');
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      req.flash('error', 'Seller access only');
      return res.redirect('/');
    }
    res.locals.currentUser = user;
    next();
  } catch (e) {
    next(e);
  }
};

// Set currentUser on all requests
exports.setCurrentUser = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId).select('-password');
      if (user && !user.isBlocked) {
        res.locals.currentUser = user;
      } else {
        req.session.destroy();
        res.locals.currentUser = null;
      }
    } else {
      res.locals.currentUser = null;
    }
    next();
  } catch (e) {
    res.locals.currentUser = null;
    next();
  }
};

// Prevent blocked users
exports.checkBlocked = async (req, res, next) => {
  if (req.session.userId) {
    const user = await User.findById(req.session.userId);
    if (user && user.isBlocked) {
      req.session.destroy();
      req.flash('error', 'Your account has been blocked');
      return res.redirect('/auth/login');
    }
  }
  next();
};
