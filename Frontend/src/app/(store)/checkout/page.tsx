"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CreditCard,
  Banknote,
  Plus,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { Address, AddressCreate, PaymentMethod } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useCartWishlist } from "@/context/CartWishlistContext";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, fetchCart } = useCartWishlist();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // New Address Modal / Form state
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<AddressCreate>({
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    is_default: true,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadData() {
      setIsLoading(true);
      try {
        const addressList = await api.addresses.list();
        setAddresses(addressList);
        // Default to the default address or first address
        const def = addressList.find((a) => a.is_default) || addressList[0];
        if (def) {
          setSelectedAddressId(def.id);
        } else {
          setShowNewAddressForm(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <ShieldCheck className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to Checkout</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please log in to your account to complete your purchase.
        </p>
        <Link
          href="/login?redirect=/checkout"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = Number(cart?.subtotal || 0);
  const shippingFee = Number(cart?.shipping_fee || 0);
  const totalAmount = Number(cart?.total_amount || 0);

  if (!isLoading && items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please add items to your shopping bag before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Explore Catalog
        </Link>
      </div>
    );
  }

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const created = await api.addresses.create({
        ...newAddress,
        full_name: newAddress.full_name.trim(),
        phone: newAddress.phone.trim(),
        address_line1: newAddress.address_line1.trim(),
        address_line2: newAddress.address_line2?.trim() || undefined,
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        pincode: newAddress.pincode.trim(),
      });
      setAddresses((prev) => [...prev, created]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
      setNewAddress({
        full_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default: false,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save address");
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setErrorMessage("Please select or add a shipping address.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const order = await api.orders.checkout({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });
      await fetchCart();
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Checkout failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-slate-500 mt-1">Complete your delivery & payment options</p>
      </div>

      {errorMessage && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-8 items-start">
        {/* Left Column: Delivery & Payment Options */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Delivery Address */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-slate-900">Delivery Address</h2>
              </div>

              {!showNewAddressForm && (
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add New Address
                </button>
              )}
            </div>

            {/* Existing addresses list */}
            {!showNewAddressForm && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition relative flex flex-col justify-between ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-900 text-sm">{addr.full_name}</p>
                          {addr.is_default && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.address_line1}
                          {addr.address_line2 && `, ${addr.address_line2}`}
                        </p>
                        <p className="text-xs text-slate-600">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs font-medium text-slate-500 pt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Deliver to this address</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* New Address Form */}
            {showNewAddressForm && (
              <form onSubmit={handleCreateAddress} className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-slate-800">Add New Shipping Address</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.full_name}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, full_name: e.target.value })
                      }
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, phone: e.target.value })
                      }
                      placeholder="10-digit mobile number"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Street Address (Line 1) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.address_line1}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address_line1: e.target.value })
                    }
                    placeholder="House/Flat No., Building name, Street"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Apartment, suite, unit (Line 2 - Optional)
                  </label>
                  <input
                    type="text"
                    value={newAddress.address_line2 || ""}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, address_line2: e.target.value })
                    }
                    placeholder="Landmark, Area, Floor"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      placeholder="City"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      placeholder="State"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Pincode (6 digits) *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="^\d{6}$"
                      maxLength={6}
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      placeholder="e.g. 560001"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition"
                  >
                    Save & Use Address
                  </button>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}
          </section>

          {/* Step 2: Payment Method */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod("cod")}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition space-y-2 ${
                  paymentMethod === "cod"
                    ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Cash on Delivery</p>
                      <p className="text-xs text-slate-500">Pay when your order arrives</p>
                    </div>
                  </div>
                  {paymentMethod === "cod" && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </div>

              {/* Online Payment (Mock) */}
              <div
                onClick={() => setPaymentMethod("online")}
                className={`cursor-pointer p-5 rounded-2xl border-2 transition space-y-2 ${
                  paymentMethod === "online"
                    ? "border-indigo-600 bg-indigo-50/40 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Online Payment</p>
                      <p className="text-xs text-slate-500">Instant Mock Gateway simulation</p>
                    </div>
                  </div>
                  {paymentMethod === "online" && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 sticky top-28 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4">
              Items in Order ({items.length})
            </h3>

            {/* List preview */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {items.map((it) => (
                <div key={it.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-800 truncate">{it.product_name}</p>
                    <p className="text-slate-400">Qty: {it.quantity} × {formatCurrency(it.unit_price)}</p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(it.line_total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Breakdown */}
            <div className="border-t border-slate-100 pt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase text-xs">FREE</span>
                  ) : (
                    formatCurrency(shippingFee)
                  )}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between text-base">
                <span className="font-bold text-slate-900">Total Payable</span>
                <span className="font-extrabold text-xl text-indigo-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || !selectedAddressId}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-2xl text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:-translate-y-0.5"
            >
              <span>{isSubmitting ? "Placing Order..." : "Confirm & Place Order"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Safe Delivery Assured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
