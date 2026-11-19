"use client";

import React from "react";
import Link from "next/link";
import { Store, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          FastAPI Backend Connected
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
        >
          <Store className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Store Preview</span>
        </Link>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-bold text-slate-900 leading-tight">
              {user?.username}
            </span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide">
              Administrator
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
