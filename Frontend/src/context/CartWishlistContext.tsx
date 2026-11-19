"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { CartResponse, WishlistResponse } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

interface CartWishlistContextType {
  cart: CartResponse | null;
  cartCount: number;
  isLoadingCart: boolean;
  wishlist: WishlistResponse | null;
  wishlistCount: number;
  isLoadingWishlist: boolean;
  wishlistProductIds: Set<number>;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (itemId: number, quantity: number) => Promise<void>;
  removeCartItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  moveToCart: (productId: number, quantity?: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
  clearWishlist: () => Promise<void>;
}

const CartWishlistContext = createContext<CartWishlistContextType | undefined>(undefined);

export function CartWishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(false);

  const [wishlist, setWishlist] = useState<WishlistResponse | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState<boolean>(false);
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<number>>(new Set());

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoadingCart(true);
    try {
      const data = await api.cart.get();
      setCart(data);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setIsLoadingCart(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      setWishlistProductIds(new Set());
      return;
    }
    setIsLoadingWishlist(true);
    try {
      const data = await api.wishlist.get();
      setWishlist(data);
      const ids = new Set(data.items.map((i) => i.product_id));
      setWishlistProductIds(ids);
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    } finally {
      setIsLoadingWishlist(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist(null);
      setWishlistProductIds(new Set());
    }
  }, [isAuthenticated, fetchCart, fetchWishlist]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }
    const res = await api.cart.addItem(productId, quantity);
    setCart(res);
  };

  const updateCartItem = async (itemId: number, quantity: number) => {
    const res = await api.cart.updateItem(itemId, quantity);
    setCart(res);
  };

  const removeCartItem = async (itemId: number) => {
    const res = await api.cart.removeItem(itemId);
    setCart(res);
  };

  const clearCart = async () => {
    await api.cart.clear();
    setCart({
      items: [],
      total_items: 0,
      subtotal: "0.00",
      shipping_fee: "0.00",
      total_amount: "0.00",
    });
  };

  const addToWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }
    const res = await api.wishlist.addItem(productId);
    setWishlist(res);
    setWishlistProductIds((prev) => new Set([...prev, productId]));
  };

  const removeFromWishlist = async (productId: number) => {
    const res = await api.wishlist.removeItem(productId);
    setWishlist(res);
    setWishlistProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  const moveToCart = async (productId: number, quantity: number = 1) => {
    const res = await api.wishlist.moveToCart(productId, quantity);
    setWishlist(res);
    setWishlistProductIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    // Refresh cart
    await fetchCart();
  };

  const isInWishlist = (productId: number): boolean => {
    return wishlistProductIds.has(productId);
  };

  const clearWishlist = async () => {
    await api.wishlist.clear();
    setWishlist({
      items: [],
      total_items: 0,
    });
    setWishlistProductIds(new Set());
  };

  return (
    <CartWishlistContext.Provider
      value={{
        cart,
        cartCount: cart?.total_items || 0,
        isLoadingCart,
        wishlist,
        wishlistCount: wishlist?.total_items || 0,
        isLoadingWishlist,
        wishlistProductIds,
        fetchCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        isInWishlist,
        clearWishlist,
      }}
    >
      {children}
    </CartWishlistContext.Provider>
  );
}

export function useCartWishlist() {
  const context = useContext(CartWishlistContext);
  if (!context) {
    throw new Error("useCartWishlist must be used within a CartWishlistProvider");
  }
  return context;
}
