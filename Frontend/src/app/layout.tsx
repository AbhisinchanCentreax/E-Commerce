import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartWishlistProvider } from "@/context/CartWishlistContext";

export const metadata: Metadata = {
  title: "ShopVibe - Modern E-Commerce & Admin Suite",
  description: "Complete modern e-commerce platform and administrative management portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col">
        <AuthProvider>
          <CartWishlistProvider>
            {children}
          </CartWishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
