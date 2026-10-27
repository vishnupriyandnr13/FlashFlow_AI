export type SaleStatus = 'upcoming' | 'live' | 'ended';

export type OrderStatus = 'Processing' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';
export type ReservationStatus = 'Held' | 'Released' | 'Fulfilled' | 'Expired';

export type FraudSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type FraudStatus = 'Pending' | 'Blocked' | 'Review' | 'Allowed';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
  images: string[];
  description: string;
  specs: Record<string, string>;
  features: string[];
  rating: number;
  reviewsCount: number;
  saleStartsAt: string; // ISO string
  saleEndsAt: string;   // ISO string
  saleStatus: SaleStatus;
  maxPerCustomer: number;
  sku: string;
}

export interface SaleCampaign {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  discountBadge: string;
  startsAt: string;
  endsAt: string;
  status: 'Live' | 'Upcoming' | 'Scheduled' | 'Ended';
  productCount: number;
  productIds: string[];
  totalStockAllocated: number;
  totalSold: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  totalAmount: number;
  reservationStatus: ReservationStatus;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface FraudAlert {
  id: string;
  timestamp: string;
  user: string;
  ipAddress: string;
  riskScore: number; // 0.00 to 1.00
  severity: FraudSeverity;
  reason: string;
  status: FraudStatus;
  details: {
    deviceFingerprint: string;
    requestVelocity: string;
    geoMismatch: boolean;
    multiAccountConfidence: number;
    userAgent: string;
    actionTaken?: string;
  };
}

export interface SystemMetrics {
  requestRatePerMin: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  queueDepth: number;
  activeWorkers: number;
  totalWorkers: number;
  redisCacheHitPercent: number;
  concurrencyPeakReqSec: number;
  timeSeries: {
    time: string;
    requestRate: number;
    latency: number;
    errorRate: number;
    queueDepth: number;
  }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  severity: 'info' | 'warning' | 'alert';
  details: string;
}

export interface ApiConfig {
  baseUrl: string;
  isDemoMode: boolean;
  timeoutMs: number;
}

export interface ApiErrorPayload {
  message: string;
  statusCode?: number;
  endpoint?: string;
  timestamp?: string;
  isNetworkError?: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiErrorPayload | null;
  isDemo: boolean;
}

export type ProductListResponse = Product[];
export type CampaignListResponse = SaleCampaign[];
export type OrderDetailResponse = Order;
export type FlashSaleDetailResponse = SaleCampaign;

