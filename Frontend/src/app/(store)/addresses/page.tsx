"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, Edit2, Check, AlertCircle } from "lucide-react";
import { Address, AddressCreate, AddressUpdate } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AddressesPage() {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState<AddressCreate>({
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

  const loadAddresses = async () => {
    setIsLoading(true);
    try {
      const data = await api.addresses.list();
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadAddresses();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <MapPin className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Delivery Addresses</h2>
        <p className="text-slate-500 mt-2 text-sm">
          Please log in to manage your saved shipping addresses.
        </p>
        <Link
          href="/login?redirect=/addresses"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setFormData({
      full_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      is_default: addresses.length === 0,
    });
    setIsAdding(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (addr: Address) => {
    setIsAdding(false);
    setEditingAddress(addr);
    setFormData({
      full_name: addr.full_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      country: addr.country,
      is_default: addr.is_default,
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const payload = {
      ...formData,
      full_name: formData.full_name.trim(),
      phone: formData.phone.trim(),
      address_line1: formData.address_line1.trim(),
      address_line2: formData.address_line2?.trim() || undefined,
      city: formData.city.trim(),
      state: formData.state.trim(),
      pincode: formData.pincode.trim(),
    };
    try {
      if (editingAddress) {
        await api.addresses.update(editingAddress.id, payload);
        setSuccess("Address updated successfully!");
        setEditingAddress(null);
      } else {
        await api.addresses.create(payload);
        setSuccess("Address added successfully!");
        setIsAdding(false);
      }
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || "Failed to save address");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      await api.addresses.delete(id);
      await loadAddresses();
      setSuccess("Address deleted.");
    } catch (err: any) {
      setError(err.message || "Failed to delete address");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Saved Addresses</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your delivery destinations for quick and easy checkout
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Address</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-sm text-emerald-700">
          <Check className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Address Form (Add or Edit) */}
      {(isAdding || editingAddress) && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            {editingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
          </h2>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number (min 10 digits) *
                </label>
                <input
                  type="tel"
                  required
                  minLength={10}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                value={formData.address_line2 || ""}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 rounded-sm text-indigo-600 focus:ring-indigo-500 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Set as Default Address
                </span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition"
              >
                Save Address
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setEditingAddress(null);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl p-8">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No saved addresses</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Add your primary shipping address to enjoy 1-click checkout.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-5 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-base">{addr.full_name}</h4>
                  {addr.is_default && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Default
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                </p>
                <p className="text-xs text-slate-600">
                  {addr.city}, {addr.state} - {addr.pincode}
                </p>
                <p className="text-xs text-slate-400 font-mono pt-1">
                  Phone: {addr.phone}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(addr)}
                  className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
