"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { Category, Product } from "@/types";
import { api } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";

export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, prods] = await Promise.all([
          api.categories.list().catch(() => []),
          api.products.list({ size: 8, sort: "newest" }).catch(() => ({ items: [] })),
        ]);
        setCategories(cats);
        setFeaturedProducts(prods.items || []);
      } catch (err) {
        console.error("Error loading home data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white py-16 sm:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Next-Gen E-Commerce Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Curated collections for your{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-pink-400 bg-clip-text text-transparent">
                  modern lifestyle.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal">
                Discover exceptional quality, instant availability checks, safe payments,
                and seamless checkout. Enjoy free shipping on all orders over ₹500!
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/products"
                  className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products?sort=price_asc"
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 font-semibold text-sm backdrop-blur-md transition hover:-translate-y-0.5"
                >
                  Best Value Deals
                </Link>
              </div>

              {/* Highlights bar */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-slate-400">Authentic Goods</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">₹500+</p>
                  <p className="text-xs text-slate-400">Free Delivery</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">Instant</p>
                  <p className="text-xs text-slate-400">Order Updates</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-6 backdrop-blur-xl shadow-2xl shadow-indigo-950/50">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-medium text-slate-300">Live Inventory Active</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200">
                    Express Dispatch
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/50 flex items-center justify-center text-white font-bold">
                      <Truck className="w-6 h-6 text-indigo-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Fast Local Logistics</p>
                      <p className="text-xs text-slate-400">Real-time order statuses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-pink-600/50 flex items-center justify-center text-white font-bold">
                      <ShieldCheck className="w-6 h-6 text-pink-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Secure Checkout</p>
                      <p className="text-xs text-slate-400">COD & Instant Payment Simulation</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-white/10 p-3 rounded-2xl border border-white/10">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/50 flex items-center justify-center text-white font-bold">
                      <RotateCcw className="w-6 h-6 text-violet-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Hassle-Free Cancellation</p>
                      <p className="text-xs text-slate-400">Automatic stock restoration</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/products"
                  className="w-full py-3 rounded-xl bg-white text-slate-900 font-bold text-center block text-sm hover:bg-slate-100 transition shadow-md"
                >
                  Browse Store Catalog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <Tag className="w-4 h-4" />
                <span>Categories</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Explore by Category
              </h2>
            </div>
            <Link
              href="/products"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category_id=${cat.id}`}
                className="group p-5 bg-white border border-slate-200/80 rounded-2xl hover:border-indigo-400 hover:shadow-lg transition-all duration-200 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition duration-200">
                  <Tag className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-sm text-slate-800 group-hover:text-indigo-600 transition truncate w-full">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Latest Additions
            </h2>
          </div>
          <Link
            href="/products?sort=newest"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>See more products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-800">No products available yet</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Please check back soon or log into the Admin Panel to add new products and categories!
            </p>
            <Link
              href="/admin/products"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-700 transition"
            >
              Go to Admin Product Manager
            </Link>
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 sm:p-12 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">
              Free Delivery Promise
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Order above ₹500 and get free shipping!
            </h3>
            <p className="text-sm text-indigo-100 max-w-xl">
              Add your favorite items to your cart today. Enjoy convenient payment modes
              including Cash on Delivery and instant mock checkout.
            </p>
          </div>

          <Link
            href="/products"
            className="shrink-0 px-6 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl text-sm shadow-lg transition hover:scale-105 z-10"
          >
            Start Shopping Now
          </Link>
        </div>
      </section>
    </div>
  );
}
