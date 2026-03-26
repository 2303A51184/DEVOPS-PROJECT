require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const connectDB = require('./config/db');
const { setCurrentUser, checkBlocked } = require('./middleware/auth');
const productCtrl = require('./controllers/productController');

const app = express();

// Connect DB
connectDB();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Method override
app.use(methodOverride('_method'));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Flash messages
app.use(flash());

// Locals middleware
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.info = req.flash('info');
  next();
});

// Set current user on all views
app.use(setCurrentUser);
app.use(checkBlocked);

// Cart count for navbar
app.use(async (req, res, next) => {
  try {
    if (req.session.userId) {
      const Cart = require('./models/Cart');
      const cart = await Cart.findOne({ user: req.session.userId });
      res.locals.cartCount = cart ? cart.items.reduce((sum, i) => sum + i.quantity, 0) : 0;
    } else {
      res.locals.cartCount = 0;
    }
  } catch (e) {
    res.locals.cartCount = 0;
  }
  next();
});

// Routes
app.get('/', productCtrl.getHomepage);
app.use('/auth', require('./routes/auth'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/wishlist', require('./routes/wishlist'));
app.use('/orders', require('./routes/orders'));
app.use('/profile', require('./routes/user'));
app.use('/seller', require('./routes/seller'));
app.use('/admin', require('./routes/admin'));

// 404
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found' });
});

// 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('errors/500', { title: 'Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

module.exports = app;
