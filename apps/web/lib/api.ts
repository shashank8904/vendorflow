/**
 * Type-safe API client for VendorFlow Next.js frontend.
 * Communicates with the Express 5 + Prisma 7 backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

const DEFAULT_COMPANY_ID =
  process.env.NEXT_PUBLIC_COMPANY_ID || "cmst2b7g300003tq26vsar2se";

// ─── Shared Response Types ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ─── Entity Types ────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  contactPerson: string;
  email: string | null;
  phone: string;
  address: string | null;
  gstNumber: string | null;
  notes: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _count?: {
    purchaseOrders?: number;
    calls?: number;
  };
  purchaseOrders?: PurchaseOrder[];
}

export interface PurchaseOrder {
  id: string;
  companyId: string;
  vendorId: string;
  poNumber: string;
  description: string | null;
  amount: number;
  expectedDelivery: string | null;
  status: "PENDING" | "CONFIRMED" | "DELAYED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  vendor?: {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
  };
  calls?: CallItem[];
  _count?: {
    calls?: number;
  };
}

export interface CallItem {
  id: string;
  purchaseOrderId: string;
  vendorId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  transcript: string | null;
  startedAt: string | null;
  endedAt: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
  result?: {
    id: string;
    accepted: boolean | null;
    deliveryDate: string | null;
    quantity: number | null;
    delayReason: string | null;
    summary: string | null;
    confidence: number | null;
  } | null;
  /** Populated by the /calls endpoint */
  purchaseOrder?: {
    id: string;
    poNumber: string;
    companyId: string;
    vendor?: {
      id: string;
      name: string;
      phone: string;
      contactPerson?: string;
    };
  };
}


export interface DashboardSummary {
  vendorCount: number;
  activeVendors: number;
  inactiveVendors: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  delayedOrders: number;
  cancelledOrders: number;
}

export interface DashboardActivity {
  recentVendors: {
    id: string;
    name: string;
    contactPerson: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }[];
  recentOrders: {
    id: string;
    poNumber: string;
    amount: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    vendor: { id: string; name: string };
  }[];
}

export interface DashboardMetrics {
  totalOrderValue: number;
  averageOrderValue: number;
  totalOrders: number;
  callsByStatus: Record<string, number>;
}

export interface MonthlyOrderItem {
  month: string;
  count: number;
  totalAmount: number;
}

export interface VendorPerformanceItem {
  id: string;
  name: string;
  status: string;
  totalOrders: number;
  totalCalls: number;
  totalValue: number;
  statusDistribution: Record<string, number>;
}

export interface DelayAnalysisData {
  totalDelayed: number;
  averageDelayDays: number;
  delays: {
    id: string;
    poNumber: string;
    vendor: { id: string; name: string };
    expectedDelivery: string | null;
    delayDays: number;
  }[];
}

export interface StatusDistributionItem {
  status: string;
  count: number;
  totalAmount: number;
}

export interface NotificationItem {
  id: string;
  companyId: string;
  userId: string | null;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
  deletedAt: string | null;
}

// ─── HTTP Helper ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Company-Id": DEFAULT_COMPANY_ID,
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const json: ApiResponse<T> = await response.json();

  if (!response.ok || !json.success) {
    const errorMsg =
      json.message ||
      (json.errors && json.errors.length ? json.errors.join(", ") : "Request failed");
    throw new Error(errorMsg);
  }

  return json.data;
}

// ─── API Namespaces ──────────────────────────────────────────────────────────

export const vendorsApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    status?: string;
  }): Promise<PaginatedData<Vendor>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.sort) query.set("sort", params.sort);
    if (params?.order) query.set("order", params.order);
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status !== "all") query.set("status", params.status.toUpperCase());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedData<Vendor>>(`/vendors${qs}`);
  },

  async getById(id: string): Promise<Vendor> {
    return request<Vendor>(`/vendors/${id}`);
  },

  async create(data: {
    name: string;
    contactPerson: string;
    phone: string;
    email?: string;
    address?: string;
    gstNumber?: string;
    notes?: string;
  }): Promise<Vendor> {
    return request<Vendor>("/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      contactPerson: string;
      phone: string;
      email: string;
      address: string;
      gstNumber: string;
      notes: string;
      status: "ACTIVE" | "INACTIVE";
    }>
  ): Promise<Vendor> {
    return request<Vendor>(`/vendors/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/vendors/${id}`, {
      method: "DELETE",
    });
  },
};

export const purchaseOrdersApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    search?: string;
    status?: string;
    vendorId?: string;
  }): Promise<PaginatedData<PurchaseOrder>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.sort) query.set("sort", params.sort);
    if (params?.order) query.set("order", params.order);
    if (params?.search) query.set("search", params.search);
    if (params?.status && params.status !== "all")
      query.set("status", params.status.toUpperCase());
    if (params?.vendorId) query.set("vendorId", params.vendorId);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedData<PurchaseOrder>>(`/purchase-orders${qs}`);
  },

  async getById(id: string): Promise<PurchaseOrder> {
    return request<PurchaseOrder>(`/purchase-orders/${id}`);
  },

  async create(data: {
    vendorId: string;
    description?: string;
    amount: number;
    expectedDelivery?: string;
  }): Promise<PurchaseOrder> {
    return request<PurchaseOrder>("/purchase-orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: {
      description?: string;
      amount?: number;
      expectedDelivery?: string;
    }
  ): Promise<PurchaseOrder> {
    return request<PurchaseOrder>(`/purchase-orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async updateStatus(
    id: string,
    status: "PENDING" | "CONFIRMED" | "DELAYED" | "CANCELLED"
  ): Promise<PurchaseOrder> {
    return request<PurchaseOrder>(`/purchase-orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async delete(id: string): Promise<void> {
    return request<void>(`/purchase-orders/${id}`, {
      method: "DELETE",
    });
  },
};

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return request<DashboardSummary>("/dashboard/summary");
  },

  async getActivity(): Promise<DashboardActivity> {
    return request<DashboardActivity>("/dashboard/activity");
  },

  async getMetrics(): Promise<DashboardMetrics> {
    return request<DashboardMetrics>("/dashboard/metrics");
  },
};

export const analyticsApi = {
  async getMonthlyOrders(): Promise<MonthlyOrderItem[]> {
    return request<MonthlyOrderItem[]>("/analytics/monthly-orders");
  },

  async getVendorPerformance(): Promise<VendorPerformanceItem[]> {
    return request<VendorPerformanceItem[]>("/analytics/vendor-performance");
  },

  async getDelayAnalysis(): Promise<DelayAnalysisData> {
    return request<DelayAnalysisData>("/analytics/delay-analysis");
  },

  async getStatusDistribution(): Promise<StatusDistributionItem[]> {
    return request<StatusDistributionItem[]>("/analytics/status-distribution");
  },

  async getCallStatistics(): Promise<{
    totalCalls: number;
    byStatus: Record<string, number>;
    averageDuration: number | null;
    successRate: number | null;
    note: string;
  }> {
    return request("/analytics/call-statistics");
  },
};

export const notificationsApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<PaginatedData<NotificationItem>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.isRead !== undefined) query.set("isRead", params.isRead.toString());

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedData<NotificationItem>>(`/notifications${qs}`);
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return request<{ unreadCount: number }>("/notifications/unread-count");
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    return request<NotificationItem>(`/notifications/${id}/read`, {
      method: "PATCH",
    });
  },

  async markAllAsRead(): Promise<{ markedCount: number }> {
    return request<{ markedCount: number }>("/notifications/read-all", {
      method: "PATCH",
    });
  },
};

export const callsApi = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: "asc" | "desc";
    status?: string;
    purchaseOrderId?: string;
    vendorId?: string;
  }): Promise<PaginatedData<CallItem>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", params.page.toString());
    if (params?.limit) query.set("limit", params.limit.toString());
    if (params?.sort) query.set("sort", params.sort);
    if (params?.order) query.set("order", params.order);
    if (params?.status && params.status !== "all")
      query.set("status", params.status.toUpperCase());
    if (params?.purchaseOrderId)
      query.set("purchaseOrderId", params.purchaseOrderId);
    if (params?.vendorId) query.set("vendorId", params.vendorId);

    const qs = query.toString() ? `?${query.toString()}` : "";
    return request<PaginatedData<CallItem>>(`/calls${qs}`);
  },

  async getById(id: string): Promise<CallItem> {
    return request<CallItem>(`/calls/${id}`);
  },
};

export const healthApi = {

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    database: { status: string; latencyMs: number };
  }> {
    return request("/health");
  },
};

export const prsApi = {
  async getAll(params?: any): Promise<any> {
    const query = new URLSearchParams(params as any);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/prs${qs}`);
  },
  async getById(id: string): Promise<any> {
    return request(`/prs/${id}`);
  },
  async create(data: any): Promise<any> {
    return request("/prs", { method: "POST", body: JSON.stringify(data) });
  },
  async submit(id: string): Promise<any> {
    return request(`/prs/${id}/submit`, { method: "POST" });
  },
};

export const rfqsApi = {
  async getAll(params?: any): Promise<any> {
    const query = new URLSearchParams(params as any);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/rfqs${qs}`);
  },
  async getById(id: string): Promise<any> {
    return request(`/rfqs/${id}`);
  },
  async create(data: any): Promise<any> {
    return request("/rfqs", { method: "POST", body: JSON.stringify(data) });
  },
  async collectQuotes(id: string): Promise<any> {
    return request(`/rfqs/${id}/collect-quotes`, { method: "POST" });
  },
};

export const itemsApi = {
  async getAll(params?: any): Promise<any> {
    const query = new URLSearchParams(params as any);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/items${qs}`);
  },
  async getById(id: string): Promise<any> {
    return request(`/items/${id}`);
  },
  async create(data: any): Promise<any> {
    return request("/items", { method: "POST", body: JSON.stringify(data) });
  },
};

export const authApi = {
  async login(data: any): Promise<any> {
    return request("/auth/login", { method: "POST", body: JSON.stringify(data) });
  },
  async register(data: any): Promise<any> {
    return request("/auth/register", { method: "POST", body: JSON.stringify(data) });
  },
};

export const tallyApi = {
  async importVendors(): Promise<any> {
    return request("/tally/import-vendors", { method: "POST" });
  },
  async syncPO(id: string): Promise<any> {
    return request(`/tally/po/${id}/sync`, { method: "POST" });
  },
};
