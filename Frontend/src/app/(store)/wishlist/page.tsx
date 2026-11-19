"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCartWishlist } from "@/context/CartWishlistContext";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const {
    wishlist,
    isLoadingWishlist,
    removeFromWishlist,
    moveToCart,
    clearWishlist,
  } = useCartWishlist();

  const [movingId, setMovingId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <Heart className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Your Wishlist</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Sign in to save items you love and access your wishlist from any device.
        </p>
        <Link
          href="/login?redirect=/wishlist"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const items = wishlist?.items || [];

  const handleMoveToCart = async (productId: number) => {
    setMovingId(productId);
    try {
      await moveToCart(productId, 1);
    } catch (err) {
      console.error(err);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Saved Wishlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => clearWishlist()}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Wishlist
          </button>
        )}
      </div>

      {isLoadingWishlist && !wishlist ? (
        <div className="py-20 text-center text-slate-500">Loading your wishlist...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl p-8 my-8 shadow-xs">
          <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Your wishlist is empty</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Browse our catalog, click the heart icon on items you love, and they will show up here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-600/20"
          >
            <span>Explore Products</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
          {items.map((item) => {
            const isMoving = movingId === item.product_id;
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <div className="relative aspect-square bg-slate-100">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.product_name}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <button
                    onClick={() => removeFromWishlist(item.product_id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-rose-500 rounded-full shadow-xs transition"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {!item.in_stock && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded-md">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-mono text-slate-400">
                    #{item.product_code}
                  </span>
                  <Link
                    href={`/products/${item.product_id}`}
                    className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition line-clamp-1 mt-1"
                  >
                    {item.product_name}
                  </Link>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(item.unit_price)}
                    </span>

                    <button
                      onClick={() => handleMoveToCart(item.product_id)}
                      disabled={!item.in_stock || isMoving}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                        !item.in_stock
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{isMoving ? "Moving..." : "Move to Bag"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
