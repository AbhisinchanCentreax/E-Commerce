"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.admin.listUsers({
        page,
        size: 15,
        search: search.trim() || undefined,
      });
      setUsers(res.items);
      setTotal(res.total);
      setTotalPages(res.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleStatus = async (user: User) => {
    const newStatus = !user.is_active;
    const action = newStatus ? "activate" : "disable";
    if (!confirm(`Are you sure you want to ${action} user '${user.username}'?`)) {
      return;
    }

    try {
      await api.admin.setUserStatus(user.id, newStatus);
      setFeedback({
        text: `User '${user.username}' is now ${newStatus ? "active" : "disabled"}.`,
        type: "success",
      });
      loadUsers();
    } catch (err: any) {
      setFeedback({ text: err.message || "Failed to update user status", type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          User Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage registered customer profiles, administrative roles, and account access
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

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadUsers();
          }}
          className="relative w-full sm:max-w-md"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username, email, or name..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-hidden focus:border-indigo-500 focus:bg-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <span className="text-xs text-slate-500 font-medium">
          Total Users: {total}
        </span>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-6">User</th>
                <th className="py-3.5 px-6">Email & Phone</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Registered</th>
                <th className="py-3.5 px-6 text-right">Access Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.full_name?.charAt(0) || u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">
                            {u.full_name || u.username}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            @{u.username}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-6">
                      <p className="font-medium text-slate-800">{u.email}</p>
                      <p className="text-slate-400 text-xs">{u.phone || "No phone"}</p>
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-purple-100 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.is_active ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>

                    <td className="py-3.5 px-6 text-slate-500 text-xs">
                      {formatDate(u.created_at)}
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      {currentAdmin?.id === u.id ? (
                        <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">
                          Current Admin (Self)
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 transition ${
                            u.is_active
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Disable Account</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Enable Account</span>
                            </>
                          )}
                        </button>
                      )}
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
    </div>
  );
}
