import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, CheckCircle, RefreshCw, X, Image as ImageIcon, Save, Check } from 'lucide-react';
import { Product, WholesaleInquiry, Order, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { IMAGES } from '../data/images';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateProduct: (updatedProduct: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetProducts?: () => void;
  language: Language;
  currency: Currency;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
  language,
  currency
}) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'inquiries' | 'orders'>('products');
  const [inquiries, setInquiries] = useState<WholesaleInquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [, setLoading] = useState(false);

  // Success Message Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Inline Quick Price Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Full Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleBn, setNewTitleBn] = useState('');
  const [newCategory, setNewCategory] = useState('Omani & Zari Series');
  const [newPrice, setNewPrice] = useState('650');
  const [newOriginalPrice, setNewOriginalPrice] = useState('850');
  const [newStock, setNewStock] = useState('200');
  const [newFabric, setNewFabric] = useState('100% Fine Cotton with Gold Thread');
  const [newFabricBn, setNewFabricBn] = useState('১০০% ফাইন কটন ও গোল্ডেন জারি');
  const [newImage, setNewImage] = useState(IMAGES.omaniTupi);

  useEffect(() => {
    fetchInquiriesAndOrders();
  }, [activeSubTab]);

  const fetchInquiriesAndOrders = async () => {
    setLoading(true);
    try {
      const [inqRes, ordRes] = await Promise.all([
        fetch('/api/inquiries'),
        fetch('/api/orders')
      ]);
      const inqData = await inqRes.json();
      const ordData = await ordRes.json();
      if (inqData.inquiries) setInquiries(inqData.inquiries);
      if (ordData.orders) setOrders(ordData.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Inline Price Save
  const handleSaveQuickPrice = (product: Product) => {
    const numericPrice = Number(tempPrice);
    if (!numericPrice || numericPrice <= 0) return;

    const updated = {
      ...product,
      price: numericPrice
    };
    onUpdateProduct(updated);
    setEditingPriceId(null);
    showToast(isBn ? `মূল্য আপডেট করা হয়েছে: ৳${numericPrice}` : `Price updated to ৳${numericPrice}`);
  };

  // Handle Full Edit Save
  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    onUpdateProduct(editingProduct);
    setEditingProduct(null);
    showToast(isBn ? 'টুপি পন্যের তথ্য সফলভাবে আপডেট হয়েছে!' : 'Product updated successfully!');
  };

  // Create New Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const createdProduct: Product = {
      id: 'atg-' + Date.now(),
      title: newTitle,
      titleBn: newTitleBn || newTitle,
      category: newCategory,
      categoryBn: newCategory,
      price: Number(newPrice) || 500,
      originalPrice: Number(newOriginalPrice) || (Number(newPrice) ? Number(newPrice) + 200 : 700),
      fabric: newFabric,
      fabricBn: newFabricBn || newFabric,
      crownHeight: 'Medium (3.2")',
      crownHeightBn: 'মিডিয়াম (৩.২ ইঞ্চি)',
      sizes: ['21.5"', '22.0"', '22.5"', '23.0"', '23.5"', '24.0"'],
      availableColors: [
        { name: 'Pure White', hex: '#FFFFFF' },
        { name: 'Royal Maroon', hex: '#7F1D1D' },
        { name: 'Midnight Black', hex: '#0F172A' }
      ],
      rating: 5.0,
      reviewsCount: 1,
      isFeatured: true,
      isCustomizable: true,
      image: newImage,
      description: 'Newly added Al Taher Cap Garments product item.',
      descriptionBn: 'আল তাহের ক্যাপ গার্মেন্টসে নতুন সংযোজিত নামাজের টুপি।',
      stock: Number(newStock) || 150,
      tags: ['New Arrival', 'Top Cap']
    };

    onAddProduct(createdProduct);
    setShowAddModal(false);
    showToast(isBn ? 'নতুন টুপি ক্যাটালগে যুক্ত হয়েছে!' : 'New Cap added to catalog!');

    // Reset Form
    setNewTitle('');
    setNewTitleBn('');
  };

  const sampleImages = [
    { label: 'Omani Zari Cap', url: IMAGES.omaniTupi },
    { label: 'Royal Velvet Cap', url: IMAGES.velvetTupi },
    { label: 'Cotton Net Cap', url: IMAGES.cottonTupi },
    { label: 'Turkish Cap', url: IMAGES.turkishCap },
    { label: 'Pakistani Cap', url: IMAGES.pakistaniTupi },
    { label: "Kids Cap", url: IMAGES.kidsTupi }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[650px] flex flex-col shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-serif text-amber-200 text-base">
                {isBn ? 'আল তাহের প্রোডাক্ট ও প্রাইস ম্যানেজার' : 'Al Taher Product & Price Manager'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {isBn ? 'সহজে টুপির দাম পরিবর্তন ও নতুন টুপি যুক্ত করুন' : 'Update prices & add new prayer caps directly'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Toast */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white font-bold text-xs py-2 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Sub Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
          <div className="flex space-x-2 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('products')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeSubTab === 'products' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'টুপি ক্যাটালগ ও দাম' : 'Cap Catalog & Prices'} ({products.length})
            </button>

            <button
              onClick={() => setActiveSubTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeSubTab === 'orders' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'গ্রাহকের অর্ডার' : 'Customer Orders'} ({orders.length})
            </button>

            <button
              onClick={() => setActiveSubTab('inquiries')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeSubTab === 'inquiries' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              {isBn ? 'পাইকারি ইনকোয়ারি' : 'B2B Inquiries'} ({inquiries.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onResetProducts && (
              <button
                onClick={() => {
                  if (window.confirm(isBn ? 'সব প্রোডাক্ট ডিফল্ট অবস্থায় নিয়ে যেতে চান?' : 'Reset to initial default products?')) {
                    onResetProducts();
                    showToast(isBn ? 'ডিফল্ট ক্যাটালগ রিস্টোর করা হয়েছে' : 'Restored default product catalog');
                  }
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                {isBn ? 'ডিফল্ট রিস্টোর' : 'Reset Default'}
              </button>
            )}

            <button
              onClick={fetchInquiriesAndOrders}
              className="p-1.5 text-slate-600 hover:text-slate-900 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
          
          {/* TAB 1: PRODUCT INVENTORY & PRICE EDITING */}
          {activeSubTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <div>
                  <h4 className="font-bold text-slate-950 text-xs sm:text-sm">
                    {isBn ? 'টুপির দাম পরিবর্তন এবং নতুন টুপি যোগ করার প্যানেল' : 'Cap Price Manager & Product Creator'}
                  </h4>
                  <p className="text-[11px] text-amber-900">
                    {isBn ? 'যে কোনো টুপির পাশের দাম ঘরে ক্লিক করে সরাসরি আপডেট করুন' : 'Click the edit icon or price box to change prices in 1 second'}
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 bg-slate-950 hover:bg-black text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isBn ? 'নতুন টুপি যোগ করুন' : 'Add New Cap'}</span>
                </button>
              </div>

              {/* Add New Product Form Modal */}
              {showAddModal && (
                <form onSubmit={handleCreateProduct} className="bg-white border-2 border-slate-900 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-slate-950 text-sm uppercase flex items-center gap-2">
                      <Plus className="w-4 h-4 text-amber-500" />
                      <span>{isBn ? 'নতুন টুপি ক্যাটালগে যুক্ত করুন' : 'Create New Cap Item'}</span>
                    </h5>
                    <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cap Name (English) *</label>
                      <input
                        type="text"
                        required
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Royal Omani Crown Cap"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">টুপির নাম (বাংলা)</label>
                      <input
                        type="text"
                        value={newTitleBn}
                        onChange={(e) => setNewTitleBn(e.target.value)}
                        placeholder="যেমন: রাজকীয় ওমানি ক্রাউন টুপি"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category / সিরিজ</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                      >
                        <option value="Omani & Zari Series">Omani & Zari Series</option>
                        <option value="Royal Velvet">Royal Velvet</option>
                        <option value="Daily Comfort">Daily Comfort</option>
                        <option value="Handcrafted Heritage">Handcrafted Heritage</option>
                        <option value="Turkish Cut">Turkish Cut</option>
                        <option value="Kid's Collection">Kid's Collection</option>
                        <option value="Hajj & Umrah Package">Hajj & Umrah Package</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Selling Price (৳ BDT) *</label>
                        <input
                          type="number"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 text-amber-950 font-black rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Regular Price (৳)</label>
                        <input
                          type="number"
                          value={newOriginalPrice}
                          onChange={(e) => setNewOriginalPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-500 line-through"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Stock Quantity (Pcs)</label>
                      <input
                        type="number"
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Fabric Specification</label>
                      <input
                        type="text"
                        value={newFabric}
                        onChange={(e) => setNewFabric(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="block font-bold text-slate-700">Cap Image Presets / Custom Image URL</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {sampleImages.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setNewImage(s.url)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
                              newImage === s.url ? 'bg-slate-950 text-amber-300 border-slate-900' : 'bg-slate-100 border-slate-200 text-slate-700'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="Paste image URL..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-slate-950 text-amber-300 text-xs font-bold rounded-lg hover:bg-black shadow-md"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              )}

              {/* Full Edit Modal */}
              {editingProduct && (
                <form onSubmit={handleSaveEditedProduct} className="bg-white border-2 border-amber-500 p-5 rounded-2xl shadow-xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h5 className="font-bold text-slate-950 text-sm uppercase flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-amber-600" />
                      <span>Edit Product: {editingProduct.title}</span>
                    </h5>
                    <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cap Title (EN)</label>
                      <input
                        type="text"
                        value={editingProduct.title}
                        onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cap Title (BN)</label>
                      <input
                        type="text"
                        value={editingProduct.titleBn}
                        onChange={(e) => setEditingProduct({ ...editingProduct, titleBn: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Price (৳ BDT)</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full bg-amber-50 border border-amber-400 text-amber-950 font-black rounded-lg p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Stock (Pcs)</label>
                      <input
                        type="number"
                        value={editingProduct.stock}
                        onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Fabric</label>
                      <input
                        type="text"
                        value={editingProduct.fabric}
                        onChange={(e) => setEditingProduct({ ...editingProduct, fabric: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editingProduct.image}
                        onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-slate-950 text-amber-300 text-xs font-bold rounded-lg hover:bg-black shadow-md flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>Update Changes</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Products Table with Quick Price Edit */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-amber-300 font-bold uppercase">
                    <tr>
                      <th className="p-3">Cap / Image</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price (৳ BDT)</th>
                      <th className="p-3">Stock</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {products.map((p) => {
                      const isEditingPrice = editingPriceId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                              />
                              <div>
                                <p className="font-bold text-slate-900">{p.title}</p>
                                <p className="text-[10px] text-slate-500">{p.titleBn}</p>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-slate-600 font-medium">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {p.category}
                            </span>
                          </td>

                          {/* Quick Price Cell */}
                          <td className="p-3">
                            {isEditingPrice ? (
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-amber-900">৳</span>
                                <input
                                  type="number"
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-20 bg-amber-50 border border-amber-400 p-1 font-bold rounded text-xs text-amber-950"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleSaveQuickPrice(p)}
                                  className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
                                  title="Save Price"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingPriceId(null)}
                                  className="p-1.5 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                  title="Cancel"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => {
                                  setEditingPriceId(p.id);
                                  setTempPrice(p.price.toString());
                                }}
                                className="inline-flex items-center gap-1.5 cursor-pointer group bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-lg transition"
                                title="Click to quick-edit price"
                              >
                                <span className="font-extrabold text-amber-950 font-serif text-sm">
                                  {formatPrice(p.price, currency)}
                                </span>
                                <Edit2 className="w-3 h-3 text-amber-700 opacity-60 group-hover:opacity-100" />
                              </div>
                            )}
                          </td>

                          <td className="p-3 font-bold text-slate-800">{p.stock} Pcs</td>

                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => setEditingProduct(p)}
                              className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded transition"
                              title="Full Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (window.confirm(isBn ? `"${p.title}" টুপিটি মুছে ফেলতে চান?` : `Delete product "${p.title}"?`)) {
                                  onDeleteProduct(p.id);
                                  showToast(isBn ? 'টুপি মোছা হয়েছে' : 'Product deleted');
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                              title="Delete Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER ORDERS */}
          {activeSubTab === 'orders' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                {isBn ? 'সম্প্রতি আসা অনলাইন কাস্টমার অর্ডার' : 'Recent Online Customer Orders'}
              </h4>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((ord) => (
                    <div key={ord.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-black font-mono text-slate-950">{ord.id}</span>
                        <span className="bg-slate-100 text-slate-900 font-bold px-2 py-0.5 rounded">
                          {ord.paymentStatus} • {ord.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <div>
                          <p className="font-bold text-slate-900">{ord.customerName} ({ord.phone})</p>
                          <p className="text-[11px] text-slate-500">{ord.address}, {ord.city}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-extrabold font-serif text-slate-950 text-sm">{formatPrice(ord.total, currency)}</p>
                          <p className="text-[10px] text-slate-400">{ord.items.length} items</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-6 text-center">No orders recorded yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: WHOLESALE INQUIRIES */}
          {activeSubTab === 'inquiries' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">
                {isBn ? 'বি২বি ও ডিলার পাইকারি ইনকোয়ারি' : 'B2B & Overseas Export Inquiries'}
              </h4>

              {inquiries.length > 0 ? (
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div key={inq.id} className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <span className="font-bold text-slate-900">{inq.name} ({inq.companyName})</span>
                        <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                          {inq.estimatedQuantity} Pcs Target
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <p>Phone: <strong className="text-slate-950">{inq.phone}</strong> | Country: {inq.country}</p>
                        <p className="font-semibold text-slate-800">Series: {inq.tupiType}</p>
                      </div>
                      {inq.notes && (
                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                          "{inq.notes}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic p-6 text-center">No wholesale inquiries submitted yet.</p>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

