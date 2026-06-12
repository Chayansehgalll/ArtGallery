/* ───────────────────────────────────────────────────────────
   Admin API client — talks to the backend at /api
   Token is stored in localStorage under "yashika_admin_token"
   ─────────────────────────────────────────────────────────── */

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env
    ?.VITE_API_URL || "http://localhost:4000/api";
const TOKEN_KEY = "yashika_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  message?: string;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, message: json.message || `Error ${res.status}` };
    }
    return { ok: true, data: json.data, message: json.message, meta: json.meta };
  } catch {
    return {
      ok: false,
      message: "Cannot reach the server. Make sure the backend is running.",
    };
  }
}

/* ── Auth ── */
export async function adminLogin(email: string, password: string) {
  const res = await request<{ admin: unknown; accessToken: string }>(
    "/auth/admin/login",
    { method: "POST", body: JSON.stringify({ email, password }) }
  );
  if (res.ok && res.data?.accessToken) {
    setToken(res.data.accessToken);
  }
  return res;
}

/* ── Dashboard ── */
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number | string;
  totalCustomers: number;
  totalPaintings: number;
  recentOrders: AdminOrder[];
  lowStock: { id: string; title: string; edition: number; editionTotal: number }[];
}
export function getDashboard() {
  return request<DashboardStats>("/admin/dashboard");
}

/* ── Image Upload ── */
export async function uploadImageFiles(files: FileList | File[]): Promise<ApiResult<{ urls: string[]; storage: string }>> {
  const token = getToken();
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append("images", f));
  try {
    const res = await fetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, message: json.message || `Error ${res.status}` };
    return { ok: true, data: json.data, message: json.message };
  } catch {
    return { ok: false, message: "Cannot reach the server. Make sure the backend is running." };
  }
}

/* ── Paintings ── */
export interface AdminPainting {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number | string;
  originalPrice?: number | string | null;
  width: number;
  height: number;
  medium: string;
  style?: string;
  year: number;
  edition: number;
  editionTotal: number;
  isOriginal: boolean;
  isFeatured: boolean;
  isActive: boolean;
  inStock: boolean;
  frameOptions: string[];
  tags: string[];
  images: string[];
  coverImage?: string;
  mainImage?: string;
  categoryId: string;
  category?: { id: string; name: string };
}
export function getPaintings(page = 1, limit = 50) {
  return request<AdminPainting[]>(`/paintings?page=${page}&limit=${limit}`);
}

export function createPainting(data: Record<string, unknown>, files?: { coverImage?: File; mainImage?: File; images?: File[] }) {
  const token = getToken();
  const fd = new FormData();
  
  // Add all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Send arrays as JSON strings so backend can parse them
      fd.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      fd.append(key, String(value));
    }
  });
  
  // Add file uploads
  if (files?.coverImage) fd.append("coverImage", files.coverImage);
  if (files?.mainImage) fd.append("mainImage", files.mainImage);
  if (files?.images && files.images.length > 0) {
    files.images.forEach(file => fd.append("images", file));
  }
  
  return new Promise<ApiResult<AdminPainting>>(async (resolve) => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/admin/paintings`, {
        method: "POST",
        headers,
        body: fd,
      });
      
      let json: any;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse response JSON:", await res.text());
        resolve({ ok: false, message: `Server error: ${res.status}` });
        return;
      }
      
      if (!res.ok) {
        resolve({ ok: false, message: json?.message || `Error ${res.status}` });
      } else {
        resolve({ ok: true, data: json?.data, message: json?.message });
      }
    } catch (err) {
      console.error("Request failed:", err);
      resolve({ ok: false, message: "Cannot reach the server. Make sure the backend is running." });
    }
  });
}

export function updatePainting(id: string, data: Record<string, unknown>, files?: { coverImage?: File; mainImage?: File; images?: File[] }) {
  const token = getToken();
  const fd = new FormData();
  
  // Add all form fields
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      // Send arrays as JSON strings so backend can parse them
      fd.append(key, JSON.stringify(value));
    } else if (value !== null && value !== undefined) {
      fd.append(key, String(value));
    }
  });
  
  // Add file uploads
  if (files?.coverImage) fd.append("coverImage", files.coverImage);
  if (files?.mainImage) fd.append("mainImage", files.mainImage);
  if (files?.images && files.images.length > 0) {
    files.images.forEach(file => fd.append("images", file));
  }
  
  return new Promise<ApiResult<AdminPainting>>(async (resolve) => {
    try {
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/admin/paintings/${id}`, {
        method: "PUT",
        headers,
        body: fd,
      });
      
      let json: any;
      try {
        json = await res.json();
      } catch (parseErr) {
        console.error("Failed to parse response JSON:", await res.text());
        resolve({ ok: false, message: `Server error: ${res.status}` });
        return;
      }
      
      if (!res.ok) {
        resolve({ ok: false, message: json?.message || `Error ${res.status}` });
      } else {
        resolve({ ok: true, data: json?.data, message: json?.message });
      }
    } catch (err) {
      console.error("Request failed:", err);
      resolve({ ok: false, message: "Cannot reach the server. Make sure the backend is running." });
    }
  });
}

export function deletePainting(id: string) {
  return request(`/admin/paintings/${id}`, { method: "DELETE" });
}

/* ── Categories ── */
export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { paintings: number };
}
export function getCategories() {
  return request<AdminCategory[]>("/categories");
}
export function createCategory(name: string) {
  return request<AdminCategory>("/admin/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}
export function deleteCategory(id: string) {
  return request(`/admin/categories/${id}`, { method: "DELETE" });
}

/* ── Orders ── */
export interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number | string;
  paymentStatus?: string;
  paymentReference?: string;
  paymentMethod?: string;
  shippingName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  createdAt: string;
  customer?: { name?: string; email?: string };
  items?: {
    id: string;
    quantity: number;
    price: number | string;
    frame?: string;
    painting?: { title: string; images: string[] };
  }[];
}
export function getOrders(page = 1, limit = 50, status?: string) {
  const q = status ? `&status=${status}` : "";
  return request<AdminOrder[]>(`/admin/orders?page=${page}&limit=${limit}${q}`);
}
export function getPendingPayments() {
  return request<AdminOrder[]>("/admin/orders/pending-payments");
}
export function updateOrderStatus(id: string, status: string) {
  return request<AdminOrder>(`/admin/orders/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}
export function verifyPayment(id: string, approved: boolean) {
  return request<AdminOrder>(`/admin/orders/${id}/verify-payment`, {
    method: "PUT",
    body: JSON.stringify({ approved }),
  });
}

/* ── Settings ── */
export interface PaymentSettings {
  upiId: string;
  payeeName: string;
  qrImage?: string;
  instructions: string;
}
export function getPaymentSettings() {
  return request<PaymentSettings>("/admin/settings/payment");
}
export function updatePaymentSettings(data: Partial<PaymentSettings>) {
  return request<PaymentSettings>("/admin/settings/payment", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
