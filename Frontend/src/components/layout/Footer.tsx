import React from "react";
import Link from "next/link";
import { ShoppingBag, Truck, ShieldCheck, Clock, RotateCcw } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      {/* Features Bar */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-indigo-950/60 rounded-xl text-indigo-400">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Shipping</h4>
                <p className="text-xs text-slate-400">On all orders over ₹500</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-emerald-950/60 rounded-xl text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Secure Payment</h4>
                <p className="text-xs text-slate-400">Online & Cash on Delivery</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-amber-950/60 rounded-xl text-amber-400">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Easy Cancellations</h4>
                <p className="text-xs text-slate-400">Instant inventory restock</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="p-3 bg-purple-950/60 rounded-xl text-purple-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 Assistance</h4>
                <p className="text-xs text-slate-400">Dedicated customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">ShopVibe</span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm">
              Your premier e-commerce destination with lightning-fast catalog search, curated
              collections, instant cart updates, and robust order management.
            </p>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Shop Catalog
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition">
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Customer Account
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/profile" className="hover:text-white transition">
                  My Profile
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/addresses" className="hover:text-white transition">
                  Saved Addresses
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition">
                  Sign In / Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">
              Administration
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/admin/products" className="hover:text-white transition">
                  Manage Products
                </Link>
              </li>
              <li>
                <Link href="/admin/categories" className="hover:text-white transition">
                  Manage Categories
                </Link>
              </li>
              <li>
                <Link href="/admin/orders" className="hover:text-white transition">
                  Manage Orders
                </Link>
              </li>
              <li>
                <Link href="/admin/users" className="hover:text-white transition">
                  Manage Users
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ShopVibe Store. Powered by FastAPI & Next.js.</p>
          <div className="flex gap-4">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
