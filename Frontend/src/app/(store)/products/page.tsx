"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  PackageX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Category, Product, ProductSort } from "@/types";
import { api } from "@/lib/api";
import ProductCard from "@/components/products/ProductCard";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL params
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category_id")
    ? parseInt(searchParams.get("category_id")!)
    : undefined;
  const initialSort = (searchParams.get("sort") as ProductSort) || "newest";
  const initialPage = searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1;
  const initialMinPrice = searchParams.get("min_price")
    ? parseFloat(searchParams.get("min_price")!)
    : undefined;
  const initialMaxPrice = searchParams.get("max_price")
    ? parseFloat(searchParams.get("max_price")!)
    : undefined;
  const initialInStock = searchParams.get("in_stock") === "true";

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [categoryId, setCategoryId] = useState<number | undefined>(initialCategory);
  const [sort, setSort] = useState<ProductSort>(initialSort);
  const [page, setPage] = useState(initialPage);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice ? String(initialMinPrice) : "");
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice ? String(initialMaxPrice) : "");
  const [inStock, setInStock] = useState<boolean>(initialInStock);

  // Mobile Filter Drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Load Categories once
  useEffect(() => {
    api.categories.list().then(setCategories).catch(console.error);
  }, []);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.products.list({
        page,
        size: 12,
        search: search.trim() || undefined,
        category_id: categoryId,
        min_price: minPrice ? parseFloat(minPrice) : undefined,
        max_price: maxPrice ? parseFloat(maxPrice) : undefined,
        in_stock: inStock ? true : undefined,
        sort,
      });
      setProducts(res.items);
      setTotal(res.total);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, categoryId, minPrice, maxPrice, inStock, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update query params in URL
  const updateUrl = () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (categoryId) params.set("category_id", categoryId.toString());
    if (sort !== "newest") params.set("sort", sort);
    if (page > 1) params.set("page", page.toString());
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (inStock) params.set("in_stock", "true");

    const query = params.toString();
    router.replace(`/products${query ? `?${query}` : ""}`, { scroll: false });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateUrl();
  };

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId(undefined);
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setInStock(false);
    setPage(1);
    router.replace("/products");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Shop Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Showing {products.length} of {total} products
          </p>
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 bg-white"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Sort:
            </label>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as ProductSort);
                setPage(1);
              }}
              className="bg-white border border-slate-300 text-slate-800 text-sm font-medium rounded-xl px-3 py-2 outline-hidden focus:border-indigo-600 shadow-xs"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        {/* Sidebar Filters Desktop */}
        <div className="hidden md:block space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-xs sticky top-28">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filters
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Search
              </label>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Keyword or SKU..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-hidden"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                <button
                  onClick={() => {
                    setCategoryId(undefined);
                    setPage(1);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                    categoryId === undefined
                      ? "bg-indigo-50 text-indigo-700 font-bold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setCategoryId(cat.id);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                      categoryId === cat.id
                        ? "bg-indigo-50 text-indigo-700 font-bold"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Price (₹)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            {/* In Stock Only */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => {
                    setInStock(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-sm font-medium text-slate-700">
                  In-Stock Items Only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition ${
                          page === p
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "border border-slate-300 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100 text-slate-700 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
              <PackageX className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Try adjusting your search terms, removing filters, or broadening the price range.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition shadow-sm"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs md:hidden">
          <div className="w-5/6 max-w-sm bg-white h-full p-6 space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-bold text-lg text-slate-900">Filters</h3>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Categories
              </label>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCategoryId(undefined);
                    setPage(1);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    categoryId === undefined ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCategoryId(c.id);
                      setPage(1);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                      categoryId === c.id ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                handleResetFilters();
                setIsFilterOpen(false);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-slate-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
