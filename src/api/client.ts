import {
  Product,
  SaleCampaign,
  Order,
  FraudAlert,
  SystemMetrics,
  AuditLog,
  ApiConfig,
  FraudStatus,
  OrderStatus
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CAMPAIGNS,
  INITIAL_ORDERS,
  INITIAL_FRAUD_ALERTS,
  INITIAL_SYSTEM_METRICS,
  INITIAL_AUDIT_LOGS,
} from '../data/sampleData';

const CONFIG_STORAGE_KEY = 'flashguard_api_config';
const DEMO_PRODUCTS_KEY = 'flashguard_demo_products';
const DEMO_ORDERS_KEY = 'flashguard_demo_orders';
const DEMO_CAMPAIGNS_KEY = 'flashguard_demo_campaigns';
const DEMO_FRAUD_KEY = 'flashguard_demo_fraud';
const DEMO_AUDIT_KEY = 'flashguard_demo_audit';

export const DEFAULT_API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:8000',
  isDemoMode: true,
  timeoutMs: 4000,
};

class ApiClient {
  private config: ApiConfig;

  // In-memory or localStorage cache for demo mode mutations
  private productsCache: Product[];
  private campaignsCache: SaleCampaign[];
  private ordersCache: Order[];
  private fraudAlertsCache: FraudAlert[];
  private auditLogsCache: AuditLog[];

  constructor() {
    this.config = this.loadConfig();
    this.productsCache = this.loadFromStorage(DEMO_PRODUCTS_KEY, INITIAL_PRODUCTS);
    this.campaignsCache = this.loadFromStorage(DEMO_CAMPAIGNS_KEY, INITIAL_CAMPAIGNS);
    this.ordersCache = this.loadFromStorage(DEMO_ORDERS_KEY, INITIAL_ORDERS);
    this.fraudAlertsCache = this.loadFromStorage(DEMO_FRAUD_KEY, INITIAL_FRAUD_ALERTS);
    this.auditLogsCache = this.loadFromStorage(DEMO_AUDIT_KEY, INITIAL_AUDIT_LOGS);
  }

  private loadConfig(): ApiConfig {
    try {
      const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_API_CONFIG, ...JSON.parse(saved) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_API_CONFIG };
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<ApiConfig>): ApiConfig {
    this.config = { ...this.config, ...newConfig };
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save API config to localStorage', e);
    }
    return { ...this.config };
  }

  private loadFromStorage<T>(key: string, defaultData: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return defaultData;
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Could not persist ${key}`, e);
    }
  }

  public resetDemoData(): void {
    localStorage.removeItem(DEMO_PRODUCTS_KEY);
    localStorage.removeItem(DEMO_ORDERS_KEY);
    localStorage.removeItem(DEMO_CAMPAIGNS_KEY);
    localStorage.removeItem(DEMO_FRAUD_KEY);
    localStorage.removeItem(DEMO_AUDIT_KEY);
    this.productsCache = [...INITIAL_PRODUCTS];
    this.campaignsCache = [...INITIAL_CAMPAIGNS];
    this.ordersCache = [...INITIAL_ORDERS];
    this.fraudAlertsCache = [...INITIAL_FRAUD_ALERTS];
    this.auditLogsCache = [...INITIAL_AUDIT_LOGS];
  }

  // --- Real HTTP Request with timeout ---
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    const cleanBase = this.config.baseUrl.replace(/\/+$/, '');
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    try {
      const res = await fetch(`${cleanBase}${cleanEndpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'X-Client': 'FlashGuard-Frontend-v1',
          ...options.headers,
        },
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      return (await res.json()) as T;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new Error(`Request timeout (${this.config.timeoutMs}ms) to ${cleanBase}`);
      }
      throw err;
    }
  }

  // --- Health Check ---
  public async checkHealth(): Promise<{ ok: boolean; message: string; latencyMs?: number }> {
    if (this.config.isDemoMode) {
      return { ok: true, message: 'Demo Mode active (Mock data simulation)', latencyMs: 12 };
    }

    const start = performance.now();
    try {
      const data = await this.request<{ status: string }>('/api/v1/health');
      const elapsed = Math.round(performance.now() - start);
      return { ok: true, message: `Connected to FastAPI server (${data.status || 'OK'})`, latencyMs: elapsed };
    } catch (err: any) {
      return { ok: false, message: `Cannot connect to ${this.config.baseUrl}: ${err.message}` };
    }
  }

  // --- Products Service ---
  public products = {
    getAll: async (): Promise<Product[]> => {
      if (this.config.isDemoMode) {
        return [...this.productsCache];
      }
      return this.request<Product[]>('/api/v1/products');
    },

    getById: async (id: string): Promise<Product | null> => {
      if (this.config.isDemoMode) {
        return this.productsCache.find((p) => p.id === id) || null;
      }
      return this.request<Product>(`/api/v1/products/${id}`);
    },

    create: async (data: Omit<Product, 'id' | 'saleStatus'>): Promise<Product> => {
      if (this.config.isDemoMode) {
        const newProduct: Product = {
          ...data,
          id: `prod-${Date.now()}`,
          saleStatus: new Date(data.saleStartsAt) > new Date() ? 'upcoming' : 'live',
        };
        this.productsCache.unshift(newProduct);
        this.saveToStorage(DEMO_PRODUCTS_KEY, this.productsCache);
        this.audit.logAction('CREATE_PRODUCT', 'Admin (Demo)', newProduct.name, 'info', `Created product with stock ${newProduct.totalStock}`);
        return newProduct;
      }
      return this.request<Product>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: string, updates: Partial<Product>): Promise<Product> => {
      if (this.config.isDemoMode) {
        const index = this.productsCache.findIndex((p) => p.id === id);
        if (index === -1) throw new Error('Product not found');
        const updated = { ...this.productsCache[index], ...updates };
        this.productsCache[index] = updated;
        this.saveToStorage(DEMO_PRODUCTS_KEY, this.productsCache);
        this.audit.logAction('UPDATE_PRODUCT', 'Admin (Demo)', updated.name, 'info', `Updated product attributes`);
        return updated;
      }
      return this.request<Product>(`/api/v1/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    delete: async (id: string): Promise<boolean> => {
      if (this.config.isDemoMode) {
        this.productsCache = this.productsCache.filter((p) => p.id !== id);
        this.saveToStorage(DEMO_PRODUCTS_KEY, this.productsCache);
        return true;
      }
      await this.request(`/api/v1/products/${id}`, { method: 'DELETE' });
      return true;
    },
  };

  // --- Flash Sale Campaigns Service ---
  public campaigns = {
    getAll: async (): Promise<SaleCampaign[]> => {
      if (this.config.isDemoMode) {
        return [...this.campaignsCache];
      }
      return this.request<SaleCampaign[]>('/api/v1/campaigns');
    },

    create: async (data: Omit<SaleCampaign, 'id'>): Promise<SaleCampaign> => {
      if (this.config.isDemoMode) {
        const newCamp: SaleCampaign = {
          ...data,
          id: `camp-${Date.now()}`,
        };
        this.campaignsCache.unshift(newCamp);
        this.saveToStorage(DEMO_CAMPAIGNS_KEY, this.campaignsCache);
        this.audit.logAction('CREATE_CAMPAIGN', 'Admin (Demo)', newCamp.title, 'info', `Created flash campaign with ${newCamp.productCount} products`);
        return newCamp;
      }
      return this.request<SaleCampaign>('/api/v1/campaigns', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // --- High-Concurrency Reservations & Queue Service ---
  public reservations = {
    create: async (productId: string, quantity: number, userToken?: string): Promise<{
      reservationId: string;
      productId: string;
      quantity: number;
      expiresAt: string;
      queuePosition: number;
      token: string;
    }> => {
      if (this.config.isDemoMode) {
        // Find product and temporarily increment reservedStock
        const prod = this.productsCache.find((p) => p.id === productId);
        if (prod && prod.availableStock >= quantity) {
          prod.reservedStock += quantity;
          prod.availableStock -= quantity;
          this.saveToStorage(DEMO_PRODUCTS_KEY, this.productsCache);
        }

        const reservationId = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes hold
        return {
          reservationId,
          productId,
          quantity,
          expiresAt,
          queuePosition: 1,
          token: `jwt_res_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        };
      }

      return this.request('/api/v1/reservations', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity, userToken }),
      });
    },
  };

  // --- Orders Service ---
  public orders = {
    getAll: async (): Promise<Order[]> => {
      if (this.config.isDemoMode) {
        return [...this.ordersCache];
      }
      return this.request<Order[]>('/api/v1/orders');
    },

    create: async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<Order> => {
      if (this.config.isDemoMode) {
        const orderNumber = `#FG2024${String(this.ordersCache.length + 1).padStart(3, '0')}`;
        const newOrder: Order = {
          ...orderData,
          id: `ord-${Date.now()}`,
          orderNumber,
          createdAt: new Date().toISOString(),
        };
        this.ordersCache.unshift(newOrder);
        this.saveToStorage(DEMO_ORDERS_KEY, this.ordersCache);
        this.audit.logAction('ORDER_PLACED', newOrder.customerName, orderNumber, 'info', `Order placed with amount ₹${newOrder.totalAmount.toLocaleString()}`);
        return newOrder;
      }

      return this.request<Order>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
    },

    updateStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
      if (this.config.isDemoMode) {
        const order = this.ordersCache.find((o) => o.id === orderId);
        if (!order) throw new Error('Order not found');
        order.orderStatus = status;
        if (status === 'Completed') order.reservationStatus = 'Fulfilled';
        if (status === 'Cancelled') order.reservationStatus = 'Released';
        this.saveToStorage(DEMO_ORDERS_KEY, this.ordersCache);
        return order;
      }

      return this.request<Order>(`/api/v1/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
  };

  // --- AI Fraud Detection Service ---
  public fraud = {
    getAlerts: async (): Promise<FraudAlert[]> => {
      if (this.config.isDemoMode) {
        return [...this.fraudAlertsCache];
      }
      return this.request<FraudAlert[]>('/api/v1/fraud/alerts');
    },

    updateStatus: async (alertId: string, status: FraudStatus, reasonNote?: string): Promise<FraudAlert> => {
      if (this.config.isDemoMode) {
        const alert = this.fraudAlertsCache.find((a) => a.id === alertId);
        if (!alert) throw new Error('Alert not found');
        alert.status = status;
        if (reasonNote) {
          alert.details.actionTaken = reasonNote;
        }
        this.saveToStorage(DEMO_FRAUD_KEY, this.fraudAlertsCache);
        this.audit.logAction(
          status === 'Blocked' ? 'QUARANTINE_IP' : 'FRAUD_STATUS_CHANGE',
          'Security Officer',
          alert.ipAddress,
          status === 'Blocked' ? 'alert' : 'info',
          `Changed status to ${status}. Details: ${reasonNote || 'Manual admin review action'}`
        );
        return alert;
      }

      return this.request<FraudAlert>(`/api/v1/fraud/alerts/${alertId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, reasonNote }),
      });
    },
  };

  // --- System Monitoring Metrics Service ---
  public metrics = {
    getMetrics: async (): Promise<SystemMetrics> => {
      if (this.config.isDemoMode) {
        // Return metrics with slight jitter to simulate real-time monitoring
        const jitter = (Math.random() - 0.5) * 30;
        return {
          ...INITIAL_SYSTEM_METRICS,
          requestRatePerMin: Math.round(INITIAL_SYSTEM_METRICS.requestRatePerMin + jitter),
          avgLatencyMs: Math.round(INITIAL_SYSTEM_METRICS.avgLatencyMs + (Math.random() - 0.5) * 6),
          queueDepth: Math.max(0, Math.round(INITIAL_SYSTEM_METRICS.queueDepth + (Math.random() - 0.5) * 20)),
        };
      }
      return this.request<SystemMetrics>('/api/v1/system/metrics');
    },
  };

  // --- Audit Trail ---
  public audit = {
    getLogs: async (): Promise<AuditLog[]> => {
      if (this.config.isDemoMode) {
        return [...this.auditLogsCache];
      }
      return this.request<AuditLog[]>('/api/v1/audit/logs');
    },

    logAction: (action: string, actor: string, target: string, severity: 'info' | 'warning' | 'alert', details: string) => {
      const logEntry: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        action,
        target,
        severity,
        details,
      };
      this.auditLogsCache.unshift(logEntry);
      this.saveToStorage(DEMO_AUDIT_KEY, this.auditLogsCache);
    },
  };
}

export const api = new ApiClient();
