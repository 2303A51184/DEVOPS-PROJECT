const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    res.render('user/profile', { title: 'My Profile', user });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = { name, phone };
    if (req.file) update.avatar = req.file.filename;
    await User.findByIdAndUpdate(req.session.userId, update);
    req.flash('success', 'Profile updated');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Update failed');
    res.redirect('/profile');
  }
};

// PUT /profile/password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.userId);
    const valid = await user.matchPassword(currentPassword);
    if (!valid) {
      req.flash('error', 'Current password incorrect');
      return res.redirect('/profile');
    }
    user.password = newPassword;
    await user.save();
    req.flash('success', 'Password changed');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/profile');
  }
};

// POST /profile/address
exports.addAddress = async (req, res) => {
  try {
    const { fullName, phone, pincode, street, city, state } = req.body;
    const user = await User.findById(req.session.userId);
    const isDefault = user.addresses.length === 0;
    user.addresses.push({ fullName, phone, pincode, street, city, state, isDefault });
    await user.save();
    req.flash('success', 'Address added');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/profile');
  }
};

// DELETE /profile/address/:idx
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    user.addresses.splice(Number(req.params.idx), 1);
    await user.save();
    req.flash('success', 'Address removed');
    res.redirect('/profile');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('/profile');
  }
};
