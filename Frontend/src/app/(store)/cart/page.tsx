"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  Truck,
  ShieldCheck,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCartWishlist } from "@/context/CartWishlistContext";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    isLoadingCart,
    updateCartItem,
    removeCartItem,
    clearCart,
  } = useCartWishlist();

  const [busyItemId, setBusyItemId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <ShoppingBag className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Your Cart Awaits</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please log in to view items in your shopping bag and proceed to checkout.
        </p>
        <Link
          href="/login?redirect=/cart"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In to View Cart
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = Number(cart?.shipping_fee || 0);
  const totalAmount = Number(cart?.total_amount || 0);
  const freeShippingThreshold = 500;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingPercentage = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  const handleQuantityChange = async (itemId: number, newQty: number) => {
    if (newQty < 1 || busyItemId !== null) return;
    setBusyItemId(itemId);
    try {
      await updateCartItem(itemId, newQty);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyItemId(null);
    }
  };

  const handleRemove = async (itemId: number) => {
    if (busyItemId !== null) return;
    setBusyItemId(itemId);
    try {
      await removeCartItem(itemId);
    } catch (err) {
      console.error(err);
    } finally {
      setBusyItemId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shopping Bag</h1>
          <p className="text-sm text-slate-500 mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in your order
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={() => clearCart()}
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Bag
          </button>
        )}
      </div>

      {isLoadingCart && !cart ? (
        <div className="py-20 text-center text-slate-500">Loading your shopping cart...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl p-8 my-8 shadow-xs">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">Your shopping bag is empty</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Looks like you haven&apos;t added any items yet. Browse our catalog and find something you love!
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free shipping banner */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-indigo-900">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  {amountNeededForFreeShipping === 0
                    ? "Congratulations! You have unlocked FREE shipping!"
                    : `Add ${formatCurrency(amountNeededForFreeShipping)} more to get FREE Delivery`}
                </span>
                <span className="text-indigo-600">{freeShippingPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${freeShippingPercentage}%` }}
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-xs">
              {items.map((item) => {
                const isItemBusy = busyItemId === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-5 flex flex-col sm:flex-row items-center gap-5 transition ${
                      isItemBusy ? "opacity-50 pointer-events-none" : ""
                    }`}
                  >
                    {/* Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center sm:text-left space-y-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase">
                        SKU: {item.product_code}
                      </span>
                      <h4 className="font-bold text-slate-900 text-base">
                        <Link
                          href={`/products/${item.product_id}`}
                          className="hover:text-indigo-600 transition"
                        >
                          {item.product_name}
                        </Link>
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Unit Price: {formatCurrency(item.unit_price)}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || isItemBusy}
                        className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock_quantity || isItemBusy}
                        className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line total & Delete */}
                    <div className="text-center sm:text-right shrink-0 min-w-[90px]">
                      <p className="text-base font-extrabold text-slate-900">
                        {formatCurrency(item.line_total)}
                      </p>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium mt-1 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Checkout Card */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                    ) : (
                      formatCurrency(shippingFee)
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between text-base">
                  <span className="font-bold text-slate-900">Grand Total</span>
                  <span className="font-extrabold text-xl text-indigo-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Encrypted 256-bit Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
