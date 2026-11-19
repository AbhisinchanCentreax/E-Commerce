"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Check,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Package,
  Minus,
  Plus,
} from "lucide-react";
import { Product } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useCartWishlist } from "@/context/CartWishlistContext";
import ProductCard from "@/components/products/ProductCard";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const { isInWishlist, addToWishlist, removeFromWishlist, addToCart } = useCartWishlist();

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      try {
        const data = await api.products.get(productId);
        setProduct(data);

        // Fetch related products from category
        if (data.category_id) {
          const rel = await api.products.list({
            category_id: data.category_id,
            size: 4,
          });
          setRelated(rel.items.filter((p) => p.id !== data.id));
        }
      } catch (err) {
        console.error("Product load error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse space-y-8">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-6 w-1/4 bg-slate-200 rounded-md" />
            <div className="h-32 bg-slate-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">
          The requested product may be inactive, out of catalog, or does not exist.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const maxAvailable = Math.min(product.stock_quantity, 100);

  const handleWishlistToggle = async () => {
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleAddToCart = async () => {
    if (isOutOfStock || addingToCart) return;
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product.id, quantity);
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
        <Link href="/" className="hover:text-indigo-600 transition">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/products" className="hover:text-indigo-600 transition">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link
              href={`/products?category_id=${product.category.id}`}
              className="hover:text-indigo-600 transition"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-medium truncate max-w-xs">
          {product.product_name}
        </span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Product Media */}
        <div className="lg:col-span-6 sticky top-28">
          <div className="relative aspect-square w-full bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Package className="w-20 h-20 stroke-[1.5] mb-2 text-slate-300" />
                <span className="text-sm font-medium">No Image Available</span>
              </div>
            )}

            {/* Wishlist Heart */}
            <button
              onClick={handleWishlistToggle}
              className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition ${
                inWishlist
                  ? "bg-rose-50 text-rose-500 ring-1 ring-rose-200"
                  : "bg-white/80 text-slate-600 hover:text-rose-500 hover:bg-white"
              }`}
              title={inWishlist ? "In Wishlist" : "Add to Wishlist"}
            >
              <Heart className={`w-5 h-5 ${inWishlist ? "fill-rose-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Product Info & Actions */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {product.category && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  {product.category.name}
                </span>
              )}
              <span className="text-xs font-mono text-slate-400">
                SKU: {product.product_code}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.product_name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {formatCurrency(product.unit_price)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Inclusive of all taxes
            </span>
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                isOutOfStock ? "bg-rose-500" : "bg-emerald-500"
              }`}
            />
            <span className="text-sm font-semibold text-slate-700">
              {isOutOfStock
                ? "Currently Out of Stock"
                : product.stock_quantity <= 5
                ? `Hurry! Only ${product.stock_quantity} left in stock`
                : "In Stock & Ready to Ship"}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-slate text-sm text-slate-600 border-t border-slate-200 pt-4">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                About this item
              </h4>
              <p className="leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Quantity Controls & Action Buttons */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Quantity:
                </label>
                <div className="inline-flex items-center border border-slate-300 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxAvailable, q + 1))}
                    disabled={quantity >= maxAvailable}
                    className="p-2 text-slate-500 hover:text-slate-800 disabled:opacity-30"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">
                  (Max {maxAvailable} units)
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-md ${
                  isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : addedSuccess
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              {!isOutOfStock && (
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 px-6 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25 transition"
                >
                  Buy Now
                </button>
              )}
            </div>
          </div>

          {/* Assurance info */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">Free Shipping</p>
              <p className="text-[10px] text-slate-400">Over ₹500</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">COD Available</p>
              <p className="text-[10px] text-slate-400">Pay at Doorstep</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">Fast Restock</p>
              <p className="text-[10px] text-slate-400">Instant Refund</p>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {related.length > 0 && (
        <div className="pt-12 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Similar Products You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
