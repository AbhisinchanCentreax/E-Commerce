import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "₹0.00";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getOrderStatusBadge(status: string): { label: string; className: string } {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "pending":
      return {
        label: "Pending",
        className: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "shipped":
      return {
        label: "Shipped",
        className: "bg-purple-100 text-purple-800 border-purple-300",
      };
    case "delivered":
      return {
        label: "Delivered",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-rose-100 text-rose-800 border-rose-300",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-800 border-gray-300",
      };
  }
}

export function getPaymentBadge(status: string): { label: string; className: string } {
  const normalized = status.toLowerCase();
  switch (normalized) {
    case "paid":
      return {
        label: "Paid",
        className: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "unpaid":
      return {
        label: "Unpaid",
        className: "bg-amber-100 text-amber-800 border-amber-300",
      };
    case "refunded":
      return {
        label: "Refunded",
        className: "bg-gray-100 text-gray-700 border-gray-300",
      };
    default:
      return {
        label: status,
        className: "bg-gray-100 text-gray-800 border-gray-300",
      };
  }
}
