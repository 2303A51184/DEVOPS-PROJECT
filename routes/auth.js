const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');

const registerRules = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/[A-Z]/).withMessage('Password must have at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must have at least one number')
];

router.get('/register', ctrl.getRegister);
router.post('/register', registerRules, ctrl.postRegister);
router.get('/login', ctrl.getLogin);
router.post('/login', ctrl.postLogin);
router.post('/logout', ctrl.logout);

module.exports = router;
