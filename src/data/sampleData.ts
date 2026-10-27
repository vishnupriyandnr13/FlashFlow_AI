import { Product, SaleCampaign, Order, FraudAlert, SystemMetrics, AuditLog } from '../types';

const now = Date.now();
const hour = 3600 * 1000;
const day = 24 * hour;

// Helper to format ISO timestamps relative to now
const relativeTime = (offsetMs: number): string => new Date(now + offsetMs).toISOString();

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-iphone-15',
    sku: 'APL-IP15-128',
    name: 'iPhone 15 (128GB, Blue)',
    brand: 'Apple',
    category: 'Smartphones',
    originalPrice: 79999,
    salePrice: 64999,
    discountPercentage: 19,
    totalStock: 50,
    reservedStock: 8,
    availableStock: 8,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Dynamic Island, 48MP main camera with 2x Telephoto, and USB-C connectivity in a durable color-infused glass and aluminum design.',
    specs: {
      Display: '6.1-inch Super Retina XDR OLED',
      Processor: 'A16 Bionic chip with 5-core GPU',
      Camera: '48MP Main + 12MP Ultra Wide',
      Battery: 'Up to 20 hours video playback',
      Charging: 'USB-C (USB 2), MagSafe wireless',
      Security: 'Face ID, Emergency SOS via satellite'
    },
    features: [
      'Stunning 6.1-inch Super Retina XDR display',
      'Advanced dual-camera system with 48MP resolution',
      'A16 Bionic chip for incredible performance',
      'All-day battery life with USB-C connector',
      'Ceramic Shield front, tougher than any smartphone glass'
    ],
    rating: 4.6,
    reviewsCount: 1234,
    saleStartsAt: relativeTime(-3 * hour),
    saleEndsAt: relativeTime(8 * hour + 14 * 60 * 1000 + 32 * 1000),
    saleStatus: 'live',
    maxPerCustomer: 2,
  },
  {
    id: 'prod-macbook-air-m2',
    sku: 'APL-MBA-M2-256',
    name: 'MacBook Air M2 (13.6-inch, Midnight)',
    brand: 'Apple',
    category: 'Laptops',
    originalPrice: 114999,
    salePrice: 79999,
    discountPercentage: 30,
    totalStock: 30,
    reservedStock: 5,
    availableStock: 12,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Strikingly thin design with the lightning-fast Apple M2 chip. Up to 18 hours of battery life and a liquid retina display.',
    specs: {
      Display: '13.6-inch Liquid Retina display with True Tone',
      Processor: 'Apple M2 chip (8-core CPU, 8-core GPU)',
      Memory: '8GB Unified Memory',
      Storage: '256GB SSD Storage',
      Weight: '1.24 kg ultra-portable body'
    },
    features: [
      'Supercharged by the next-generation M2 chip',
      'Fanless, completely silent design',
      '1080p FaceTime HD camera with 3-mic array',
      'MagSafe 3 charging port with fast-charge support'
    ],
    rating: 4.8,
    reviewsCount: 890,
    saleStartsAt: relativeTime(-2 * hour),
    saleEndsAt: relativeTime(11 * hour + 45 * 1000),
    saleStatus: 'live',
    maxPerCustomer: 1,
  },
  {
    id: 'prod-sony-wh1000xm5',
    sku: 'SNY-WH1000XM5-BLK',
    name: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Headphones',
    originalPrice: 29999,
    salePrice: 14999,
    discountPercentage: 50,
    totalStock: 100,
    reservedStock: 12,
    availableStock: 12,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Industry-leading noise cancellation optimized with two processors and 8 microphones. Crystal clear hands-free calling with Speak-to-Chat.',
    specs: {
      Driver: '30mm precision engineered carbon fiber',
      Battery: '30 hours with ANC enabled',
      Bluetooth: 'Version 5.2 with LDAC and multipoint',
      Weight: '250 grams lightweight comfort fit'
    },
    features: [
      'Industry-leading active noise cancellation',
      'Magnificent sound engineered to perfection',
      'Crystal clear hands-free calls',
      'Multi-device pairing capability'
    ],
    rating: 4.7,
    reviewsCount: 2150,
    saleStartsAt: relativeTime(-5 * hour),
    saleEndsAt: relativeTime(5 * hour + 20 * 60 * 1000),
    saleStatus: 'live',
    maxPerCustomer: 2,
  },
  {
    id: 'prod-apple-watch-s9',
    sku: 'APL-WCH-S9-45',
    name: 'Apple Watch Series 9 GPS 45mm (Midnight)',
    brand: 'Apple',
    category: 'Smart Watches',
    originalPrice: 45999,
    salePrice: 32999,
    discountPercentage: 19,
    totalStock: 40,
    reservedStock: 6,
    availableStock: 8,
    images: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Smarter, brighter, and mightier. Double tap gesture support, brighter Always-On Retina display, and on-device Siri.',
    specs: {
      Display: 'Always-On Retina OLED (up to 2000 nits)',
      Processor: 'S9 SiP with 4-core Neural Engine',
      Sensors: 'ECG, Blood Oxygen, Temperature sensing, Heart Rate',
      WaterResistance: '50m swimproof water resistance'
    },
    features: [
      'Magical new Double Tap gesture',
      'Advanced health insights and ECG tracking',
      'Crash Detection and Fall Detection emergency SOS',
      'Carbon neutral aluminum case combination'
    ],
    rating: 4.5,
    reviewsCount: 640,
    saleStartsAt: relativeTime(-4 * hour),
    saleEndsAt: relativeTime(7 * hour + 12 * 60 * 1000),
    saleStatus: 'live',
    maxPerCustomer: 1,
  },
  {
    id: 'prod-canon-eos-r50',
    sku: 'CAN-EOS-R50-KIT',
    name: 'Canon EOS R50 Mirrorless Camera + 18-45mm Lens',
    brand: 'Canon',
    category: 'Cameras',
    originalPrice: 69999,
    salePrice: 49999,
    discountPercentage: 28,
    totalStock: 50,
    reservedStock: 5,
    availableStock: 15,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Compact and lightweight mirrorless camera with 24.2 MP APS-C sensor, 4K uncropped 30p video, and Dual Pixel CMOS AF II.',
    specs: {
      Sensor: '24.2 Megapixel APS-C CMOS Sensor',
      Video: '4K UHD 30p (oversampled from 6K)',
      Autofocus: 'Dual Pixel CMOS AF II with Subject Detection',
      Connectivity: 'Wi-Fi, Bluetooth, USB Type-C UVC/UAC Webcam'
    },
    features: [
      'High image quality 24.2 MP APS-C sensor',
      'Dual Pixel CMOS AF II with vehicle, people, animal tracking',
      'Continuous shooting up to 15 fps electronic shutter',
      'Vari-angle touchscreen LCD'
    ],
    rating: 4.6,
    reviewsCount: 310,
    saleStartsAt: relativeTime(-1 * hour),
    saleEndsAt: relativeTime(9 * hour + 45 * 60 * 1000),
    saleStatus: 'live',
    maxPerCustomer: 1,
  },
  {
    id: 'prod-samsung-galaxy-s24',
    sku: 'SAM-S24-256-BLK',
    name: 'Samsung Galaxy S24 5G (256GB, Onyx Black)',
    brand: 'Samsung',
    category: 'Smartphones',
    originalPrice: 69999,
    salePrice: 49999,
    discountPercentage: 29,
    totalStock: 60,
    reservedStock: 0,
    availableStock: 60,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Welcome to the era of mobile AI. Circle to Search, Live Translate, and Note Assist in a streamlined satin-finish design.',
    specs: {
      Display: '6.2-inch FHD+ Dynamic AMOLED 2X, 120Hz',
      Processor: 'Exynos 2400 / Snapdragon 8 Gen 3 for Galaxy',
      Camera: '50MP Wide + 10MP Telephoto 3x + 12MP Ultra-wide',
      Battery: '4000 mAh fast charging'
    },
    features: [
      'Galaxy AI powered live translation and circle search',
      'Armor Aluminum frame with IP68 water resistance',
      'Brilliant 2600 nits outdoor peak brightness',
      '7 years of major OS and security upgrades'
    ],
    rating: 4.5,
    reviewsCount: 420,
    saleStartsAt: relativeTime(1 * hour + 32 * 60 * 1000 + 15 * 1000),
    saleEndsAt: relativeTime(25 * hour),
    saleStatus: 'upcoming',
    maxPerCustomer: 2,
  },
  {
    id: 'prod-nike-air-max',
    sku: 'NKE-AMAX-270-WHT',
    name: 'Nike Air Max 270 (Platinum & Light Bone)',
    brand: 'Nike',
    category: 'Footwear',
    originalPrice: 9999,
    salePrice: 5999,
    discountPercentage: 40,
    totalStock: 200,
    reservedStock: 15,
    availableStock: 25,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Boasting Nike\'s biggest heel Air unit yet, delivering a super-soft ride that feels as impossible as it looks.',
    specs: {
      Material: 'Woven synthetic fabric and breathable mesh',
      Midsole: 'Dual-density foam with Max Air 270 unit',
      Outsole: 'Solid rubber outsole with flex grooves',
      Fit: 'Bootie construction hugs your foot'
    },
    features: [
      'Large volume Max Air 270 heel unit for responsive cushioning',
      'Stretchy inner sleeve creates a snug, sock-like fit',
      'Rubber toe tip for durability in high-wear area',
      'Lightweight and airy upper designed for performance'
    ],
    rating: 4.7,
    reviewsCount: 1580,
    saleStartsAt: relativeTime(-6 * hour),
    saleEndsAt: relativeTime(6 * hour),
    saleStatus: 'live',
    maxPerCustomer: 3,
  },
  {
    id: 'prod-lg-4k-smart-tv',
    sku: 'LG-OLED-55C3',
    name: 'LG 55-inch 4K Smart OLED evo C3 TV',
    brand: 'LG',
    category: 'Televisions',
    originalPrice: 59999,
    salePrice: 39999,
    discountPercentage: 33,
    totalStock: 30,
    reservedStock: 30,
    availableStock: 0,
    images: [
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'Self-lit OLED pixels shine brighter with Light Boosting Algorithm and α9 AI Processor Gen6 for intense, vivid picture quality.',
    specs: {
      Display: '55-inch 4K Self-Lit OLED (3840 x 2160)',
      RefreshRate: '120Hz native refresh rate with VRR & G-Sync',
      Audio: '40W 2.2 Channel Dolby Atmos audio',
      OS: 'webOS 23 with ThinQ AI and hands-free voice control'
    },
    features: [
      'Perfect Black and infinite contrast ratio',
      'α9 AI Processor 4K Gen6 for deep learning enhancement',
      'Ultra slim bezel with sleek wall mount flush design',
      'Full 4-port HDMI 2.1 support for next-gen gaming'
    ],
    rating: 4.8,
    reviewsCount: 920,
    saleStartsAt: relativeTime(-24 * hour),
    saleEndsAt: relativeTime(-1 * hour),
    saleStatus: 'ended',
    maxPerCustomer: 1,
  },
  {
    id: 'prod-asus-rog-g16',
    sku: 'ASU-ROG-G16-RTX4070',
    name: 'ASUS ROG Zephyrus G16 OLED Gaming Laptop',
    brand: 'ASUS',
    category: 'Laptops',
    originalPrice: 159999,
    salePrice: 124999,
    discountPercentage: 22,
    totalStock: 25,
    reservedStock: 0,
    availableStock: 25,
    images: [
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80',
    ],
    description: 'CNC aluminum unibody powered by Intel Core Ultra 9 and NVIDIA GeForce RTX 4070 with 2.5K 240Hz OLED ROG Nebula display.',
    specs: {
      Display: '16-inch 2.5K (2560x1600) 240Hz 0.2ms OLED',
      Processor: 'Intel Core Ultra 9 185H with dedicated NPU',
      Graphics: 'NVIDIA GeForce RTX 4070 8GB GDDR6',
      Memory: '32GB LPDDR5X 7467MHz'
    },
    features: [
      'Stunning 240Hz OLED ROG Nebula Display',
      'Slash Lighting customizable rear lid array',
      'Tri-Fan thermal technology with liquid metal cooling',
      'Slim 1.49 cm CNC machined premium chassis'
    ],
    rating: 4.9,
    reviewsCount: 110,
    saleStartsAt: relativeTime(4 * hour),
    saleEndsAt: relativeTime(28 * hour),
    saleStatus: 'upcoming',
    maxPerCustomer: 1,
  }
];

export const INITIAL_CAMPAIGNS: SaleCampaign[] = [
  {
    id: 'camp-black-friday',
    title: 'Mega Flash Sale 2026',
    description: 'Top tech brands and footwear at unbeatable flash discounts.',
    bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    discountBadge: 'Up to 70% OFF',
    startsAt: relativeTime(-4 * hour),
    endsAt: relativeTime(8 * hour + 14 * 60 * 1000 + 32 * 1000),
    status: 'Live',
    productCount: 12,
    productIds: ['prod-iphone-15', 'prod-macbook-air-m2', 'prod-sony-wh1000xm5', 'prod-apple-watch-s9', 'prod-canon-eos-r50', 'prod-nike-air-max'],
    totalStockAllocated: 500,
    totalSold: 384,
  },
  {
    id: 'camp-midnight-gadgets',
    title: 'Midnight Flagship Drops',
    description: 'Next-gen flagship smartphones and AI gear releasing tonight.',
    bannerImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    discountBadge: 'Up to 35% OFF',
    startsAt: relativeTime(1 * hour + 32 * 60 * 1000),
    endsAt: relativeTime(25 * hour),
    status: 'Upcoming',
    productCount: 8,
    productIds: ['prod-samsung-galaxy-s24', 'prod-asus-rog-g16'],
    totalStockAllocated: 250,
    totalSold: 0,
  },
  {
    id: 'camp-audio-fiesta',
    title: 'High-Fidelity Audio Blitz',
    description: 'Audiophile grade noise cancellation and wireless audio gear.',
    bannerImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    discountBadge: 'Flat 50% OFF',
    startsAt: relativeTime(24 * hour),
    endsAt: relativeTime(48 * hour),
    status: 'Scheduled',
    productCount: 15,
    productIds: ['prod-sony-wh1000xm5'],
    totalStockAllocated: 400,
    totalSold: 0,
  },
  {
    id: 'camp-clearance',
    title: 'OLED Home Cinema Clearance',
    description: 'Final clearance units of ultra high definition OLED panels.',
    bannerImage: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=1200&q=80',
    discountBadge: 'Up to 33% OFF',
    startsAt: relativeTime(-48 * hour),
    endsAt: relativeTime(-1 * hour),
    status: 'Ended',
    productCount: 10,
    productIds: ['prod-lg-4k-smart-tv'],
    totalStockAllocated: 150,
    totalSold: 150,
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: '#FG2024001',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        productId: 'prod-iphone-15',
        productName: 'iPhone 15 (128GB, Blue)',
        productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
        originalPrice: 79999,
        salePrice: 64999,
        quantity: 1,
      }
    ],
    subtotal: 64999,
    shipping: 0,
    totalAmount: 64999,
    reservationStatus: 'Held',
    paymentStatus: 'Paid',
    orderStatus: 'Processing',
    createdAt: relativeTime(-15 * 60 * 1000),
    deliveryAddress: {
      street: '42 Silicon Avenue, Tech Park',
      city: 'Bengaluru',
      state: 'Karnataka',
      zipCode: '560100',
      country: 'India'
    }
  },
  {
    id: 'ord-1002',
    orderNumber: '#FG2024002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.s@example.com',
    customerPhone: '+91 98111 22334',
    items: [
      {
        productId: 'prod-nike-air-max',
        productName: 'Nike Air Max 270',
        productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80',
        originalPrice: 9999,
        salePrice: 5999,
        quantity: 1,
      }
    ],
    subtotal: 5999,
    shipping: 0,
    totalAmount: 5999,
    reservationStatus: 'Fulfilled',
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: relativeTime(-45 * 60 * 1000),
    deliveryAddress: {
      street: '15 Lotus Boulevard',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400050',
      country: 'India'
    }
  },
  {
    id: 'ord-1003',
    orderNumber: '#FG2024003',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.v@example.com',
    customerPhone: '+91 98450 99887',
    items: [
      {
        productId: 'prod-apple-watch-s9',
        productName: 'Apple Watch Series 9 GPS 45mm',
        productImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80',
        originalPrice: 45999,
        salePrice: 32999,
        quantity: 1,
      }
    ],
    subtotal: 32999,
    shipping: 0,
    totalAmount: 32999,
    reservationStatus: 'Expired',
    paymentStatus: 'Failed',
    orderStatus: 'Cancelled',
    createdAt: relativeTime(-2 * hour),
    deliveryAddress: {
      street: '78 Sector 18',
      city: 'Noida',
      state: 'Uttar Pradesh',
      zipCode: '201301',
      country: 'India'
    }
  },
  {
    id: 'ord-1004',
    orderNumber: '#FG2024004',
    customerName: 'Ananya Iyer',
    customerEmail: 'ananya.iyer@example.com',
    customerPhone: '+91 97654 32190',
    items: [
      {
        productId: 'prod-sony-wh1000xm5',
        productName: 'Sony WH-1000XM5 Wireless Headphones',
        productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80',
        originalPrice: 29999,
        salePrice: 14999,
        quantity: 1,
      }
    ],
    subtotal: 14999,
    shipping: 0,
    totalAmount: 14999,
    reservationStatus: 'Fulfilled',
    paymentStatus: 'Paid',
    orderStatus: 'Completed',
    createdAt: relativeTime(-3 * hour),
    deliveryAddress: {
      street: '88 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      zipCode: '500033',
      country: 'India'
    }
  }
];

export const INITIAL_FRAUD_ALERTS: FraudAlert[] = [
  {
    id: 'fa-01',
    timestamp: relativeTime(-4 * 60 * 1000),
    user: 'user123',
    ipAddress: '192.168.1.10',
    riskScore: 0.92,
    severity: 'Critical',
    reason: 'High request frequency (140 req/sec)',
    status: 'Pending',
    details: {
      deviceFingerprint: 'fp_9a2f7d81a9 (Headless Chrome on Linux)',
      requestVelocity: '142 requests in 1.2 seconds across 3 endpoints',
      geoMismatch: true,
      multiAccountConfidence: 0.94,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (HeadlessChrome/118.0.0.0)',
      actionTaken: 'Flagged for immediate admin inspection'
    }
  },
  {
    id: 'fa-02',
    timestamp: relativeTime(-8 * 60 * 1000),
    user: 'bot_user',
    ipAddress: '10.0.0.5',
    riskScore: 0.89,
    severity: 'High',
    reason: 'Multiple accounts linked to identical token and card fingerprint',
    status: 'Blocked',
    details: {
      deviceFingerprint: 'fp_bot_cluster_88x (Automated Python Requests)',
      requestVelocity: 'Simultaneous purchase payload on 4 accounts',
      geoMismatch: false,
      multiAccountConfidence: 0.98,
      userAgent: 'python-requests/2.31.0',
      actionTaken: 'IP and session tokens automatically quarantined by Redis rate-limiter'
    }
  },
  {
    id: 'fa-03',
    timestamp: relativeTime(-15 * 60 * 1000),
    user: 'user456',
    ipAddress: '203.0.113.25',
    riskScore: 0.76,
    severity: 'Medium',
    reason: 'Unusual purchase velocity & synthetic keystroke telemetry',
    status: 'Review',
    details: {
      deviceFingerprint: 'fp_win_edge_3920',
      requestVelocity: '0 ms human interval between product load and checkout click',
      geoMismatch: true,
      multiAccountConfidence: 0.71,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      actionTaken: 'Triggered secondary CAPTCHA / SMS token verification'
    }
  },
  {
    id: 'fa-04',
    timestamp: relativeTime(-25 * 60 * 1000),
    user: 'user789',
    ipAddress: '198.51.100.10',
    riskScore: 0.65,
    severity: 'Low',
    reason: 'Suspicious device fingerprint variation across active sessions',
    status: 'Allowed',
    details: {
      deviceFingerprint: 'fp_mobile_safari_ios17',
      requestVelocity: 'Standard human clicking with mobile cellular IP hop',
      geoMismatch: false,
      multiAccountConfidence: 0.12,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15',
      actionTaken: 'Verified genuine human session after 2FA challenge'
    }
  },
  {
    id: 'fa-05',
    timestamp: relativeTime(-52 * 60 * 1000),
    user: 'sniper_runner',
    ipAddress: '45.33.32.156',
    riskScore: 0.95,
    severity: 'Critical',
    reason: 'Flash Sale sniping script targeting stock locking endpoint',
    status: 'Blocked',
    details: {
      deviceFingerprint: 'fp_puppeteer_v2',
      requestVelocity: 'Burst of 220 reservation attempts in 300ms',
      geoMismatch: true,
      multiAccountConfidence: 0.99,
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120.0.0.0 Puppeteer',
      actionTaken: 'Connection dropped, circuit breaker activated on IP block'
    }
  }
];

export const INITIAL_SYSTEM_METRICS: SystemMetrics = {
  requestRatePerMin: 1250,
  avgLatencyMs: 120,
  errorRatePercent: 0.8,
  queueDepth: 350,
  activeWorkers: 24,
  totalWorkers: 24,
  redisCacheHitPercent: 96.4,
  concurrencyPeakReqSec: 3200,
  timeSeries: [
    { time: '10:00', requestRate: 340, latency: 45, errorRate: 0.1, queueDepth: 20 },
    { time: '10:05', requestRate: 580, latency: 62, errorRate: 0.2, queueDepth: 45 },
    { time: '10:10', requestRate: 890, latency: 85, errorRate: 0.4, queueDepth: 110 },
    { time: '10:15', requestRate: 1450, latency: 140, errorRate: 0.9, queueDepth: 280 },
    { time: '10:20', requestRate: 1820, latency: 185, errorRate: 1.2, queueDepth: 420 },
    { time: '10:25', requestRate: 1250, latency: 120, errorRate: 0.8, queueDepth: 350 },
    { time: '10:30', requestRate: 980, latency: 95, errorRate: 0.5, queueDepth: 190 },
  ]
};

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: relativeTime(-3 * 60 * 1000),
    actor: 'AI Fraud Engine',
    action: 'QUARANTINE_IP',
    target: '192.168.1.10',
    severity: 'alert',
    details: 'Quarantined IP due to bot velocity anomaly (risk score 0.92).'
  },
  {
    id: 'log-02',
    timestamp: relativeTime(-12 * 60 * 1000),
    actor: 'Admin (System)',
    action: 'FLASH_STOCK_SYNC',
    target: 'iPhone 15 (APL-IP15-128)',
    severity: 'info',
    details: 'Atomic stock lock committed: 8 units held in Redis reservation ring buffer.'
  },
  {
    id: 'log-03',
    timestamp: relativeTime(-25 * 60 * 1000),
    actor: 'Admin (vishnu.admin)',
    action: 'UPDATE_CAMPAIGN',
    target: 'Mega Flash Sale 2026',
    severity: 'info',
    details: 'Extended flash campaign end time by 2 hours.'
  },
  {
    id: 'log-04',
    timestamp: relativeTime(-42 * 60 * 1000),
    actor: 'Rate Limiter',
    action: 'TOKEN_BUCKET_EXHAUSTED',
    target: '45.33.32.156',
    severity: 'warning',
    details: '429 Too Many Requests sent to client attempting burst attack.'
  },
  {
    id: 'log-05',
    timestamp: relativeTime(-90 * 60 * 1000),
    actor: 'System Boot',
    action: 'CLUSTER_INIT',
    target: 'FastAPI Bridge',
    severity: 'info',
    details: 'Connected frontend service worker to mock orchestration engine.'
  }
];
