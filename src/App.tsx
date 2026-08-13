import React, { useState, useEffect } from 'react';
import { Product, CartItem, CustomTupiDesign, Language, Currency, Order } from './types';
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
import { Footer } from './components/Footer';

export default function App() {
  // Global App Settings
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('BDT');
  const [activeTab, setActiveTab] = useState<string>('shop');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Products Database State with LocalStorage Persistence
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

  // Save products to LocalStorage on state change
  useEffect(() => {
    try {
      localStorage.setItem('altaher_products', JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  }, [products]);

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
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
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
        onOpenAdmin={() => setAdminOpen(true)}
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

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        products={products}
        onAddProduct={handleAddProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={() => setProducts(INITIAL_PRODUCTS)}
        language={language}
        currency={currency}
      />

    </div>
  );
}
