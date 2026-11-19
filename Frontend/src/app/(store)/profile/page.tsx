"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, Lock, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-white border border-slate-200 rounded-3xl shadow-sm">
        <UserIcon className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900">Sign in to View Profile</h2>
        <Link
          href="/login?redirect=/profile"
          className="mt-6 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateUser({
        full_name: profileData.full_name || undefined,
        email: profileData.email || undefined,
        phone: profileData.phone || undefined,
      });
      setProfileMsg({ text: "Profile information updated successfully!", type: "success" });
    } catch (err: any) {
      setProfileMsg({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ text: "New passwords do not match", type: "error" });
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordMsg({ text: "New password must be at least 6 characters long", type: "error" });
      return;
    }

    setSavingPassword(true);
    try {
      await api.auth.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
      setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      setPasswordMsg({ text: err.message || "Failed to change password", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Account & Security</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your credentials, personal details, and preferences</p>
      </div>

      {/* Account Overview Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-md">
        <div className="w-20 h-20 rounded-2xl bg-indigo-500/30 border border-white/20 flex items-center justify-center text-3xl font-extrabold text-white shrink-0">
          {user?.full_name?.charAt(0) || user?.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl font-bold">{user?.full_name || user?.username}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-indigo-200">Username: @{user?.username}</p>
          <p className="text-xs text-slate-400">
            Member since {formatDate(user?.created_at)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <UserIcon className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Personal Information</h3>
          </div>

          {profileMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {profileMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="Mobile number"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>

        {/* Change Password Form */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900">Change Password</h3>
          </div>

          {passwordMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {passwordMsg.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current_password: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={72}
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                maxLength={72}
                value={passwordData.confirm_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm_password: e.target.value })
                }
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
