"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated, isAdmin, refreshUser } = useAuth();
  const [checking, setChecking] = React.useState(false);
  const router = useRouter();

  const handleRecheckPrivileges = async () => {
    setChecking(true);
    try {
      await refreshUser();
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <p className="text-sm font-medium text-slate-300">Verifying administrative privileges...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center text-white space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold">Access Restricted</h2>
          <p className="text-sm text-slate-400">
            The Admin Control Portal is restricted to administrative staff. Your current role is &quot;
            <span className="font-semibold text-rose-300">{user?.role || "guest"}</span>&quot;.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={handleRecheckPrivileges}
              disabled={checking}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
            >
              <Loader2 className={`w-3.5 h-3.5 ${checking ? "animate-spin" : "hidden"}`} />
              <span>{checking ? "Checking..." : "Re-Check Admin Privileges"}</span>
            </button>
            <button
              onClick={() => router.push("/login?redirect=/admin")}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold rounded-xl text-xs transition"
            >
              Sign in with Admin Credentials
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-semibold rounded-xl text-xs transition"
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
