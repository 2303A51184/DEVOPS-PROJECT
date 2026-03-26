const Product = require('../models/Product');
const User = require('../models/User');

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports', 'Toys', 'Beauty', 'Groceries', 'Mobiles', 'Appliances'];

// GET / (Homepage)
exports.getHomepage = async (req, res) => {
  try {
    const featured = await Product.find({ isFeatured: true, stock: { $gt: 0 } }).limit(8).populate('seller', 'name');
    const trending = await Product.find({ isTrending: true, stock: { $gt: 0 } }).limit(8).populate('seller', 'name');
    const newArrivals = await Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(8).populate('seller', 'name');
    res.render('user/home', { title: 'ShopNow - Best Deals Online', featured, trending, newArrivals, categories: CATEGORIES });
  } catch (err) {
    next(err);
  }
};

// GET /products
exports.getProducts = async (req, res) => {
  try {
    const { search, category, sort, minPrice, maxPrice, rating, page = 1 } = req.query;
    const limit = 12;
    const skip = (page - 1) * limit;
    let query = { stock: { $gt: 0 } };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (rating) query.averageRating = { $gte: Number(rating) };

    let sortObj = {};
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { averageRating: -1 };
    else if (sort === 'newest') sortObj = { createdAt: -1 };
    else sortObj = { createdAt: -1 };

    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortObj).skip(skip).limit(limit).populate('seller', 'name');
    const totalPages = Math.ceil(total / limit);

    res.render('products/list', {
      title: 'Products', products, categories: CATEGORIES,
      currentPage: Number(page), totalPages, total,
      query: req.query
    });
  } catch (err) {
    res.status(500).render('errors/500');
  }
};

// GET /products/:id
exports.getProductDetail = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name').populate('reviews.user', 'name avatar');
    if (!product) return res.status(404).render('errors/404');
    const related = await Product.find({ category: product.category, _id: { $ne: product._id }, stock: { $gt: 0 } }).limit(4);
    res.render('products/detail', { title: product.name, product, related });
  } catch (err) {
    res.status(404).render('errors/404');
  }
};

// GET /products/search/suggestions (AJAX)
exports.getSearchSuggestions = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q || q.length < 2) return res.json([]);
    const products = await Product.find({
      name: { $regex: q, $options: 'i' }
    }).select('name category').limit(6);
    res.json(products);
  } catch (err) {
    res.json([]);
  }
};

// --- SELLER/ADMIN Product Management ---

// GET /seller/products/new
exports.getAddProduct = (req, res) => {
  res.render('products/add', { title: 'Add Product', categories: CATEGORIES });
};

// POST /seller/products
exports.postAddProduct = async (req, res) => {
  try {
    const { name, brand, description, price, discount, stock, category, subcategory, tags, isFeatured, isTrending } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];
    if (images.length === 0) {
      req.flash('error', 'At least one product image required');
      return res.redirect('/seller/products/new');
    }
    await Product.create({
      name, brand, description,
      price: Number(price),
      discount: Number(discount) || 0,
      stock: Number(stock),
      category, subcategory,
      images,
      seller: req.session.userId,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      isFeatured: isFeatured === 'on',
      isTrending: isTrending === 'on'
    });
    req.flash('success', 'Product added successfully');
    res.redirect('/seller/products');
  } catch (err) {
    req.flash('error', 'Failed to add product: ' + err.message);
    res.redirect('/seller/products/new');
  }
};

// GET /seller/products
exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.session.userId }).sort({ createdAt: -1 });
    res.render('products/seller-list', { title: 'My Products', products });
  } catch (err) {
    next(err);
  }
};

// GET /seller/products/:id/edit
exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.userId });
    if (!product) { req.flash('error', 'Product not found'); return res.redirect('/seller/products'); }
    res.render('products/edit', { title: 'Edit Product', product, categories: CATEGORIES });
  } catch (err) {
    res.redirect('/seller/products');
  }
};

// PUT /seller/products/:id
exports.putEditProduct = async (req, res) => {
  try {
    const { name, brand, description, price, discount, stock, category, subcategory, isFeatured, isTrending } = req.body;
    const product = await Product.findOne({ _id: req.params.id, seller: req.session.userId });
    if (!product) { req.flash('error', 'Not found'); return res.redirect('/seller/products'); }

    product.name = name;
    product.brand = brand;
    product.description = description;
    product.price = Number(price);
    product.discount = Number(discount) || 0;
    product.stock = Number(stock);
    product.category = category;
    product.subcategory = subcategory;
    product.isFeatured = isFeatured === 'on';
    product.isTrending = isTrending === 'on';
    if (req.files && req.files.length > 0) {
      product.images = req.files.map(f => f.filename);
    }
    await product.save();
    req.flash('success', 'Product updated');
    res.redirect('/seller/products');
  } catch (err) {
    req.flash('error', 'Update failed');
    res.redirect('/seller/products');
  }
};

// DELETE /seller/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const user = res.locals.currentUser;
    const query = user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, seller: req.session.userId };
    await Product.findOneAndDelete(query);
    req.flash('success', 'Product deleted');
    res.redirect('back');
  } catch (err) {
    req.flash('error', 'Delete failed');
    res.redirect('back');
  }
};

// POST /products/:id/review
exports.postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    const user = res.locals.currentUser;
    const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.session.userId.toString());
    if (alreadyReviewed) {
      req.flash('error', 'You have already reviewed this product');
      return res.redirect(`/products/${req.params.id}`);
    }
    product.reviews.push({ user: req.session.userId, name: user.name, rating: Number(rating), comment });
    product.updateRating();
    await product.save();
    req.flash('success', 'Review added');
    res.redirect(`/products/${req.params.id}`);
  } catch (err) {
    req.flash('error', 'Review failed');
    res.redirect('back');
  }
};

// DELETE /products/:id/review/:reviewId
exports.deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.reviews = product.reviews.filter(r => r._id.toString() !== req.params.reviewId);
    product.updateRating();
    await product.save();
    req.flash('success', 'Review removed');
    res.redirect('back');
  } catch (err) {
    req.flash('error', 'Failed');
    res.redirect('back');
  }
};
