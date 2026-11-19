"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Truck,
} from "lucide-react";
import { OrderDetail, OrderStatus, OrderSummary } from "@/types";
import { api } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  getOrderStatusBadge,
  getPaymentBadge,
} from "@/lib/utils";

const ALLOWED_NEXT_STATUSES: Record<string, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.listOrders({
        page,
        size: 15,
        status: statusFilter || undefined,
        search: search.trim() || undefined,
      });
      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleOpenDetail = async (orderId: number) => {
    setLoadingDetail(true);
    try {
      const data = await api.admin.getOrder(orderId);
      setSelectedOrder(data);
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to load order", type: "error" });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.admin.updateOrderStatus(selectedOrder.id, {
        status: newStatus as any,
      });
      setSelectedOrder(updated);
      setFeedback({ text: `Order updated to '${newStatus}'.`, type: "success" });
      loadOrders();
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to transition status", type: "error" });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const tabs = [
    { label: "All Orders", value: "" },
    { label: "Pending", value: "pending" },
    { label: "Confirmed", value: "confirmed" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Customer Orders
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review dispatch orders, transition lifecycle statuses, and audit receipts
        </p>
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

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab.value
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              loadOrders();
            }}
            className="relative w-full sm:max-w-md"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or recipient name..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <span className="text-xs text-slate-500 font-medium">
            Total Matching: {total}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Payment</th>
                <th className="py-3.5 px-6">Total</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No orders matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const statusBadge = getOrderStatusBadge(o.status);
                  const payBadge = getPaymentBadge(o.payment_status);

                  return (
                    <tr key={o.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">
                        {o.order_number}
                      </td>

                      <td className="py-3.5 px-6 text-slate-500 text-xs">
                        {formatDate(o.created_at)}
                      </td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${payBadge.className}`}
                        >
                          {o.payment_method.toUpperCase()} • {payBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-6 font-extrabold text-slate-900">
                        {formatCurrency(o.total_amount)}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleOpenDetail(o.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View & Update</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      {/* Order Detail & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-mono text-slate-400">Order Management</span>
                <h3 className="text-xl font-bold font-mono text-slate-900">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Status & Transitions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Current Status</span>
                  <p className="font-extrabold text-base capitalize text-slate-900">
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Payment</span>
                  <p className="font-bold text-xs uppercase text-slate-700">
                    {selectedOrder.payment_method} ({selectedOrder.payment_status})
                  </p>
                </div>
              </div>

              {/* Status Update Buttons */}
              {ALLOWED_NEXT_STATUSES[selectedOrder.status]?.length > 0 ? (
                <div className="pt-2 border-t border-slate-200">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Advance Status To:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {ALLOWED_NEXT_STATUSES[selectedOrder.status].map((nextSt) => (
                      <button
                        key={nextSt}
                        onClick={() => handleUpdateStatus(nextSt)}
                        disabled={updatingStatus}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs capitalize transition shadow-xs ${
                          nextSt === "cancelled"
                            ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                        }`}
                      >
                        {nextSt === "cancelled" ? "Cancel Order" : `Mark as ${nextSt}`}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic pt-1">
                  This order is in terminal state ({selectedOrder.status}). No further transitions allowed.
                </p>
              )}
            </div>

            {/* Recipient info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold uppercase">Customer & Phone</span>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.shipping_name}</p>
                <p className="text-slate-600">{selectedOrder.shipping_phone}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold uppercase">Delivery Destination</span>
                <p className="text-slate-700 leading-snug mt-0.5">{selectedOrder.shipping_address}</p>
              </div>
            </div>

            {/* Ordered Items list */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Products Purchased
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-900">{item.product_name}</p>
                      <span className="text-slate-400 font-mono">
                        #{item.product_code} • Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                      </span>
                    </div>
                    <span className="font-extrabold text-slate-900">
                      {formatCurrency(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-slate-100 pt-3 text-xs space-y-1 text-right max-w-xs ml-auto">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span>{formatCurrency(selectedOrder.shipping_fee)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-indigo-600">{formatCurrency(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
