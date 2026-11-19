"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { OrderSummary } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentBadge } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await api.orders.listMyOrders(page, 10);
        setOrders(res.items);
        setTotal(res.total);
        setTotalPages(res.pages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrders();
  }, [isAuthenticated, page]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <Package className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Your Orders</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please log in to track your current and past orders.
        </p>
        <Link
          href="/login?redirect=/orders"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Order History</h1>
        <p className="text-sm text-slate-500 mt-1">
          Track shipments, view payment receipts, and manage deliveries
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-200 rounded-3xl p-8 my-8 shadow-xs">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Once you place an order, all invoice receipts and delivery tracking updates will be displayed here.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition shadow-md shadow-indigo-600/20"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 pt-8">
          <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-xs">
            {orders.map((order) => {
              const statusBadge = getOrderStatusBadge(order.status);
              const paymentBadge = getPaymentBadge(order.payment_status);

              return (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {order.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${paymentBadge.className}`}
                      >
                        {order.payment_method.toUpperCase()} • {paymentBadge.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Placed on {formatDate(order.created_at)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-400 font-medium">Order Total</p>
                      <p className="text-lg font-extrabold text-slate-900">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <span className="text-xs font-semibold text-slate-600">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-300 rounded-xl disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
