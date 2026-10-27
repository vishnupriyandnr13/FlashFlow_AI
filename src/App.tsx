import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  SaleCampaign,
  Order,
  FraudAlert,
  SystemMetrics,
  AuditLog,
} from './types';
import { api } from './api/client';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ApiConfigModal } from './components/common/ApiConfigModal';
import { AuthModal } from './components/customer/AuthModal';
import { QueueReservationModal } from './components/customer/QueueReservationModal';
import { HomePage } from './components/customer/HomePage';
import { FlashSalesPage } from './components/customer/FlashSalesPage';
import { UpcomingSalesPage } from './components/customer/UpcomingSalesPage';
import { ProductDetailPage } from './components/customer/ProductDetailPage';
import { CartPage, CartItem } from './components/customer/CartPage';
import { OrdersPage } from './components/customer/OrdersPage';

// Admin components
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './components/admin/AdminOverviewPage';
import { AdminProductsPage } from './components/admin/AdminProductsPage';
import { AdminFlashSalesPage } from './components/admin/AdminFlashSalesPage';
import { AdminOrdersPage } from './components/admin/AdminOrdersPage';
import { AdminFraudPage } from './components/admin/AdminFraudPage';
import { AdminMonitoringPage } from './components/admin/AdminMonitoringPage';
import { AdminAuditLogsPage } from './components/admin/AdminAuditLogsPage';

export default function App() {
  // Navigation mode: Customer Storefront vs Admin Operations Console
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [customerTab, setCustomerTab] = useState<
    'home' | 'flash-sales' | 'upcoming' | 'categories' | 'product-detail' | 'cart' | 'orders'
  >('home');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Datasets from API Client
  const [products, setProducts] = useState<Product[]>([]);
  const [campaigns, setCampaigns] = useState<SaleCampaign[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cart & Reservation State
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('flashguard_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected product for detail view
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Active user session
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    role: 'customer' | 'admin';
  } | null>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'customer',
  });

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [queueModalProduct, setQueueModalProduct] = useState<{
    product: Product;
    quantity: number;
  } | null>(null);

  const [isDemoMode, setIsDemoMode] = useState(api.getConfig().isDemoMode);

  // Save cart
  useEffect(() => {
    try {
      localStorage.setItem('flashguard_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems]);

  // Load datasets
  const loadAllData = useCallback(async () => {
    try {
      const [prods, camps, ords, alerts, logs, metrics] = await Promise.all([
        api.products.getAll(),
        api.campaigns.getAll(),
        api.orders.getAll(),
        api.fraud.getAlerts(),
        api.audit.getLogs(),
        api.metrics.getMetrics(),
      ]);
      setProducts(prods);
      setCampaigns(camps);
      setOrders(ords);
      setFraudAlerts(alerts);
      setAuditLogs(logs);
      setSystemMetrics(metrics);
      setIsDemoMode(api.getConfig().isDemoMode);
    } catch (e) {
      console.error('Error fetching data from API Client', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Cart Actions
  const handleAddToCart = (product: Product, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.maxPerCustomer, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Trigger high-concurrency queue reservation modal on "Buy Now"
  const handleInitiateBuyNow = (product: Product, quantity = 1) => {
    setQueueModalProduct({ product, quantity });
  };

  // Called when QueueReservationModal finishes locking stock
  const handleReservationSuccess = (resData: {
    reservationId: string;
    product: Product;
    quantity: number;
    expiresAt: string;
  }) => {
    setQueueModalProduct(null);
    // Add reserved item to cart with reservation token
    setCartItems([
      {
        product: resData.product,
        quantity: resData.quantity,
        reservationId: resData.reservationId,
        reservationExpiresAt: resData.expiresAt,
      },
    ]);
    setCustomerTab('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setCartItems([]);
    setOrders((prev) => [newOrder, ...prev]);
    setCustomerTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadAllData();
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCustomerTab('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white mb-4">
          <span className="font-bold text-xl">⚡</span>
        </div>
        <div className="text-sm font-bold text-slate-800">Initializing FlashGuard Platform</div>
        <div className="text-xs text-slate-400 mt-1">Connecting client service modules...</div>
      </div>
    );
  }

  // --- ADMIN VIEW ---
  if (viewMode === 'admin') {
    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(tab) => {
          setAdminTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSwitchToCustomer={() => {
          setViewMode('customer');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenApiConfig={() => setIsApiModalOpen(true)}
        isDemoMode={isDemoMode}
      >
        {adminTab === 'overview' && (
          <AdminOverviewPage
            products={products}
            orders={orders}
            campaigns={campaigns}
            fraudAlerts={fraudAlerts}
            onNavigateTab={(tab) => setAdminTab(tab)}
          />
        )}
        {adminTab === 'products' && (
          <AdminProductsPage products={products} onRefresh={loadAllData} />
        )}
        {adminTab === 'flash-sales' && (
          <AdminFlashSalesPage
            campaigns={campaigns}
            products={products}
            onRefresh={loadAllData}
          />
        )}
        {adminTab === 'orders' && (
          <AdminOrdersPage orders={orders} onRefresh={loadAllData} />
        )}
        {adminTab === 'fraud' && (
          <AdminFraudPage alerts={fraudAlerts} onRefresh={loadAllData} />
        )}
        {adminTab === 'monitoring' && systemMetrics && (
          <AdminMonitoringPage initialMetrics={systemMetrics} />
        )}
        {adminTab === 'audit-logs' && <AdminAuditLogsPage logs={auditLogs} />}

        {/* Global API Config Modal */}
        <ApiConfigModal
          isOpen={isApiModalOpen}
          onClose={() => setIsApiModalOpen(false)}
          onConfigChanged={loadAllData}
        />
      </AdminLayout>
    );
  }

  // --- CUSTOMER STOREFRONT VIEW ---
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Customer Navigation Bar */}
      <Navbar
        currentTab={customerTab}
        onNavigate={(tab) => {
          setCustomerTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartItems.reduce((acc, it) => acc + it.quantity, 0)}
        onOpenCart={() => {
          setCustomerTab('cart');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSwitchToAdmin={() => {
          setViewMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenApiConfig={() => setIsApiModalOpen(true)}
        isDemoMode={isDemoMode}
        user={currentUser}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {customerTab === 'home' && (
          <HomePage
            products={products}
            campaigns={campaigns}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleInitiateBuyNow}
            onNavigateToTab={(tab) => {
              setCustomerTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {customerTab === 'flash-sales' && (
          <FlashSalesPage
            products={products}
            onSelectProduct={handleSelectProduct}
            onBuyNow={handleInitiateBuyNow}
            onNavigateHome={() => setCustomerTab('home')}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {customerTab === 'upcoming' && (
          <UpcomingSalesPage
            products={products}
            campaigns={campaigns}
            onSelectProduct={handleSelectProduct}
            onNavigateHome={() => setCustomerTab('home')}
            searchQuery={searchQuery}
          />
        )}

        {customerTab === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            onBack={() => setCustomerTab('home')}
            onBuyNow={(prod, qty) => handleInitiateBuyNow(prod, qty)}
            onAddToCart={handleAddToCart}
          />
        )}

        {customerTab === 'cart' && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveFromCart}
            onOrderSuccess={handleOrderSuccess}
            onNavigateHome={() => setCustomerTab('home')}
          />
        )}

        {customerTab === 'orders' && (
          <OrdersPage orders={orders} onNavigateHome={() => setCustomerTab('home')} />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(u) => setCurrentUser(u)}
        onLogout={() => setCurrentUser(null)}
        onSwitchToAdmin={() => {
          setViewMode('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <ApiConfigModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onConfigChanged={loadAllData}
      />

      <QueueReservationModal
        isOpen={!!queueModalProduct}
        onClose={() => setQueueModalProduct(null)}
        product={queueModalProduct?.product || null}
        quantity={queueModalProduct?.quantity || 1}
        onProceedToCheckout={handleReservationSuccess}
      />
    </div>
  );
}
