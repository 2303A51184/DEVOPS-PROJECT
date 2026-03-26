# 🛍️ ShopNow — Full-Scale E-Commerce Platform

A production-ready e-commerce web application built with **Express.js + MongoDB + EJS**, featuring all the core capabilities of Flipkart/Amazon.

---

## ✨ Features

| Module | Features |
|--------|----------|
| 🔐 Auth | Register, Login, Logout, bcrypt hashing, session management, role-based access |
| 🏠 Homepage | Carousel banners, Featured products, Trending, New Arrivals, Category grid |
| 🛍️ Products | Listings, filters (price, rating, category), sorting, search with autocomplete, pagination |
| 📦 Product Detail | Image gallery, ratings, reviews, related products, stock status |
| ⭐ Reviews | Add/delete reviews, 1–5 star rating, average calculation |
| 🛒 Cart | Add/update/remove items, subtotal/tax/total, persistent per user |
| ❤️ Wishlist | Add/remove, move to cart |
| 💳 Checkout | Multi-address, COD & simulated online payment |
| 📋 Orders | Order history, detail view, status timeline, cancellation |
| 👤 Profile | Edit info, upload avatar, change password, manage addresses |
| 🏪 Seller | Add/edit/delete own products, manage listings |
| 👑 Admin | Dashboard with charts, manage users (block/delete/role), all orders, all products |

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** express-session, connect-mongo, bcryptjs
- **Templating:** EJS
- **File Uploads:** Multer
- **Charts:** Chart.js (CDN)
- **Validation:** express-validator

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Fill in MONGO_URI and SESSION_SECRET

# 3. Create upload folder
mkdir -p public/images/uploads

# 4. Start dev server
npm run dev

# 5. Open browser
open http://localhost:3000
```

---

## 📁 Project Structure

```
ecommerce/
├── config/
│   ├── db.js              # MongoDB connection
│   └── multer.js          # File upload config
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── wishlistController.js
│   ├── orderController.js
│   ├── adminController.js
│   └── userController.js
├── middleware/
│   └── auth.js            # Auth guards, setCurrentUser
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── wishlist.js
│   ├── orders.js
│   ├── user.js
│   ├── seller.js
│   └── admin.js
├── views/
│   ├── partials/          # header, footer, product-card
│   ├── auth/              # login, register
│   ├── user/              # home, profile, wishlist
│   ├── products/          # list, detail, add, edit
│   ├── cart/              # index
│   ├── orders/            # checkout, list, detail
│   ├── admin/             # dashboard, users, orders, products
│   └── errors/            # 404, 500
├── public/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/uploads/
├── app.js
├── .env.example
├── .gitignore
├── package.json
└── TEST_CASES.md
```

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Customer** | Browse, cart, wishlist, checkout, orders, reviews, profile |
| **Seller** | All customer features + add/edit/delete own products |
| **Admin** | All features + manage all users, orders, products; view dashboard |

To make a user admin, after registering run in MongoDB shell:
```js
db.users.updateOne({ email: "youremail@test.com" }, { $set: { role: "admin" } })
```

---

## 🧪 Testing

See `TEST_CASES.md` for 100+ test cases covering all modules.

---

## 🔒 Security

- Passwords hashed with bcrypt (12 rounds)
- Session stored in MongoDB (httpOnly cookies)
- Role-based middleware on all protected routes
- EJS auto-escapes all output (XSS protection)
- Input validation via express-validator
- File type/size restriction via Multer
