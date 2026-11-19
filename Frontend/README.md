# ShopVibe E-Commerce & Admin Suite (Next.js 15)

A full-featured modern E-commerce website and administrative control portal built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, designed to seamlessly integrate with the **FastAPI + PostgreSQL** backend API.

---

## Architecture Overview

Both the customer-facing storefront and the management admin panel are hosted within this unified Next.js frontend application, segregated cleanly using Next.js App Router Route Groups and Layouts:

```
Frontend/
├── src/
│   ├── app/
│   │   ├── (store)/                     # Public & Customer Storefront Route Group
│   │   │   ├── layout.tsx               # Storefront Layout (Sticky Navbar + Footer)
│   │   │   ├── page.tsx                 # Home / Hero / Featured Products & Categories
│   │   │   ├── products/
│   │   │   │   ├── page.tsx             # Product Catalog (Search, Filter, Sort, Pagination)
│   │   │   │   └── [id]/page.tsx        # Product Details, Image Gallery & Related Items
│   │   │   ├── cart/page.tsx            # Shopping Bag (Free shipping bar, Qty adjustment)
│   │   │   ├── wishlist/page.tsx        # Wishlist (Move-to-cart, delete)
│   │   │   ├── checkout/page.tsx        # Delivery Address Selection, COD / Online Pay
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx             # Order History & Tracking
│   │   │   │   └── [id]/page.tsx        # Order Details, Invoice, Mock Payment & Cancel
│   │   │   ├── addresses/page.tsx       # Saved Address Management (Add, Edit, Default)
│   │   │   ├── profile/page.tsx         # User Profile & Password Change
│   │   │   ├── login/page.tsx           # Customer & Admin Sign In
│   │   │   └── register/page.tsx        # Customer Registration
│   │   │
│   │   ├── admin/                       # Segregated Admin Control Portal
│   │   │   ├── layout.tsx               # Admin Layout (AdminGuard + Sidebar + Header)
│   │   │   ├── page.tsx                 # Dashboard (Revenue, Orders, Low Stock Alerts)
│   │   │   ├── products/page.tsx        # Product Catalog CRUD (Add, Edit, Soft Delete)
│   │   │   ├── categories/page.tsx      # Category Taxonomy CRUD
│   │   │   ├── orders/page.tsx          # Order Lifecycle Management (Transitions)
│   │   │   └── users/page.tsx           # User Account Access & Status Toggle
│   │   │
│   │   ├── globals.css                  # Tailwind styles
│   │   └── layout.tsx                   # Root HTML & Providers (Auth + Cart/Wishlist)
│   │
│   ├── components/
│   │   ├── admin/                       # AdminSidebar, AdminHeader, AdminGuard
│   │   ├── layout/                      # Navbar, Footer
│   │   └── products/                    # ProductCard, ProductGrid
│   │
│   ├── context/
│   │   ├── AuthContext.tsx              # JWT Auth, User role, Login, Logout
│   │   └── CartWishlistContext.tsx      # Real-time Cart & Wishlist Synchronization
│   │
│   ├── lib/
│   │   ├── api.ts                       # Typed FastAPI Client (OAuth2, Bearer tokens)
│   │   └── utils.ts                     # Currency (₹ INR), Date formatters, Badges
│   │
│   └── types/                           # Complete TypeScript interfaces matching backend models
├── .env.local                           # Configured with NEXT_PUBLIC_API_URL
└── package.json
```

---

## Backend API Endpoints Mapped

### 1. Authentication & Profile
- `POST /auth/register` - Create customer account
- `POST /auth/login` - OAuth2 password request form (`x-www-form-urlencoded`)
- `GET /users/me` - Authenticated user details
- `PUT /users/me` - Update profile details
- `PUT /users/me/password` - Change password

### 2. Store Catalog (Public)
- `GET /categories/` - Active product categories
- `GET /categories/{id}` - Category details
- `GET /products/` - Paginated products with filters: `search`, `category_id`, `min_price`, `max_price`, `in_stock`, `sort`
- `GET /products/{id}` - Single product details

### 3. Shopping Cart & Wishlist (Customer)
- `GET /cart/` - View cart items, subtotal, shipping fee, total
- `POST /cart/items` - Add product to cart
- `PUT /cart/items/{item_id}` - Update item quantity
- `DELETE /cart/items/{item_id}` - Remove item from cart
- `DELETE /cart/` - Empty entire cart
- `GET /wishlist/` - View saved items
- `POST /wishlist/items` - Save item
- `DELETE /wishlist/items/{product_id}` - Remove saved item
- `POST /wishlist/items/{product_id}/move-to-cart` - Move item to bag

### 4. Addresses & Orders (Customer)
- `GET /addresses/`, `POST /addresses/`, `PUT /addresses/{id}`, `DELETE /addresses/{id}` - Manage shipping addresses
- `POST /orders/checkout` - Create order with selected address and payment mode (`cod` / `online`)
- `GET /orders/` - Paginated customer orders
- `GET /orders/{order_id}` - Order details & line items
- `POST /orders/{order_id}/cancel` - Customer cancellation (restores inventory)
- `POST /orders/{order_id}/pay` - Mock payment simulation for online orders

### 5. Admin Control Panel (Admin Token Required)
- `GET /admin/dashboard` - Total revenue, orders, users, active products, low-stock inventory alerts
- `GET /admin/categories`, `POST`, `PUT`, `DELETE` - Category management
- `GET /admin/products`, `POST`, `PUT`, `DELETE` - Product management with soft delete
- `GET /admin/orders`, `GET /admin/orders/{id}`, `PATCH /admin/orders/{id}/status` - Order lifecycle management
- `GET /admin/users`, `PATCH /admin/users/{user_id}/status` - User management & account activation

---

## Getting Started

### 1. Start the Backend API
From the root workspace directory:
```bash
cd backend
# Activate Python environment
.\venv\Scripts\activate
# Start FastAPI server
uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Start the Next.js Frontend
From the root workspace directory:
```bash
cd Frontend
npm run dev
```
Storefront will be live at `http://localhost:3000`.

### 3. Accessing the Admin Panel
1. Create or promote an admin user via `backend/create_admin.py` or log in with an existing administrator account.
2. Sign in at `http://localhost:3000/login`.
3. If signed in as an administrator, click **Admin Panel** in the user menu or navigate to `http://localhost:3000/admin`.
4. Non-admin users are automatically guarded and restricted from administrative routes.
