import {
  Address,
  AddressCreate,
  AddressUpdate,
  CartItemAdd,
  CartItemUpdate,
  CartResponse,
  Category,
  CategoryCreate,
  CategoryUpdate,
  ChangePassword,
  CheckoutRequest,
  DashboardResponse,
  MessageResponse,
  OrderDetail,
  OrderResponse,
  OrderStatusUpdate,
  OrderSummary,
  Page,
  Product,
  ProductCreate,
  ProductSort,
  ProductUpdate,
  TokenResponse,
  User,
  UserCreate,
  UserUpdate,
  WishlistCheckResponse,
  WishlistItemAdd,
  WishlistResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// Get token from storage
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

export function setToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
  }
}

export function removeToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 204) {
    return {} as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let errorMsg = "Something went wrong";
    if (data && typeof data === "object") {
      if (typeof data.detail === "string") {
        errorMsg = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
      } else if (data.message) {
        errorMsg = data.message;
      }
    }
    // Auto-clean expired token on 401
    if (res.status === 401 && !endpoint.includes("/auth/login")) {
      removeToken();
    }
    throw new ApiError(res.status, errorMsg, data);
  }

  return data as T;
}

export const api = {
  // Authentication & Profile
  auth: {
    async register(data: UserCreate): Promise<User> {
      return request<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async login(username: string, password: string): Promise<TokenResponse> {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await request<TokenResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (res.access_token) {
        setToken(res.access_token);
      }
      return res;
    },

    async getMe(): Promise<User> {
      return request<User>("/users/me");
    },

    async updateMe(data: UserUpdate): Promise<User> {
      return request<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async changePassword(data: ChangePassword): Promise<MessageResponse> {
      return request<MessageResponse>("/users/me/password", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
  },

  // Categories (Public)
  categories: {
    async list(): Promise<Category[]> {
      return request<Category[]>("/categories/");
    },
    async get(id: number): Promise<Category> {
      return request<Category>(`/categories/${id}`);
    },
  },

  // Products (Public)
  products: {
    async list(params?: {
      page?: number;
      size?: number;
      search?: string;
      category_id?: number;
      min_price?: number;
      max_price?: number;
      in_stock?: boolean;
      sort?: ProductSort;
    }): Promise<Page<Product>> {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.size) searchParams.set("size", params.size.toString());
      if (params?.search) searchParams.set("search", params.search);
      if (params?.category_id) searchParams.set("category_id", params.category_id.toString());
      if (params?.min_price !== undefined) searchParams.set("min_price", params.min_price.toString());
      if (params?.max_price !== undefined) searchParams.set("max_price", params.max_price.toString());
      if (params?.in_stock !== undefined) searchParams.set("in_stock", params.in_stock.toString());
      if (params?.sort) searchParams.set("sort", params.sort);

      const query = searchParams.toString();
      return request<Page<Product>>(`/products/${query ? `?${query}` : ""}`);
    },

    async get(id: number): Promise<Product> {
      return request<Product>(`/products/${id}`);
    },
  },

  // Shopping Cart
  cart: {
    async get(): Promise<CartResponse> {
      return request<CartResponse>("/cart/");
    },

    async addItem(productId: number, quantity: number = 1): Promise<CartResponse> {
      const payload: CartItemAdd = { product_id: productId, quantity };
      return request<CartResponse>("/cart/items", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    async updateItem(itemId: number, quantity: number): Promise<CartResponse> {
      const payload: CartItemUpdate = { quantity };
      return request<CartResponse>(`/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
    },

    async removeItem(itemId: number): Promise<CartResponse> {
      return request<CartResponse>(`/cart/items/${itemId}`, {
        method: "DELETE",
      });
    },

    async clear(): Promise<void> {
      return request<void>("/cart/", {
        method: "DELETE",
      });
    },
  },

  // Wishlist
  wishlist: {
    async get(): Promise<WishlistResponse> {
      return request<WishlistResponse>("/wishlist/");
    },

    async addItem(productId: number): Promise<WishlistResponse> {
      const payload: WishlistItemAdd = { product_id: productId };
      return request<WishlistResponse>("/wishlist/items", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },

    async removeItem(productId: number): Promise<WishlistResponse> {
      return request<WishlistResponse>(`/wishlist/items/${productId}`, {
        method: "DELETE",
      });
    },

    async moveToCart(productId: number, quantity: number = 1): Promise<WishlistResponse> {
      return request<WishlistResponse>(`/wishlist/items/${productId}/move-to-cart?quantity=${quantity}`, {
        method: "POST",
      });
    },

    async check(productId: number): Promise<WishlistCheckResponse> {
      return request<WishlistCheckResponse>(`/wishlist/check/${productId}`);
    },

    async clear(): Promise<void> {
      return request<void>("/wishlist/", {
        method: "DELETE",
      });
    },
  },

  // Addresses
  addresses: {
    async list(): Promise<Address[]> {
      return request<Address[]>("/addresses/");
    },

    async create(data: AddressCreate): Promise<Address> {
      return request<Address>("/addresses/", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async update(id: number, data: AddressUpdate): Promise<Address> {
      return request<Address>(`/addresses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async delete(id: number): Promise<void> {
      return request<void>(`/addresses/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Orders
  orders: {
    async checkout(data: CheckoutRequest): Promise<OrderDetail> {
      return request<OrderDetail>("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async listMyOrders(page: number = 1, size: number = 10): Promise<Page<OrderSummary>> {
      return request<Page<OrderSummary>>(`/orders/?page=${page}&size=${size}`);
    },

    async getMyOrder(orderId: number): Promise<OrderDetail> {
      return request<OrderDetail>(`/orders/${orderId}`);
    },

    async cancelMyOrder(orderId: number): Promise<OrderDetail> {
      return request<OrderDetail>(`/orders/${orderId}/cancel`, {
        method: "POST",
      });
    },

    async payOrder(orderId: number): Promise<OrderDetail> {
      return request<OrderDetail>(`/orders/${orderId}/pay`, {
        method: "POST",
      });
    },
  },

  // Admin Management Endpoints
  admin: {
    async getDashboard(): Promise<DashboardResponse> {
      return request<DashboardResponse>("/admin/dashboard");
    },

    // Categories
    async listCategories(): Promise<Category[]> {
      return request<Category[]>("/admin/categories");
    },

    async createCategory(data: CategoryCreate): Promise<Category> {
      return request<Category>("/admin/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
      return request<Category>(`/admin/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async deleteCategory(id: number): Promise<void> {
      return request<void>(`/admin/categories/${id}`, {
        method: "DELETE",
      });
    },

    // Products
    async listProducts(params?: {
      page?: number;
      size?: number;
      search?: string;
    }): Promise<Page<Product>> {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.size) searchParams.set("size", params.size.toString());
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return request<Page<Product>>(`/admin/products${query ? `?${query}` : ""}`);
    },

    async createProduct(data: ProductCreate): Promise<Product> {
      return request<Product>("/admin/products", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },

    async updateProduct(id: number, data: ProductUpdate): Promise<Product> {
      return request<Product>(`/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },

    async deleteProduct(id: number): Promise<void> {
      return request<void>(`/admin/products/${id}`, {
        method: "DELETE",
      });
    },

    // Orders
    async listOrders(params?: {
      page?: number;
      size?: number;
      status?: string;
      search?: string;
    }): Promise<Page<OrderSummary>> {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.size) searchParams.set("size", params.size.toString());
      if (params?.status) searchParams.set("status", params.status);
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return request<Page<OrderSummary>>(`/admin/orders${query ? `?${query}` : ""}`);
    },

    async getOrder(id: number): Promise<OrderDetail> {
      return request<OrderDetail>(`/admin/orders/${id}`);
    },

    async updateOrderStatus(id: number, data: OrderStatusUpdate): Promise<OrderDetail> {
      return request<OrderDetail>(`/admin/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },

    // Users
    async listUsers(params?: {
      page?: number;
      size?: number;
      search?: string;
    }): Promise<Page<User>> {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.size) searchParams.set("size", params.size.toString());
      if (params?.search) searchParams.set("search", params.search);
      const query = searchParams.toString();
      return request<Page<User>>(`/admin/users${query ? `?${query}` : ""}`);
    },

    async setUserStatus(userId: number, isActive: boolean): Promise<User> {
      return request<User>(`/admin/users/${userId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      });
    },
  },
};
