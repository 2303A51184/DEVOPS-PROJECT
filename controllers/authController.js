const User = require('../models/User');
const { validationResult } = require('express-validator');

// GET /auth/register
exports.getRegister = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register', { title: 'Register' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array()[0].msg);
    return res.redirect('/auth/register');
  }
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash('error', 'Email already registered');
      return res.redirect('/auth/register');
    }
    const user = await User.create({ name, email, password, phone });
    req.session.userId = user._id;
    req.session.role = user.role;
    req.flash('success', `Welcome, ${user.name}!`);
    res.redirect('/');
  } catch (err) {
    req.flash('error', 'Registration failed');
    res.redirect('/auth/register');
  }
};

// GET /auth/login
exports.getLogin = (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', { title: 'Login' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/login');
    }
    if (user.isBlocked) {
      req.flash('error', 'Your account has been blocked');
      return res.redirect('/auth/login');
    }
    user.lastLogin = new Date();
    user.activityLog.push({ action: 'login' });
    await user.save();
    req.session.userId = user._id;
    req.session.role = user.role;
    req.flash('success', `Welcome back, ${user.name}!`);
    const redirect = req.session.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirect);
  } catch (err) {
    req.flash('error', 'Login failed');
    res.redirect('/auth/login');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
};
