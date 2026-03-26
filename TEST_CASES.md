# ShopNow E-Commerce — Complete Test Case Document

---

## Test Environment Setup
- URL: http://localhost:3000
- DB: MongoDB (local or Atlas)
- Roles to create: Admin, Seller, Customer
- Seed admin manually via MongoDB shell:
  ```js
  db.users.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } })
  ```

---

## MODULE 1: AUTHENTICATION

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-A01 | Auth | Valid registration | name="John Doe", email="john@test.com", phone="9876543210", password="Pass@123" | Redirect to homepage, session created, flash "Welcome, John!" |
| TC-A02 | Auth | Duplicate email registration | Same email as existing user | Flash error "Email already registered", stays on register page |
| TC-A03 | Auth | Weak password - no uppercase | password="pass123" | Validation error: "Password must have at least one uppercase letter" |
| TC-A04 | Auth | Weak password - no number | password="Password" | Validation error: "Password must have at least one number" |
| TC-A05 | Auth | Password too short | password="Ab1" | Validation error: "Password must be at least 6 characters" |
| TC-A06 | Auth | Invalid email format | email="notanemail" | Validation error: "Valid email required" |
| TC-A07 | Auth | Valid login | Registered email + correct password | Session created, redirect to homepage |
| TC-A08 | Auth | Wrong password | Correct email + wrong password | Flash "Invalid email or password" |
| TC-A09 | Auth | Non-existent email | unregistered@test.com | Flash "Invalid email or password" |
| TC-A10 | Auth | Blocked user login attempt | Blocked user credentials | Flash "Your account has been blocked" |
| TC-A11 | Auth | Logout | Click logout | Session destroyed, redirect to /auth/login |
| TC-A12 | Auth | Access protected route without login | GET /cart | Redirect to /auth/login with flash |
| TC-A13 | Auth | Access admin route as customer | GET /admin/dashboard | Redirect to / with "Admin access only" |
| TC-A14 | Auth | Access seller route as customer | GET /seller/products | Redirect to / with "Seller access only" |
| TC-A15 | Auth | Session persistence | Login, close tab, reopen | Still logged in (24hr session) |
| TC-A16 | Auth | Password hashing verification | Check DB for user | Password stored as bcrypt hash (60 chars, starts with $2b$) |
| TC-A17 | Auth | Already logged-in user hits /auth/login | GET /auth/login | Redirect to / |

### Manual Testing Steps (Authentication):
1. Open http://localhost:3000/auth/register
2. Fill in valid details → Submit → Verify redirect to homepage and welcome flash
3. Try registering same email again → Verify error
4. Logout → Go to /auth/login → Enter wrong password → Verify error
5. Enter correct credentials → Verify login
6. Open a new incognito tab → Try GET /cart → Verify redirect to login
7. Via MongoDB shell, set a user's isBlocked=true → Try logging in → Verify blocked message

---

## MODULE 2: PRODUCT MANAGEMENT

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-P01 | Products | Add product as seller | All valid fields + 1 image | Product created, redirect to /seller/products, flash "Product added successfully" |
| TC-P02 | Products | Add product without image | No file selected | Flash error "At least one product image required" |
| TC-P03 | Products | Add product with invalid price | price="-100" | Browser/server validation rejects |
| TC-P04 | Products | Add product with discount > 100 | discount="150" | Server caps/rejects value |
| TC-P05 | Products | Edit product | Change name, price, stock | Product updated in DB, flash "Product updated" |
| TC-P06 | Products | Delete product as seller | Own product | Product removed from DB and listings |
| TC-P07 | Products | Seller cannot delete other seller's product | Other seller's product ID in URL | 404 or redirect with error |
| TC-P08 | Products | Upload non-image file | Upload .pdf or .exe | Error "Only image files allowed" |
| TC-P09 | Products | Upload file > 5MB | Large image file | Multer size limit error |
| TC-P10 | Products | Homepage loads with featured products | GET / | featured, trending, newArrivals arrays populated |
| TC-P11 | Products | Product listing page loads | GET /products | Returns products grid with filter sidebar |
| TC-P12 | Products | Filter by category | ?category=Electronics | Only Electronics products shown |
| TC-P13 | Products | Filter by price range | ?minPrice=1000&maxPrice=5000 | Only products in ₹1000–₹5000 shown |
| TC-P14 | Products | Sort by price ascending | ?sort=price_asc | Cheapest product appears first |
| TC-P15 | Products | Sort by price descending | ?sort=price_desc | Most expensive product first |
| TC-P16 | Products | Sort by rating | ?sort=rating | Highest rated product first |
| TC-P17 | Products | Sort by newest | ?sort=newest | Most recently added product first |
| TC-P18 | Products | Search by keyword | ?search=Samsung | Only Samsung products shown |
| TC-P19 | Products | Search suggestions API | GET /products/search/suggestions?q=iph | Returns JSON array of matching product names |
| TC-P20 | Products | Product detail page loads | GET /products/:validId | Shows name, images, price, reviews, related products |
| TC-P21 | Products | Product detail - invalid ID | GET /products/invalidId123 | Renders 404 error page |
| TC-P22 | Products | Pagination - page 2 | ?page=2 | Shows next set of 12 products |
| TC-P23 | Products | Out-of-stock products hidden | Products with stock=0 | Not shown in listings |
| TC-P24 | Products | Admin can delete any product | Admin deletes any product ID | Product removed |
| TC-P25 | Products | Mark product as featured | isFeatured checked | Product appears in homepage Featured section |

### Manual Testing Steps (Products):
1. Login as seller → Go to /seller/products/new
2. Fill form with all fields, upload 2 images → Submit → Verify redirect and product appears in /seller/products
3. Try submitting without images → Verify error
4. Click Edit on a product → Change price → Save → Verify updated in DB
5. Go to /products?sort=price_asc → Verify prices ascending order
6. Use search bar → Type "phone" → Verify suggestions appear → Select one → Verify filtered results

---

## MODULE 3: SHOPPING CART

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-C01 | Cart | Add item to cart | POST /cart/add with productId | Item added, flash "Added to cart", cart count badge updates |
| TC-C02 | Cart | Add same item twice | Add same productId again | Quantity increases by 1 (no duplicate) |
| TC-C03 | Cart | Add out-of-stock product | stock=0 product | Flash "Product unavailable", not added |
| TC-C04 | Cart | Update quantity | Change select to 3 | Item quantity updated to 3, subtotal recalculates |
| TC-C05 | Cart | Quantity cannot exceed stock | stock=5, try qty=6 | Capped at 5 |
| TC-C06 | Cart | Remove item from cart | POST /cart/remove | Item removed, updated cart shown |
| TC-C07 | Cart | Clear cart | POST /cart/clear | All items removed, empty state shown |
| TC-C08 | Cart | View empty cart | No items | Empty state with "Start Shopping" link |
| TC-C09 | Cart | Subtotal calculation | 2 items: ₹500 x2 + ₹300 x1 | Subtotal = ₹1300 |
| TC-C10 | Cart | Tax calculation | Subtotal = ₹1000 | Tax = ₹180 (18%) |
| TC-C11 | Cart | Total = subtotal + tax | Subtotal=₹1000, Tax=₹180 | Total = ₹1180 |
| TC-C12 | Cart | Cart persists after login | Add to cart, logout, login | Cart items still present (saved per user) |
| TC-C13 | Cart | Cart requires login | GET /cart without session | Redirect to /auth/login |
| TC-C14 | Cart | Price uses discounted price | Product with 20% discount, price=₹1000 | Cart item price = ₹800 |

### Manual Testing Steps (Cart):
1. Browse to any product → Click "Add to Cart" → Verify badge count increases
2. Go to cart → Verify item, quantity, subtotal, tax, total
3. Change quantity dropdown → Verify subtotal updates
4. Click trash icon → Verify item removed
5. Add same product twice → Verify qty=2, not two separate rows
6. Add item while logged out (should redirect to login)

---

## MODULE 4: WISHLIST

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-W01 | Wishlist | Add product to wishlist | POST /wishlist/toggle with productId | Added, flash "Added to wishlist" |
| TC-W02 | Wishlist | Remove product from wishlist | Toggle same productId | Removed, flash "Removed from wishlist" |
| TC-W03 | Wishlist | View wishlist | GET /wishlist | All wishlisted products shown |
| TC-W04 | Wishlist | Move to cart | POST /wishlist/move-to-cart | Item added to cart, removed from wishlist, redirect to /cart |
| TC-W05 | Wishlist | Move out-of-stock item to cart | Out-of-stock product | Flash "Product unavailable", not moved |
| TC-W06 | Wishlist | Empty wishlist | No items | Empty state shown |
| TC-W07 | Wishlist | Wishlist requires login | GET /wishlist without session | Redirect to /auth/login |

---

## MODULE 5: CHECKOUT & PAYMENT

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-CH01 | Checkout | Access checkout with items | GET /orders/checkout | Shows cart summary, address section, payment options |
| TC-CH02 | Checkout | Access checkout with empty cart | GET /orders/checkout | Flash "Cart is empty", redirect to /cart |
| TC-CH03 | Checkout | Add new address during checkout | Fill address form → Submit | Address saved to user, redirect back to /checkout |
| TC-CH04 | Checkout | Place COD order | Select address, COD, submit | Order created, cart cleared, redirect to order detail |
| TC-CH05 | Checkout | Online payment - success | Select ONLINE, simulate=success | paymentStatus="Paid", order created |
| TC-CH06 | Checkout | Online payment - failure | Select ONLINE, simulate=failure | Flash "Payment failed. Try again or use COD." |
| TC-CH07 | Checkout | Place order without address | No address saved | Place Order button disabled |
| TC-CH08 | Checkout | Stock reduces after order | Product stock=10, order qty=3 | Product stock becomes 7 |
| TC-CH09 | Checkout | Invoice ID generated | Place any order | invoiceId format INV-XXXXXXXX |
| TC-CH10 | Checkout | Cart cleared after order | Place order | Cart.items = [] |
| TC-CH11 | Checkout | Order stored in DB | Place order | Order document in orders collection |
| TC-CH12 | Checkout | Status history logged | New order | statusHistory[0] = {status:"Pending", note:"Order placed"} |

### Manual Testing Steps (Checkout):
1. Add items to cart → Go to /orders/checkout
2. Add a new address → Verify it appears in address selection
3. Select COD → Place Order → Verify redirect to order detail, invoice ID shown
4. Check DB: cart.items should be [] and product stock reduced
5. Place another order with ONLINE → simulate success → Verify paymentStatus="Paid"
6. Place another order with ONLINE → simulate failure → Verify error flash

---

## MODULE 6: ORDER MANAGEMENT

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-O01 | Orders | View order history | GET /orders | List of all user's orders, newest first |
| TC-O02 | Orders | View order detail | GET /orders/:id | Full order info: items, address, timeline, total |
| TC-O03 | Orders | User cannot view other user's order | Another user's order ID | 404 page |
| TC-O04 | Orders | Cancel Pending order | POST /orders/:id/cancel with reason | Status = "Cancelled", timeline updated |
| TC-O05 | Orders | Cancel Confirmed order | Order with status=Confirmed | Successfully cancelled |
| TC-O06 | Orders | Cannot cancel Shipped order | Order with status=Shipped | Flash "Order cannot be cancelled at this stage" |
| TC-O07 | Orders | Cannot cancel Delivered order | Order with status=Delivered | Flash "Order cannot be cancelled at this stage" |
| TC-O08 | Orders | Admin updates order status | POST /admin/orders/:id/status | Status updated, history logged |
| TC-O09 | Orders | Admin views all orders | GET /admin/orders | All orders from all users shown |
| TC-O10 | Orders | Order status badge colors | Different statuses | Pending=yellow, Confirmed=blue, Shipped=purple, Delivered=green, Cancelled=red |

### Manual Testing Steps (Orders):
1. Place an order → Go to /orders → Verify it appears
2. Click "View Details" → Verify all info correct
3. Cancel the order → Select reason → Confirm → Verify status changes to Cancelled
4. Login as admin → /admin/orders → Update status to "Shipped" → Verify status badge updates
5. Try cancelling a Shipped order → Verify error message

---

## MODULE 7: REVIEWS & RATINGS

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-R01 | Reviews | Customer adds review | rating=5, comment="Great product!" | Review stored, averageRating recalculated |
| TC-R02 | Reviews | Customer reviews same product twice | Second review attempt | Flash "You have already reviewed this product" |
| TC-R03 | Reviews | Rating 1-5 only | rating=6 or rating=0 | Validation error (HTML min/max + schema) |
| TC-R04 | Reviews | Empty comment | comment="" | HTML required validation prevents submission |
| TC-R05 | Reviews | averageRating calculation | 5-star + 3-star reviews | averageRating = 4.0 |
| TC-R06 | Reviews | numReviews count | 3 reviews added | numReviews = 3 |
| TC-R07 | Reviews | Admin deletes review | DELETE /products/:id/review/:reviewId | Review removed, rating recalculated |
| TC-R08 | Reviews | User deletes own review | Delete button for own review | Review removed |
| TC-R09 | Reviews | Seller cannot review (only customer) | Login as seller → try to review | Review form not shown |
| TC-R10 | Reviews | Not logged in cannot review | GET product page without session | Review form not shown |

---

## MODULE 8: USER PROFILE MANAGEMENT

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-U01 | Profile | Update name and phone | PUT /profile | Profile updated, flash "Profile updated" |
| TC-U02 | Profile | Upload avatar image | Select .jpg file | Avatar updated, preview shows new image |
| TC-U03 | Profile | Change password - correct current | Valid currentPassword + newPassword | Password updated in DB |
| TC-U04 | Profile | Change password - wrong current | Wrong currentPassword | Flash "Current password incorrect" |
| TC-U05 | Profile | New password stored hashed | After password change | DB shows new bcrypt hash |
| TC-U06 | Profile | Add address | Fill address form | Address added to user.addresses[] |
| TC-U07 | Profile | First address set as default | Add first address | isDefault = true |
| TC-U08 | Profile | Delete address | DELETE /profile/address/:idx | Address removed from array |
| TC-U09 | Profile | Email cannot be changed | Email field disabled | No email update mechanism |
| TC-U10 | Profile | Last login timestamp | Check profile stats | Shows date of last login |

---

## MODULE 9: ADMIN PANEL

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-AD01 | Admin | Dashboard loads | GET /admin/dashboard | Stats cards, charts, recent orders |
| TC-AD02 | Admin | Total revenue calculated | Revenue = sum of non-cancelled orders | Correct sum shown |
| TC-AD03 | Admin | Monthly sales chart | Orders exist for past 6 months | Bar chart renders with data |
| TC-AD04 | Admin | Category pie chart | Products in multiple categories | Doughnut chart renders |
| TC-AD05 | Admin | View all users | GET /admin/users | All non-admin users listed |
| TC-AD06 | Admin | Change user role to seller | Select "Seller" from dropdown | role updated in DB |
| TC-AD07 | Admin | Cannot set role to admin via UI | Only customer/seller in dropdown | Admin role not grantable via UI |
| TC-AD08 | Admin | Block user | Click Block | isBlocked=true, user cannot login |
| TC-AD09 | Admin | Unblock user | Click Unblock | isBlocked=false, user can login |
| TC-AD10 | Admin | Delete user | Click Delete | User removed from DB |
| TC-AD11 | Admin | View all orders | GET /admin/orders | All orders from all users |
| TC-AD12 | Admin | Update order status | Select new status → Update | Status changed + history logged |
| TC-AD13 | Admin | View all products | GET /admin/products | All products with seller names |
| TC-AD14 | Admin | Admin deletes any product | Click Delete on any product | Product removed regardless of seller |
| TC-AD15 | Admin | Non-admin cannot access admin routes | Customer/Seller hitting /admin/* | Redirect with "Admin access only" |

---

## MODULE 10: SECURITY TESTS

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-S01 | Security | NoSQL Injection in login | email: {"$gt": ""} | Login fails, no unauthorized access |
| TC-S02 | Security | XSS in product name | <script>alert(1)</script> | EJS auto-escapes, no JS execution |
| TC-S03 | Security | XSS in review comment | <img src=x onerror=alert(1)> | Escaped output in HTML |
| TC-S04 | Security | CSRF-like form tampering | Manually craft POST to /cart/add | Session validated, unauthorized user rejected |
| TC-S05 | Security | Direct object access (IDOR) | Access /orders/:anotherUserOrderId | 404 returned |
| TC-S06 | Security | Admin route access without role | Customer token accessing /admin/* | Redirect with error |
| TC-S07 | Security | Cookie httpOnly flag | Check browser cookies | httpOnly=true (not accessible via JS) |
| TC-S08 | Security | Session secret strength | Check .env | SESSION_SECRET should be 32+ chars |
| TC-S09 | Security | Password not exposed in API | GET /profile | No password field in rendered HTML |
| TC-S10 | Security | Multer file type restriction | Upload .php or .exe as product image | Rejected with error message |
| TC-S11 | Security | SQL/NoSQL Injection in search | search='; DROP TABLE users; -- | Regex-escaped, no DB error |
| TC-S12 | Security | Method override abuse | _method=DELETE on GET request | Only works on POST forms with valid session |

### Security Test Steps:
1. **NoSQL Injection**: In login form, open DevTools → Network tab. Intercept POST, change email to `{"$gt":""}`. → Should fail.
2. **XSS Test**: Add a product with name `<script>alert('xss')</script>`. View product listing. Verify no alert popup (EJS escapes by default with `<%=`).
3. **IDOR Test**: Login as User A. Place an order. Copy order ID. Login as User B. Navigate to `/orders/[User A's order ID]`. Should get 404.
4. **Cookie Check**: In browser DevTools > Application > Cookies > Check `httpOnly=true`.

---

## MODULE 11: PERFORMANCE TESTS

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-PF01 | Performance | 100 products on listing page | 100 products in DB, page=1 | Page loads in <2 seconds, 12 shown |
| TC-PF02 | Performance | Pagination efficiency | Total 1000 products | skip/limit only fetches 12 per page |
| TC-PF03 | Performance | Search with large dataset | 1000 products, search "phone" | Results returned in <1 second |
| TC-PF04 | Performance | Image upload | 5 images, 1MB each | All uploaded within 5 seconds |
| TC-PF05 | Performance | Admin dashboard with large data | 500 orders | Dashboard loads with charts in <3 seconds |
| TC-PF06 | Performance | Cart with 20 items | 20 different products in cart | Cart page loads correctly, totals calculated |
| TC-PF07 | Performance | Concurrent sessions | 2 users simultaneously adding to cart | Each user's cart independent, no cross-contamination |

---

## MODULE 12: EDGE CASES

| ID | Module | Description | Input | Expected Output |
|----|--------|-------------|-------|-----------------|
| TC-E01 | Edge | Place order when product goes OOS mid-session | Stock depleted between "Add to Cart" and "Place Order" | Stock check still reduces, may over-sell (known limitation) |
| TC-E02 | Edge | Empty search | search="" | Shows all products |
| TC-E03 | Edge | Very long product name | 500-char name | Stored in DB, truncated in card UI |
| TC-E04 | Edge | Product with 0% discount | discount=0 | No discount badge shown, no strikethrough |
| TC-E05 | Edge | Order with single item | 1 product, qty=1 | Order created correctly |
| TC-E06 | Edge | User with no addresses tries checkout | 0 addresses | "Place Order" button disabled |
| TC-E07 | Edge | Invalid page number | ?page=999 | Empty products grid (no crash) |
| TC-E08 | Edge | Cart item product deleted by seller | Product deleted after adding to cart | Cart renders safely (null check in view) |
| TC-E09 | Edge | Register with spaces in name | name="  John  " | Trimmed to "John" |
| TC-E10 | Edge | 404 page | GET /nonexistent-route | Custom 404 page rendered |
| TC-E11 | Edge | Server crash simulation | Kill DB connection | 500 error page shown |

---

## APPENDIX: TEST DATA SEEDS

### Create Admin User:
```bash
# After registering normally, update role via MongoDB shell:
use ecommerce
db.users.updateOne(
  { email: "admin@shopnow.com" },
  { $set: { role: "admin" } }
)
```

### Sample Product for Testing:
```json
{
  "name": "Samsung Galaxy S24 Ultra",
  "brand": "Samsung",
  "description": "Latest flagship smartphone with 200MP camera",
  "price": 129999,
  "discount": 10,
  "stock": 25,
  "category": "Mobiles",
  "isFeatured": true,
  "isTrending": true
}
```

### Sample Test Users:
| Role | Email | Password |
|------|-------|----------|
| Customer | customer@test.com | Test@123 |
| Seller | seller@test.com | Test@123 |
| Admin | admin@test.com | Test@123 (+ update role in DB) |

---

## APPENDIX: SETUP & RUN INSTRUCTIONS

### 1. Clone / Download Project
```bash
git clone https://github.com/yourusername/shopnow-ecommerce.git
cd shopnow-ecommerce
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and session secret
```

### 4. MongoDB Atlas Setup
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Create a database user (remember username/password)
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Click "Connect" → "Connect your application"
6. Copy the connection string to MONGO_URI in .env
7. Replace `<password>` with your DB user password

### 5. Create Upload Directory
```bash
mkdir -p public/images/uploads
touch public/images/uploads/.gitkeep
```

### 6. Run Application
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

### 7. Access Application
- App: http://localhost:3000
- Register a user, then update role via MongoDB shell for admin access

### 8. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - ShopNow E-Commerce"
git remote add origin https://github.com/yourusername/shopnow-ecommerce.git
git push -u origin main
```

---

*Test Case Document Version 1.0 | ShopNow E-Commerce Platform*
