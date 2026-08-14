import React, { useState, useEffect } from 'react';
import { Product, CartItem, CustomTupiDesign, Language, Currency, Order, User } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import { db, doc, onSnapshot, setDoc, getDoc } from './lib/firebase';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CustomTupiDesigner } from './components/CustomTupiDesigner';
import { WholesalePortal } from './components/WholesalePortal';
import { CompanyShowcase } from './components/CompanyShowcase';
import { SizeGuideModal } from './components/SizeGuideModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InvoiceModal } from './components/InvoiceModal';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { ShieldAlert, X, ShieldCheck } from 'lucide-react';

export default function App() {
  // Global App Settings
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('BDT');
  const [activeTab, setActiveTab] = useState<string>('shop');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Products Database State with Cloud Firestore & Server Sync
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);

  // 1. Primary Live Sync: Cloud Firestore Real-Time Listener (Instant all-device & all-user sync)
  useEffect(() => {
    const catalogDocRef = doc(db, 'catalog', 'main_products');

    // Subscribe to real-time changes from Firestore
    const unsubscribe = onSnapshot(
      catalogDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.items)) {
            setProducts(data.items);
            localStorage.setItem('altaher_products', JSON.stringify(data.items));
            setIsCloudSynced(true);
          }
        } else {
          // If Firestore is empty initially, seed it with INITIAL_PRODUCTS
          setDoc(catalogDocRef, {
            items: INITIAL_PRODUCTS,
            updatedAt: Date.now(),
            seeded: true
          }).catch(err => console.error('Error seeding Firestore catalog:', err));
        }
      },
      (error) => {
        console.error('Firestore listener error, falling back to REST/SSE:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Function to fetch latest products from server with cache-busting (fallback if offline)
  const fetchLatestProducts = async () => {
    if (isCloudSynced) return;
    try {
      const res = await fetch(`/api/products?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.products)) {
              localStorage.setItem('altaher_products', JSON.stringify(data.products));
              return data.products;
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.log('Product sync check:', e);
    }
  };

  // 2. Initial Load & Multi-tab fallback
  useEffect(() => {
    const saved = localStorage.getItem('altaher_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      } catch (e) {
        console.error('Failed to parse local cached products:', e);
      }
    }
    fetchLatestProducts();
  }, []);

  // 3. Real-Time Server-Sent Events (SSE) as secondary fast push
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/products/stream');

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && Array.isArray(data.products) && data.products.length > 0) {
              setProducts(prev => {
                if (JSON.stringify(prev) !== JSON.stringify(data.products)) {
                  localStorage.setItem('altaher_products', JSON.stringify(data.products));
                  return data.products;
                }
                return prev;
              });
            }
          } catch (err) {
            console.error('Error parsing SSE event data:', err);
          }
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch (err) {
        console.log('SSE connection setup:', err);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Sanitize and ensure product gallery integrity
  const sanitizeProducts = (list: Product[]): Product[] => {
    return list.map(item => {
      const rawGallery = Array.isArray(item.images) && item.images.length > 0
        ? item.images
        : (item.image ? [item.image] : []);
      
      const cleanGallery: string[] = [];
      rawGallery.forEach(img => {
        if (img && typeof img === 'string' && !cleanGallery.includes(img)) {
          cleanGallery.push(img);
        }
      });

      const primary = cleanGallery[0] || item.image || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80';
      if (!cleanGallery.includes(primary)) {
        cleanGallery.unshift(primary);
      }

      return {
        ...item,
        image: primary,
        images: cleanGallery
      };
    });
  };

  // 4. Save products to Cloud Firestore, LocalStorage & Server (Syncs universally across all environments)
  const saveAndSyncProducts = async (rawProducts: Product[]) => {
    const newProducts = sanitizeProducts(rawProducts);
    setProducts(newProducts);
    try {
      localStorage.setItem('altaher_products', JSON.stringify(newProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }

    // 1) Write to Cloud Firestore (Instant propagation to all users on any link/device)
    try {
      const catalogDocRef = doc(db, 'catalog', 'main_products');
      await setDoc(catalogDocRef, {
        items: newProducts,
        updatedAt: Date.now(),
        updatedBy: currentUser?.email || 'admin@altahercap.com'
      });
      setIsCloudSynced(true);
    } catch (err) {
      console.error('Failed to update Firestore database:', err);
    }

    // 2) Write to Express API backend
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: newProducts })
      });
    } catch (e) {
      console.error('Failed to sync products with backend server:', e);
    }
  };

  // User Authentication State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('altaher_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse auth user:', e);
      }
    }
    return null;
  });

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'signup' | 'admin'>('login');
  const [adminDeniedAlert, setAdminDeniedAlert] = useState<boolean>(false);

  const handleLoginUser = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('altaher_auth_user', JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth user:', e);
    }
  };

  const handleLogoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('altaher_auth_user');
  };

  const handleOpenAdminClick = () => {
    const ADMIN_EMAIL = 'abdullahhumidy@gmail.com';
    if (!currentUser) {
      setAuthModalInitialMode('admin');
      setAuthModalOpen(true);
      return;
    }

    if (currentUser.emailOrPhone.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setAdminOpen(true);
    } else {
      setAdminDeniedAlert(true);
    }
  };

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals Visibility States
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState<boolean>(false);
  const [adminOpen, setAdminOpen] = useState<boolean>(false);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Add standard product to cart
  const handleAddToCart = (
    product: Product,
    selectedSize: string,
    quantity: number = 1
  ) => {
    const cartItemId = `${product.id}-${selectedSize}`;
    
    setCartItems(prev => {
      const existing = prev.find(item => item.id === cartItemId);
      if (existing) {
        return prev.map(item =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          selectedSize,
          quantity
        }
      ];
    });
  };

  // Add custom tailored tupi design to cart
  const handleAddCustomToCart = (design: CustomTupiDesign) => {
    const customProductId = 'custom-tupi-' + Date.now();
    const customProduct: Product = {
      id: customProductId,
      category: 'Custom Studio',
      categoryBn: 'কাস্টম স্টুডিও',
      designNumber: `CUST-${Date.now().toString().slice(-4)}`,
      price: design.unitPrice,
      quantity: `${design.quantity} Pc`,
      sizes: [design.size],
      image: INITIAL_PRODUCTS[0].image,
      isFeatured: true
    };

    const cartItemId = `custom-${Date.now()}`;
    const newCartItem: CartItem = {
      id: cartItemId,
      product: customProduct,
      selectedColor: design.baseColor,
      selectedSize: design.size,
      quantity: design.quantity,
      isCustomItem: true,
      customDetails: design
    };

    setCartItems(prev => [...prev, newCartItem]);
    setCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== cartItemId));
  };

  // Admin Actions with Instant Server Sync & Real-Time Cloud Broadcast
  const handleAddProduct = async (newProduct: Product) => {
    const updated = [newProduct, ...products];
    await saveAndSyncProducts(updated);
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));

    // Update quick view modal if actively open
    if (quickViewProduct && quickViewProduct.id === updatedProduct.id) {
      setQuickViewProduct(updatedProduct);
    }

    // Update cart item product details if present in cart
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );

    await saveAndSyncProducts(updated);
  };

  const handleDeleteProduct = async (productId: string) => {
    const updated = products.filter(p => p.id !== productId);

    if (quickViewProduct && quickViewProduct.id === productId) {
      setQuickViewProduct(null);
    }

    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    await saveAndSyncProducts(updated);
  };

  const handleResetProducts = async () => {
    await saveAndSyncProducts(INITIAL_PRODUCTS);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 pb-16 md:pb-0">
      
      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        currency={currency}
        setCurrency={setCurrency}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
        onOpenAdmin={handleOpenAdminClick}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthModalInitialMode('login');
          setAuthModalOpen(true);
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Page Views */}
      <main className="flex-1">
        {activeTab === 'shop' && (
          <>
            <HeroSection
              language={language}
              onShopClick={() => {
                const el = document.getElementById('catalog-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onCustomizerClick={() => setActiveTab('customizer')}
              onWholesaleClick={() => setActiveTab('wholesale')}
            />
            <div id="catalog-section">
              <ProductCatalog
                products={products}
                language={language}
                currency={currency}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onQuickView={(p) => setQuickViewProduct(p)}
                onAddToCart={handleAddToCart}
                onCustomize={(p) => {
                  setQuickViewProduct(null);
                  setActiveTab('customizer');
                }}
              />
            </div>
          </>
        )}

        {activeTab === 'customizer' && (
          <CustomTupiDesigner
            language={language}
            currency={currency}
            onAddCustomToCart={handleAddCustomToCart}
            onOpenSizeGuide={() => setSizeGuideOpen(true)}
          />
        )}

        {activeTab === 'wholesale' && (
          <WholesalePortal
            language={language}
            currency={currency}
          />
        )}

        {activeTab === 'company' && (
          <CompanyShowcase
            language={language}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        language={language}
        setActiveTab={setActiveTab}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav
        language={language}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        language={language}
        currency={currency}
        onAddToCart={handleAddToCart}
        onCustomize={() => {
          setQuickViewProduct(null);
          setActiveTab('customizer');
        }}
        onOpenSizeGuide={() => setSizeGuideOpen(true)}
      />

      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        language={language}
      />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        language={language}
        currency={currency}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems}
        language={language}
        currency={currency}
        currentUser={currentUser}
        onOrderCompleted={(order) => {
          setCheckoutOpen(false);
          setCartItems([]);
          setCompletedOrder(order);
        }}
      />

      <InvoiceModal
        order={completedOrder}
        isOpen={!!completedOrder}
        onClose={() => setCompletedOrder(null)}
        language={language}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLoginUser}
        onLogout={handleLogoutUser}
        language={language}
        initialMode={authModalInitialMode}
      />

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={handleResetProducts}
        language={language}
        currency={currency}
        isCloudSynced={isCloudSynced}
      />

      {/* Admin Access Denied Alert Modal */}
      {adminDeniedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold font-serif text-slate-950 text-base">
                {language === 'bn' ? 'অ্যাডমিন অ্যাক্সেস সংরক্ষিত!' : 'Admin Access Restricted!'}
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {language === 'bn'
                  ? `শুধুমাত্র 'abdullahhumidy@gmail.com' অ্যাকাউন্টে লগইন করে টুপির ক্যাটালগ ও দাম পরিবর্তন করা সম্ভব।`
                  : `Only the official account 'abdullahhumidy@gmail.com' is authorized to access the Admin Panel & change cap prices.`}
              </p>
              <p className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                Logged in as: {currentUser?.emailOrPhone}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdminDeniedAlert(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
              <button
                onClick={() => {
                  setAdminDeniedAlert(false);
                  setAuthModalInitialMode('admin');
                  setAuthModalOpen(true);
                }}
                className="flex-1 py-2.5 bg-slate-950 hover:bg-black text-amber-300 text-xs font-bold rounded-xl shadow-sm"
              >
                {language === 'bn' ? 'এডমিন লগইন' : 'Switch to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
