// Common Pagination
export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface MessageResponse {
  message: string;
}

// User & Auth
export type UserRole = "customer" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserCreate {
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  password: string;
}

export interface UserUpdate {
  email?: string;
  full_name?: string;
  phone?: string;
}

export interface ChangePassword {
  current_password: string;
  new_password: string;
}

export interface UserStatusUpdate {
  is_active: boolean;
}

// Category
export interface Category {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CategoryBrief {
  id: number;
  name: string;
}

export interface CategoryCreate {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryUpdate {
  name?: string;
  description?: string;
  is_active?: boolean;
}

// Product
export interface Product {
  id: number;
  product_code: string;
  product_name: string;
  description?: string | null;
  category_id: number;
  category?: CategoryBrief | null;
  unit_price: number | string;
  stock_quantity: number;
  image_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string | null;
}

export interface ProductCreate {
  product_code: string;
  product_name: string;
  description?: string;
  category_id: number;
  unit_price: number;
  stock_quantity: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ProductUpdate {
  product_code?: string;
  product_name?: string;
  description?: string;
  category_id?: number;
  unit_price?: number;
  stock_quantity?: number;
  image_url?: string;
  is_active?: boolean;
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

// Cart
export interface CartItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  image_url?: string | null;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
  stock_quantity: number;
  in_stock: boolean;
}

export interface CartResponse {
  items: CartItem[];
  total_items: number;
  subtotal: number | string;
  shipping_fee: number | string;
  total_amount: number | string;
}

export interface CartItemAdd {
  product_id: number;
  quantity: number;
}

export interface CartItemUpdate {
  quantity: number;
}

// Wishlist
export interface WishlistItemAdd {
  product_id: number;
}

export interface WishlistItem {
  id: number;
  product_id: number;
  product_name: string;
  product_code: string;
  image_url?: string | null;
  unit_price: number | string;
  stock_quantity: number;
  in_stock: boolean;
  created_at: string;
}

export interface WishlistResponse {
  items: WishlistItem[];
  total_items: number;
}

export interface WishlistCheckResponse {
  product_id: number;
  in_wishlist: boolean;
}

// Address
export interface Address {
  id: number;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface AddressCreate {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  is_default?: boolean;
}

export interface AddressUpdate {
  full_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  is_default?: boolean;
}

// Order
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "online";
export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface OrderItem {
  id: number;
  product_id?: number | null;
  product_code: string;
  product_name: string;
  unit_price: number | string;
  quantity: number;
  line_total: number | string;
}

export interface OrderSummary {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_amount: number | string;
  created_at: string;
}

export interface OrderDetail extends OrderSummary {
  user_id: number;
  subtotal: number | string;
  shipping_fee: number | string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  updated_at?: string | null;
  items: OrderItem[];
}

export type OrderResponse = OrderDetail;

export interface CheckoutRequest {
  address_id: number;
  payment_method: PaymentMethod;
}

export interface OrderStatusUpdate {
  status: "confirmed" | "shipped" | "delivered" | "cancelled";
}

// Admin Dashboard
export interface LowStockProduct {
  id: number;
  product_code: string;
  product_name: string;
  stock_quantity: number;
}

export interface DashboardResponse {
  total_users: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  total_revenue: number | string;
  low_stock_products: LowStockProduct[];
}
