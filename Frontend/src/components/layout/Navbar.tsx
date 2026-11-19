"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  ShoppingCart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ShieldCheck,
  Package,
  MapPin,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCartWishlist } from "@/context/CartWishlistContext";
import { formatCurrency } from "@/lib/utils";

export default function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount, cart, wishlistCount } = useCartWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                ShopVibe
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-indigo-600 -mt-1">
                Store
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-lg relative items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands, essentials..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-full outline-hidden transition shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-full transition"
            >
              Search
            </button>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-indigo-600 transition">
              Home
            </Link>
            <Link href="/products" className="hover:text-indigo-600 transition">
              Shop Catalog
            </Link>
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 p-2 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-full transition group"
              title="Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-5 h-5 bg-indigo-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </div>
              {cart && Number(cart.subtotal) > 0 && (
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                  {formatCurrency(cart.subtotal)}
                </span>
              )}
            </Link>

            {/* User Account / Profile */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 text-slate-700 hover:bg-slate-100 rounded-full border border-slate-200 transition"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {user?.full_name?.charAt(0) || user?.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block text-xs font-medium max-w-[100px] truncate">
                      {user?.full_name || user?.username}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-purple-100 text-purple-700 rounded-md">
                            Administrator
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="p-1">
                          <Link
                            href="/admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl transition"
                          >
                            <ShieldCheck className="w-4 h-4 text-indigo-600" />
                            Admin Panel
                          </Link>
                        </div>
                      )}

                      <div className="p-1 border-t border-slate-100">
                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition"
                        >
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          My Profile
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition"
                        >
                          <Package className="w-4 h-4 text-slate-500" />
                          My Orders
                        </Link>
                        <Link
                          href="/addresses"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition"
                        >
                          <MapPin className="w-4 h-4 text-slate-500" />
                          Saved Addresses
                        </Link>
                      </div>

                      <div className="p-1 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl transition text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search & Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-100 space-y-4 animate-in fade-in">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 rounded-full outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
            </form>

            <nav className="flex flex-col space-y-2 font-medium text-slate-700">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Home
              </Link>
              <Link
                href="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Shop Catalog
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Wishlist ({wishlistCount})
              </Link>
              <Link
                href="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                Cart ({cartCount})
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Admin Control Panel
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
