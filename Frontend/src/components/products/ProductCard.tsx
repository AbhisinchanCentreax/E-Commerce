"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Check, Package } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartWishlist } from "@/context/CartWishlistContext";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist, addToCart } = useCartWishlist();
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || addingToCart) return;

    setAddingToCart(true);
    try {
      await addToCart(product.id, 1);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="group relative bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col h-full">
      {/* Top badges & Wishlist button */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                const placeholder = parent.querySelector(".fallback-placeholder");
                if (placeholder) placeholder.classList.remove("hidden");
              }
            }}
          />
        ) : null}

        {/* Fallback image */}
        <div
          className={`fallback-placeholder absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4 ${
            product.image_url ? "hidden" : ""
          }`}
        >
          <Package className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">No Image</span>
        </div>

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition shadow-xs z-10 ${
            inWishlist
              ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200"
              : "bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white"
          }`}
          title={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-500" : ""}`} />
        </button>

        {/* Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-xs">
              Out of stock
            </span>
          ) : product.stock_quantity <= 5 ? (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white rounded-md shadow-xs">
              Only {product.stock_quantity} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & SKU */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 gap-2">
          <span className="truncate font-medium text-indigo-600">
            {product.category?.name || "General"}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-slate-400">
            #{product.product_code}
          </span>
        </div>

        {/* Title */}
        <Link
          href={`/products/${product.id}`}
          className="font-semibold text-slate-900 group-hover:text-indigo-600 transition text-sm sm:text-base line-clamp-1 mb-1"
        >
          {product.product_name}
        </Link>

        {/* Description snippet */}
        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price & Add to Cart button */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-slate-400 font-medium">Price</p>
            <p className="text-base sm:text-lg font-bold text-slate-900">
              {formatCurrency(product.unit_price)}
            </p>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition ${
              isOutOfStock
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : addedSuccess
                ? "bg-emerald-600 text-white"
                : "bg-slate-900 hover:bg-indigo-600 text-white shadow-xs hover:shadow-md"
            }`}
          >
            {addedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
