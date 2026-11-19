"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  CreditCard,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Truck,
  MapPin,
  Calendar,
} from "lucide-react";
import { OrderDetail } from "@/types";
import { api } from "@/lib/api";
import { formatCurrency, formatDate, getOrderStatusBadge, getPaymentBadge } from "@/lib/utils";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const orderId = parseInt(resolvedParams.id);

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadOrder = async () => {
    setIsLoading(true);
    try {
      const data = await api.orders.getMyOrder(orderId);
      setOrder(data);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: err.message || "Failed to load order", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-xs">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Could not find the requested order record in your account.
        </p>
        <Link
          href="/orders"
          className="mt-6 inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl text-xs"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusBadge = getOrderStatusBadge(order.status);
  const paymentBadge = getPaymentBadge(order.payment_status);
  const canCancel = order.status === "pending" || order.status === "confirmed";
  const canPayOnline =
    order.payment_method === "online" &&
    order.payment_status === "unpaid" &&
    order.status === "pending";

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order? The reserved items will be returned to stock.")) {
      return;
    }
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await api.orders.cancelMyOrder(order.id);
      setOrder(updated);
      setMessage({ text: "Order has been successfully cancelled and restocked.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to cancel order", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMockPay = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      const updated = await api.orders.payOrder(order.id);
      setOrder(updated);
      setMessage({ text: "Mock payment processed successfully! Order confirmed.", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Payment simulation failed", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono text-slate-900">
                {order.order_number}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}
              >
                {statusBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Placed on {formatDate(order.created_at)}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2">
            {canPayOnline && (
              <button
                onClick={handleMockPay}
                disabled={actionLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Simulate Mock Payment</span>
              </button>
            )}

            {canCancel && (
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Order</span>
              </button>
            )}
          </div>
        </div>

        {/* Shipping & Payment Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Shipping Address
            </h4>
            <p className="text-sm font-bold text-slate-900">{order.shipping_name}</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {order.shipping_address}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              Contact: {order.shipping_phone}
            </p>
          </div>

          {/* Payment Status */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
              Payment Details
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 uppercase">
                Method: {order.payment_method}
              </span>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${paymentBadge.className}`}
              >
                {paymentBadge.label}
              </span>
            </div>
            {order.payment_method === "online" && order.payment_status === "unpaid" && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                Order is pending online payment. Click &apos;Simulate Mock Payment&apos; above to mark as paid.
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Ordered Items</h3>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between text-sm hover:bg-slate-50/50"
              >
                <div>
                  <p className="font-semibold text-slate-900">{item.product_name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    SKU: {item.product_code} • Qty: {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <span className="font-bold text-slate-900">
                  {formatCurrency(item.line_total)}
                </span>
              </div>
            ))}
          </div>

          {/* Cost calculation */}
          <div className="pt-2 space-y-2 text-sm text-right max-w-xs ml-auto">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping Fee</span>
              <span className="font-medium text-slate-900">
                {Number(order.shipping_fee) === 0 ? "FREE" : formatCurrency(order.shipping_fee)}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-base text-slate-900">
              <span>Total Paid</span>
              <span className="text-indigo-600 text-lg">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
