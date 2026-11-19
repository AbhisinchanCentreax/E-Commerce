"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Category, Product, ProductCreate, ProductUpdate } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [formData, setFormData] = useState<ProductCreate>({
    product_code: "",
    product_name: "",
    description: "",
    category_id: 1,
    unit_price: 0,
    stock_quantity: 10,
    image_url: "",
    is_active: true,
  });

  const loadCategories = async () => {
    try {
      const cats = await api.admin.listCategories();
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.listProducts({
        page,
        size: 15,
        search: search.trim() || undefined,
      });
      setProducts(res.items);
      setTotal(res.total);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      product_code: `SKU-${Date.now().toString().slice(-6)}`,
      product_name: "",
      description: "",
      category_id: categories[0]?.id || 1,
      unit_price: 199,
      stock_quantity: 20,
      image_url: "",
      is_active: true,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      description: product.description || "",
      category_id: product.category_id,
      unit_price: Number(product.unit_price),
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || "",
      is_active: product.is_active,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      if (editingProduct) {
        await api.admin.updateProduct(editingProduct.id, {
          product_code: formData.product_code,
          product_name: formData.product_name,
          description: formData.description,
          category_id: Number(formData.category_id),
          unit_price: Number(formData.unit_price),
          stock_quantity: Number(formData.stock_quantity),
          image_url: formData.image_url || undefined,
          is_active: formData.is_active,
        });
        setFeedback({ text: "Product updated successfully!", type: "success" });
      } else {
        await api.admin.createProduct({
          product_code: formData.product_code,
          product_name: formData.product_name,
          description: formData.description,
          category_id: Number(formData.category_id),
          unit_price: Number(formData.unit_price),
          stock_quantity: Number(formData.stock_quantity),
          image_url: formData.image_url || undefined,
          is_active: formData.is_active,
        });
        setFeedback({ text: "New product created successfully!", type: "success" });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to save product");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? (It will be hidden from the storefront while keeping historical order references).")) {
      return;
    }
    try {
      await api.admin.deleteProduct(id);
      setFeedback({ text: "Product marked inactive/deleted.", type: "success" });
      loadProducts();
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to delete product", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage SKU codes, inventory numbers, pricing, and category mappings
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.text}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadProducts();
          }}
          className="relative w-full sm:max-w-md"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or SKU code..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <span className="text-xs text-slate-500 font-medium">
          Total Products: {total}
        </span>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No products found. Click &quot;Add New Product&quot; to populate your catalog!
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          {p.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image_url}
                              alt={p.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug truncate max-w-xs">
                            {p.product_name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">
                            #{p.product_code}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {p.category?.name || "Uncategorized"}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {formatCurrency(p.unit_price)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          p.stock_quantity === 0
                            ? "bg-rose-100 text-rose-700"
                            : p.stock_quantity <= 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {p.stock_quantity} units
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          p.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete / Deactivate"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingProduct ? "Edit Product" : "Create New Product"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.product_code}
                    onChange={(e) =>
                      setFormData({ ...formData, product_code: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category *
                  </label>
                  {categories.length === 0 ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                      No categories found. Please add a category first in &apos;Category Taxonomy&apos;.
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) =>
                        setFormData({ ...formData, category_id: parseInt(e.target.value) })
                      }
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} {!c.is_active ? "(Inactive)" : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.product_name}
                  onChange={(e) =>
                    setFormData({ ...formData, product_name: e.target.value })
                  }
                  placeholder="e.g. Premium Noise-Cancelling Headphones"
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Unit Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.image_url || ""}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, features, warranty..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Product is Active in Storefront
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
