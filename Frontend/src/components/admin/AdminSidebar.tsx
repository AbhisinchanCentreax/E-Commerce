"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Users,
  Store,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: Package,
      exact: false,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: Tags,
      exact: false,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: ClipboardList,
      exact: false,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: Users,
      exact: false,
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/30">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <span className="font-extrabold text-white text-base tracking-tight block">
            ShopVibe
          </span>
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Management
        </p>

        {links.map((item) => {
          const active = isActive(item.href, item.exact);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-6">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Storefront
          </p>
          <Link
            href="/"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-indigo-300 hover:bg-indigo-950/40 hover:text-indigo-200 transition"
          >
            <Store className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>View Public Store</span>
          </Link>
        </div>
      </div>

      {/* Admin User Card & Sign Out */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-white truncate">
              {user?.full_name || user?.username}
            </p>
            <p className="text-[11px] text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
