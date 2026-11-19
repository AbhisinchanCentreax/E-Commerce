"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Package,
  ClipboardList,
  Clock,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { DashboardResponse } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time business performance, inventory alerts, and order analytics
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={isLoading}
          className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs transition"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-indigo-600" : ""}`} />
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(data?.total_revenue || 0)}
            </p>
            <p className="text-[11px] text-emerald-600 font-semibold">From paid orders</p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Orders
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {data?.total_orders ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">All-time transactions</p>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Orders
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {data?.pending_orders ?? 0}
            </p>
            <p className="text-[11px] text-amber-600 font-semibold">Require dispatch action</p>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Products
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {data?.total_products ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">In store catalog</p>
          </div>
        </div>

        {/* Registered Users */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-2xl font-extrabold text-slate-900">
              {data?.total_users ?? 0}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">Customer accounts</p>
          </div>
        </div>
      </div>

      {/* Quick Admin Actions Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="text-lg font-bold">Quick Administrative Actions</h3>
          <p className="text-xs text-slate-300">Fast paths to common store operations</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
          <Link
            href="/admin/categories"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Link>
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
          >
            <span>Process Orders</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Low Stock Alerts Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Low Stock Alert (≤ 5 units left)
              </h2>
              <p className="text-xs text-slate-500">
                Items requiring immediate restocking to avoid checkout failures
              </p>
            </div>
          </div>

          <Link
            href="/admin/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Manage All Products →
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400">Loading stock data...</div>
        ) : !data?.low_stock_products || data.low_stock_products.length === 0 ? (
          <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl">
            <Package className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Healthy Stock Levels</p>
            <p className="text-xs text-slate-400">No active products are below the minimum threshold</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="bg-slate-50 px-5 py-3 grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-3">SKU Code</div>
              <div className="col-span-6">Product Title</div>
              <div className="col-span-3 text-right">Units Remaining</div>
            </div>

            {data.low_stock_products.map((item) => (
              <div
                key={item.id}
                className="px-5 py-3.5 grid grid-cols-12 items-center text-xs hover:bg-slate-50 transition"
              >
                <div className="col-span-3 font-mono text-slate-500 font-semibold">
                  #{item.product_code}
                </div>
                <div className="col-span-6 font-bold text-slate-900 truncate">
                  {item.product_name}
                </div>
                <div className="col-span-3 text-right">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                      item.stock_quantity === 0
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.stock_quantity} left
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
