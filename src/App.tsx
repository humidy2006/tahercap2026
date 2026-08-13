import React, { useState, useEffect } from 'react';
import { Product, CartItem, CustomTupiDesign, Language, Currency, Order, User } from './types';
import { INITIAL_PRODUCTS } from './data/products';
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
import { Footer } from './components/Footer';
import { ShieldAlert, X, ShieldCheck } from 'lucide-react';

export default function App() {
  // Global App Settings
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('BDT');
  const [activeTab, setActiveTab] = useState<string>('shop');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Products Database State with LocalStorage Persistence & Server Sync
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('altaher_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved products:', e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  // Fetch products from server on initial load
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem('altaher_products', JSON.stringify(data.products));
        }
      })
      .catch(e => console.log('Using cached local products:', e));
  }, []);

  // Sync products across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'altaher_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProducts(parsed);
          }
        } catch (err) {
          console.error('Failed to parse updated products from storage event:', err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save products to LocalStorage & Express backend server
  const saveAndSyncProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('altaher_products', JSON.stringify(newProducts));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newProducts })
    }).catch(e => console.error('Failed to sync products with backend:', e));
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
    selectedColor: { name: string; hex: string },
    quantity: number = 1
  ) => {
    const cartItemId = `${product.id}-${selectedSize}-${selectedColor.name}`;
    
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
          selectedColor,
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
      title: `Custom ${design.baseStyle} (${design.fabric})`,
      titleBn: `কাস্টম ${design.baseStyle} (${design.fabric})`,
      category: 'Custom Studio',
      categoryBn: 'কাস্টম স্টুডিও',
      price: design.unitPrice,
      fabric: design.fabric,
      fabricBn: design.fabric,
      crownHeight: design.crownHeight.includes('3.8') ? 'Tall/Hard (3.8")' : 'Medium (3.2")',
      crownHeightBn: design.crownHeight,
      sizes: [design.size],
      availableColors: [design.baseColor],
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      isCustomizable: true,
      image: INITIAL_PRODUCTS[0].image,
      description: `Tailored Custom Cap: ${design.embroideryPattern}, Color: ${design.baseColor.name}, Custom Text: "${design.customText || 'None'}"`,
      descriptionBn: `কাস্টম সেলাই: ${design.embroideryPattern}, রং: ${design.baseColor.name}, লেখা: "${design.customText || 'নেই'}"`,
      stock: 999,
      tags: ['Custom Design']
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

  // Admin Actions
  const handleAddProduct = (newProduct: Product) => {
    const updated = [newProduct, ...products];
    saveAndSyncProducts(updated);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    const updated = products.map(p => (p.id === updatedProduct.id ? updatedProduct : p));
    saveAndSyncProducts(updated);

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
  };

  const handleDeleteProduct = (productId: string) => {
    const updated = products.filter(p => p.id !== productId);
    saveAndSyncProducts(updated);

    if (quickViewProduct && quickViewProduct.id === productId) {
      setQuickViewProduct(null);
    }

    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleResetProducts = () => {
    saveAndSyncProducts(INITIAL_PRODUCTS);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      
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
