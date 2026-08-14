import React, { useState, useEffect, useRef } from 'react';
import { Settings, Plus, Edit2, Trash2, CheckCircle, RefreshCw, X, Image as ImageIcon, Save, Check, Upload, FolderOpen, Camera, Images, Star } from 'lucide-react';
import { Product, WholesaleInquiry, Order, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { IMAGES } from '../data/images';
import { db, collection, onSnapshot } from '../lib/firebase';

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
  isCloudSynced?: boolean;
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
  currency,
  isCloudSynced = true
}) => {
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

  // Optimize and process uploaded image files (resize to web max 640px for fast loading and database sync)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        alert(isBn ? 'দয়া করে একটি সঠিক ছবি (JPG, PNG, WebP) নির্বাচন করুন।' : 'Please select a valid image file (JPG, PNG, WebP).');
        resolve('');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 640;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressed);
          } else {
            resolve(rawDataUrl);
          }
        };
        img.onerror = () => resolve(rawDataUrl);
        img.src = rawDataUrl;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Multiple File Upload from Computer for New Product
  const handleMultipleFileUploadForNew = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray: File[] = Array.from(files);
    const results = await Promise.all(fileArray.map((f: File) => processImageFile(f)));
    const validImages = results.filter(Boolean);

    if (validImages.length > 0) {
      setNewImages((prev) => {
        // If current image list only has the initial placeholder, replace it completely
        const isDefaultOnly = prev.length === 1 && prev[0] === IMAGES.omaniTupi;
        const base = isDefaultOnly ? [] : prev;
        const updated = [...base, ...validImages];
        setNewImage(updated[0] || validImages[0]);
        return updated;
      });
      showToast(isBn ? `${validImages.length}টি ছবি সফলভাবে লোড হয়েছে!` : `${validImages.length} photo(s) uploaded successfully!`);
    }
    e.target.value = '';
  };

  // Handle Multiple File Upload from Computer for Editing Product
  const handleMultipleFileUploadForEdit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !editingProduct) return;

    const fileArray: File[] = Array.from(files);
    const results = await Promise.all(fileArray.map((f: File) => processImageFile(f)));
    const validImages = results.filter(Boolean);

    if (validImages.length > 0) {
      setEditingProduct((prev) => {
        if (!prev) return prev;
        const currentList = Array.isArray(prev.images) && prev.images.length > 0 ? [...prev.images] : [prev.image];
        const updatedList = [...currentList, ...validImages];
        return {
          ...prev,
          images: updatedList,
          image: prev.image || validImages[0]
        };
      });
      showToast(isBn ? `${validImages.length}টি নতুন ছবি যুক্ত হয়েছে!` : `${validImages.length} photo(s) added!`);
    }
    e.target.value = '';
  };

  // Quick Direct Row Image Upload
  const activeQuickUploadRowRef = useRef<HTMLInputElement | null>(null);
  const [selectedProductForQuickImage, setSelectedProductForQuickImage] = useState<Product | null>(null);

  const handleFileUploadForQuickRow = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProductForQuickImage) return;

    const fileArray: File[] = Array.from(files);
    const results = await Promise.all(fileArray.map((f: File) => processImageFile(f)));
    const validImages = results.filter(Boolean);

    if (validImages.length > 0) {
      const currentList = Array.isArray(selectedProductForQuickImage.images) && selectedProductForQuickImage.images.length > 0 
        ? selectedProductForQuickImage.images 
        : [selectedProductForQuickImage.image];
      const updated = {
        ...selectedProductForQuickImage,
        image: validImages[0],
        images: [...validImages, ...currentList.filter(u => !validImages.includes(u))]
      };
      onUpdateProduct(updated);
      setSelectedProductForQuickImage(null);
      showToast(isBn ? `"${updated.designNumber}" এ ${validImages.length}টি নতুন ছবি যুক্ত হয়েছে!` : `Added ${validImages.length} photo(s) to "${updated.designNumber}"!`);
    }
    e.target.value = '';
  };

  // Inline Quick Price Editing State
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  // Full Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // In-app Confirmation States for safe deletion & reset
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // New Product Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('Omani & Zari Series');
  const [newDesignNumber, setNewDesignNumber] = useState('Design #109');
  const [newPrice, setNewPrice] = useState('650');
  const [newOriginalPrice, setNewOriginalPrice] = useState('850');
  const [newQuantity, setNewQuantity] = useState('1 Pc');
  const [newSizesText, setNewSizesText] = useState('48 cm, 50 cm, 52 cm, 54 cm, 56 cm');
  const [newImage, setNewImage] = useState(IMAGES.omaniTupi);
  const [newImages, setNewImages] = useState<string[]>([IMAGES.omaniTupi]);
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');

  // Real-time Firestore subscriptions for Inquiries & Orders
  useEffect(() => {
    // 1) Firestore Inquiries Listener
    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreInquiries: WholesaleInquiry[] = [];
        snapshot.forEach((d) => {
          firestoreInquiries.push(d.data() as WholesaleInquiry);
        });
        firestoreInquiries.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
        setInquiries(firestoreInquiries);
      }
    }, (err) => {
      console.log('Inquiries firestore listener:', err);
    });

    // 2) Firestore Orders Listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((d) => {
          firestoreOrders.push(d.data() as Order);
        });
        firestoreOrders.sort((a, b) => (b.id > a.id ? 1 : -1));
        setOrders(firestoreOrders);
      }
    }, (err) => {
      console.log('Orders firestore listener:', err);
    });

    fetchInquiriesAndOrders();

    return () => {
      unsubInquiries();
      unsubOrders();
    };
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

    const gallery = editingProduct.images && editingProduct.images.length > 0 
      ? editingProduct.images 
      : [editingProduct.image];

    const updated: Product = {
      ...editingProduct,
      image: gallery[0] || editingProduct.image,
      images: gallery
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
    showToast(isBn ? 'পন্য ও ছবির গ্যালারি সফলভাবে আপডেট হয়েছে!' : 'Product & photo gallery updated successfully!');
  };

  // Create New Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const parsedSizes = newSizesText
      ? newSizesText.split(',').map(s => s.trim()).filter(Boolean)
      : ['48 cm', '50 cm', '52 cm', '54 cm', '56 cm'];

    const finalGallery = newImages.length > 0 ? newImages : [newImage];

    const createdProduct: Product = {
      id: 'atg-' + Date.now(),
      category: newCategory,
      categoryBn: newCategory,
      designNumber: newDesignNumber || 'Design #101',
      price: Number(newPrice) || 500,
      originalPrice: Number(newOriginalPrice) || (Number(newPrice) ? Number(newPrice) + 200 : 700),
      quantity: newQuantity || '1 Pc',
      sizes: parsedSizes,
      image: finalGallery[0] || newImage,
      images: finalGallery,
      isFeatured: true
    };

    onAddProduct(createdProduct);
    setShowAddModal(false);
    showToast(isBn ? 'নতুন পন্য ও ছবি সফলভাবে যুক্ত হয়েছে!' : 'New Product & gallery added!');
  };

  const sampleImages = [
    { label: 'Omani Zari Cap', url: IMAGES.omaniTupi },
    { label: 'Royal Velvet Cap', url: IMAGES.velvetTupi },
    { label: 'Cotton Net Cap', url: IMAGES.cottonTupi },
    { label: 'Turkish Cap', url: IMAGES.turkishCap },
    { label: 'Pakistani Cap', url: IMAGES.pakistaniTupi },
    { label: "Kids Cap", url: IMAGES.kidsTupi }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] max-h-[750px] flex flex-col shadow-2xl border border-slate-200 relative my-2 sm:my-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold font-serif text-amber-200 text-base">
                    {isBn ? 'আল তাহের প্রোডাক্ট ও প্রাইস ম্যানেজার' : 'Al Taher Product & Price Manager'}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {isBn ? 'ক্লাউড লাইভ সিঙ্ক সক্রিয়' : 'Cloud Live Sync Active'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {isBn ? 'ল্যাপটপ বা মোবাইল যেকোনো ডিভাইস থেকে টুপি যোগ/ডিলিট করলে সবার ডিভাইসে সাথে সাথে পরিবর্তন হবে' : 'Changes made from any laptop or mobile sync instantly across all devices'}
                </p>
              </div>
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
              <>
                {showResetConfirm ? (
                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-300 px-2.5 py-1 rounded-lg animate-in fade-in">
                    <span className="text-[11px] font-bold text-rose-800">
                      {isBn ? 'রিস্টোর নিশ্চিত?' : 'Confirm reset?'}
                    </span>
                    <button
                      onClick={() => {
                        onResetProducts();
                        setShowResetConfirm(false);
                        showToast(isBn ? 'সব প্রোডাক্ট ডিফল্ট অবস্থায় রিস্টোর করা হয়েছে' : 'Restored default product catalog');
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-2 py-0.5 rounded transition"
                    >
                      {isBn ? 'হ্যাঁ' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] px-1.5 py-0.5 rounded transition"
                    >
                      {isBn ? 'না' : 'No'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline"
                  >
                    {isBn ? 'ডিফল্ট রিস্টোর' : 'Reset Default'}
                  </button>
                )}
              </>
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
                  onClick={() => {
                    setNewImages([IMAGES.omaniTupi]);
                    setNewImage(IMAGES.omaniTupi);
                    setShowAddModal(true);
                  }}
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
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ক্যাটাগরি / সিরিজ' : 'Category'}</label>
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

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ডিজাইন নম্বর (Design No.)' : 'Design Number'}</label>
                      <input
                        type="text"
                        value={newDesignNumber}
                        onChange={(e) => setNewDesignNumber(e.target.value)}
                        placeholder="e.g. Design #48 or DES-101"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">{isBn ? 'বিক্রয় মূল্য (৳ BDT) *' : 'Selling Price (৳) *'}</label>
                        <input
                          type="number"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          className="w-full bg-amber-50 border border-amber-300 text-amber-950 font-black rounded-lg p-2"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">{isBn ? 'রেগুলার মূল্য (৳)' : 'Regular Price (৳)'}</label>
                        <input
                          type="number"
                          value={newOriginalPrice}
                          onChange={(e) => setNewOriginalPrice(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-500 line-through"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মূল্যের পরিমাণ (Quantity Unit)' : 'Price Quantity Unit'}</label>
                      <input
                        type="text"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        placeholder="e.g. 1 Pc or 1 Dozen (12 Pcs)"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        {isBn ? 'উপলব্ধ সাইজ (সেমি / cm হিসাব: যেমন 48 cm, 50 cm, 52 cm)' : 'Available Sizes (in cm, e.g. 48 cm, 50 cm, 52 cm)'}
                      </label>
                      <input
                        type="text"
                        value={newSizesText}
                        onChange={(e) => setNewSizesText(e.target.value)}
                        placeholder="e.g. 48 cm, 50 cm, 52 cm, 54 cm, 56 cm"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isBn ? 'কমা (,) দিয়ে আলাদা করুন। যেমন: 48 cm মানে সাইজ 48' : 'Comma separated values. e.g. 48 cm means Size 48.'}
                      </p>
                    </div>

                    <div className="md:col-span-2 space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Images className="w-4 h-4 text-amber-600" />
                          <span>{isBn ? 'টুপির ছবি আপলোড (একাধিক ছবি যুক্ত করতে পারেন)' : 'Product Photos Gallery (Upload Multiple Photos)'}</span>
                        </label>
                        <span className="text-[11px] text-slate-700 bg-amber-200/70 font-bold px-2 py-0.5 rounded-md">
                          {isBn ? `${newImages.length}টি ছবি যুক্ত আছে` : `${newImages.length} Photo(s) Attached`}
                        </span>
                      </div>

                      {/* Multi-Photo Thumbnails Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                        {newImages.map((img, idx) => (
                          <div 
                            key={idx}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white shadow-xs group ${
                              idx === 0 ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            
                            {/* Primary Cover Badge */}
                            {idx === 0 ? (
                              <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                                {isBn ? 'কভার ছবি' : 'Cover'}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  // Move to cover (first)
                                  const reordered = [img, ...newImages.filter((_, i) => i !== idx)];
                                  setNewImages(reordered);
                                  setNewImage(img);
                                }}
                                className="absolute top-1 left-1 bg-slate-900/80 text-amber-300 hover:bg-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow-xs"
                                title={isBn ? 'প্রধান কভার ছবি বানান' : 'Set as main cover'}
                              >
                                ★ {isBn ? 'কভার' : 'Cover'}
                              </button>
                            )}

                            {/* Delete Photo Button */}
                            {newImages.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = newImages.filter((_, i) => i !== idx);
                                  setNewImages(filtered);
                                  if (newImage === img) setNewImage(filtered[0] || '');
                                }}
                                className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                                title={isBn ? 'মুছে ফেলুন' : 'Remove photo'}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Upload More Box */}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-amber-400 bg-amber-100/50 hover:bg-amber-100 flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group shadow-xs">
                          <Plus className="w-6 h-6 text-amber-700 group-hover:scale-110 transition" />
                          <span className="text-[10px] font-bold text-amber-900 mt-1">
                            {isBn ? '+ আরো ছবি' : '+ Add Photos'}
                          </span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleMultipleFileUploadForNew}
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* Actions: Local Device Browse & Presets */}
                      <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <label className="cursor-pointer bg-slate-950 hover:bg-black text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition border border-amber-400/30">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{isBn ? 'একসাথে একাধিক ছবি সিলেক্ট করুন (Phone/PC)' : 'Select Multiple Photos (Device Folder)'}</span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleMultipleFileUploadForNew}
                            className="hidden" 
                          />
                        </label>

                        <div className="flex items-center gap-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={customImageUrlInput}
                            onChange={(e) => setCustomImageUrlInput(e.target.value)}
                            placeholder="Image URL link..."
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[10px] flex-1 sm:w-48"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customImageUrlInput.trim()) {
                                setNewImages((prev) => [...prev, customImageUrlInput.trim()]);
                                setCustomImageUrlInput('');
                                showToast(isBn ? 'ছবির লিংক যুক্ত হয়েছে!' : 'Image URL added to gallery!');
                              }
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 transition"
                          >
                            + {isBn ? 'যোগ' : 'Add'}
                          </button>
                        </div>
                      </div>

                      {/* Presets Row */}
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] text-slate-600 font-bold">
                          {isBn ? 'ক্লিক করে প্রিসেট কোয়ালিটি ছবি যোগ করুন:' : 'Quickly add preset cap angles:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {sampleImages.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                if (!newImages.includes(s.url)) {
                                  setNewImages((prev) => [...prev, s.url]);
                                  showToast(isBn ? `"${s.label}" যোগ করা হয়েছে` : `Added "${s.label}"`);
                                }
                              }}
                              className="px-2 py-1 rounded-md text-[10px] font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition flex items-center gap-1 shadow-xs"
                            >
                              <Plus className="w-2.5 h-2.5 text-amber-600" />
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

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
                      <span>Edit Product: {editingProduct.designNumber}</span>
                    </h5>
                    <button type="button" onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ক্যাটাগরি / সিরিজ' : 'Category'}</label>
                      <select
                        value={editingProduct.category}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value, categoryBn: e.target.value })}
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
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'ডিজাইন নম্বর' : 'Design Number'}</label>
                      <input
                        type="text"
                        value={editingProduct.designNumber || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, designNumber: e.target.value })}
                        placeholder="e.g. Design #48"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মূল্য (৳ BDT)' : 'Price (৳ BDT)'}</label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full bg-amber-50 border border-amber-400 text-amber-950 font-black rounded-lg p-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">{isBn ? 'মূল্যের পরিমাণ (Quantity Unit)' : 'Price Quantity Unit'}</label>
                      <input
                        type="text"
                        value={editingProduct.quantity || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, quantity: e.target.value })}
                        placeholder="e.g. 1 Pc or 1 Dozen"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">
                        {isBn ? 'সাইজসমূহ (cm হিসাব)' : 'Sizes (in cm, comma separated)'}
                      </label>
                      <input
                        type="text"
                        value={editingProduct.sizes ? editingProduct.sizes.join(', ') : ''}
                        onChange={(e) => setEditingProduct({
                          ...editingProduct,
                          sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        })}
                        placeholder="e.g. 48 cm, 50 cm, 52 cm, 54 cm, 56 cm"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        {isBn ? 'কমা (,) দিয়ে সেমি সাইজ লিখুন। যেমন: 48 cm মানে সাইজ 48' : 'Separate with commas. e.g. 48 cm means Size 48.'}
                      </p>
                    </div>
                    <div className="md:col-span-2 space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between">
                        <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Images className="w-4 h-4 text-amber-600" />
                          <span>{isBn ? 'টুপির ছবি গ্যালারি (একাধিক ছবি যুক্ত ও পরিবর্তন করুন)' : 'Product Photo Gallery (Multiple Photos)'}</span>
                        </label>
                        <span className="text-[11px] text-slate-700 bg-amber-200/70 font-bold px-2 py-0.5 rounded-md">
                          {(() => {
                            const count = (editingProduct.images && editingProduct.images.length > 0) 
                              ? editingProduct.images.length 
                              : (editingProduct.image ? 1 : 0);
                            return isBn ? `${count}টি ছবি আছে` : `${count} Photo(s)`;
                          })()}
                        </span>
                      </div>

                      {/* Multi-Photo Thumbnails Grid for Editing */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-1">
                        {(() => {
                          const gallery = (editingProduct.images && editingProduct.images.length > 0)
                            ? editingProduct.images
                            : (editingProduct.image ? [editingProduct.image] : []);
                          
                          return gallery.map((img, idx) => (
                            <div 
                              key={idx}
                              className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white shadow-xs group ${
                                idx === 0 ? 'border-amber-500 ring-2 ring-amber-400/40' : 'border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                              
                              {/* Primary Cover Badge */}
                              {idx === 0 ? (
                                <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded shadow-xs">
                                  {isBn ? 'কভার ছবি' : 'Cover'}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reordered = [img, ...gallery.filter((_, i) => i !== idx)];
                                    setEditingProduct({
                                      ...editingProduct,
                                      image: img,
                                      images: reordered
                                    });
                                  }}
                                  className="absolute top-1 left-1 bg-slate-900/80 text-amber-300 hover:bg-slate-950 text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow-xs"
                                  title={isBn ? 'প্রধান কভার ছবি বানান' : 'Set as cover'}
                                >
                                  ★ {isBn ? 'কভার' : 'Cover'}
                                </button>
                              )}

                              {/* Delete Photo Button */}
                              {gallery.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filtered = gallery.filter((_, i) => i !== idx);
                                    setEditingProduct({
                                      ...editingProduct,
                                      image: filtered[0] || '',
                                      images: filtered
                                    });
                                  }}
                                  className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs"
                                  title={isBn ? 'মুছে ফেলুন' : 'Remove photo'}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ));
                        })()}

                        {/* Upload More Box */}
                        <label className="aspect-square rounded-xl border-2 border-dashed border-amber-400 bg-amber-100/50 hover:bg-amber-100 flex flex-col items-center justify-center cursor-pointer transition text-center p-2 group shadow-xs">
                          <Plus className="w-6 h-6 text-amber-700 group-hover:scale-110 transition" />
                          <span className="text-[10px] font-bold text-amber-900 mt-1">
                            {isBn ? '+ আরো ছবি' : '+ Add Photos'}
                          </span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleMultipleFileUploadForEdit}
                            className="hidden" 
                          />
                        </label>
                      </div>

                      {/* Actions: Local Device Browse & Presets */}
                      <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <label className="cursor-pointer bg-slate-950 hover:bg-black text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition border border-amber-400/30">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>{isBn ? 'কম্পিউটার/ফোন থেকে আরো ছবি যোগ করুন' : 'Select More Photos (Device Folder)'}</span>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            onChange={handleMultipleFileUploadForEdit}
                            className="hidden" 
                          />
                        </label>

                        <div className="flex items-center gap-1 w-full sm:w-auto">
                          <input
                            type="text"
                            value={customImageUrlInput}
                            onChange={(e) => setCustomImageUrlInput(e.target.value)}
                            placeholder="Image URL link..."
                            className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-[10px] flex-1 sm:w-48"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customImageUrlInput.trim()) {
                                const currentList = (editingProduct.images && editingProduct.images.length > 0)
                                  ? editingProduct.images
                                  : [editingProduct.image];
                                setEditingProduct({
                                  ...editingProduct,
                                  images: [...currentList, customImageUrlInput.trim()]
                                });
                                setCustomImageUrlInput('');
                                showToast(isBn ? 'ছবির লিংক যুক্ত হয়েছে!' : 'Image URL added!');
                              }
                            }}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] px-2.5 py-1.5 rounded-lg shrink-0 transition"
                          >
                            + {isBn ? 'যোগ' : 'Add'}
                          </button>
                        </div>
                      </div>

                      {/* Presets Row */}
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] text-slate-600 font-bold">
                          {isBn ? 'প্রিসেট টুপি ছবি যুক্ত করতে ক্লিক করুন:' : 'Add preset cap photos:'}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {sampleImages.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                const currentList = (editingProduct.images && editingProduct.images.length > 0)
                                  ? editingProduct.images
                                  : [editingProduct.image];
                                if (!currentList.includes(s.url)) {
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: [...currentList, s.url]
                                  });
                                  showToast(isBn ? `"${s.label}" যোগ করা হয়েছে` : `Added "${s.label}"`);
                                }
                              }}
                              className="px-2 py-1 rounded-md text-[10px] font-bold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 transition flex items-center gap-1 shadow-xs"
                            >
                              <Plus className="w-2.5 h-2.5 text-amber-600" />
                              <span>{s.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

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

              {/* Hidden file input for quick direct table row photo change */}
              <input
                type="file"
                ref={activeQuickUploadRowRef}
                onChange={handleFileUploadForQuickRow}
                multiple
                accept="image/*"
                className="hidden"
              />

              {/* Products Table with Quick Price Edit */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-amber-300 font-bold uppercase">
                    <tr>
                      <th className="p-3">{isBn ? 'ছবি' : 'Cap Photo'}</th>
                      <th className="p-3">{isBn ? 'ক্যাটাগরি' : 'Category'}</th>
                      <th className="p-3">{isBn ? 'ডিজাইন নং' : 'Design No.'}</th>
                      <th className="p-3">{isBn ? 'মূল্য (৳)' : 'Price (৳)'}</th>
                      <th className="p-3">{isBn ? 'মূল্যের পরিমাণ' : 'Quantity Unit'}</th>
                      <th className="p-3">{isBn ? 'সাইজ (cm)' : 'Sizes (cm)'}</th>
                      <th className="p-3 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {products.map((p) => {
                      const isEditingPrice = editingPriceId === p.id;

                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div
                                onClick={() => {
                                  setSelectedProductForQuickImage(p);
                                  activeQuickUploadRowRef.current?.click();
                                }}
                                className="relative w-12 h-12 group cursor-pointer shrink-0"
                                title={isBn ? 'ছবি বদলাতে বা নতুন ছবি যুক্ত করতে ক্লিক করুন' : 'Click to change or add photos'}
                              >
                                <img
                                  src={p.image}
                                  alt={p.designNumber}
                                  className="w-12 h-12 object-cover rounded-lg border border-slate-200 shadow-xs group-hover:opacity-85 transition"
                                />
                                <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                                  <Camera className="w-4 h-4 text-amber-300" />
                                </div>
                                {p.images && p.images.length > 1 && (
                                  <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-1 py-0.2 rounded-full border border-white shadow-xs">
                                    +{p.images.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="p-3 text-slate-600 font-medium">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                              {p.category}
                            </span>
                          </td>

                          <td className="p-3 font-mono font-extrabold text-slate-900">
                            <span className="bg-amber-100/70 border border-amber-300 text-amber-900 px-2.5 py-1 rounded text-[11px]">
                              {p.designNumber || 'Design #101'}
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

                          <td className="p-3 font-extrabold text-emerald-800">
                            <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                              {p.quantity || '1 Pc'}
                            </span>
                          </td>

                          <td className="p-3 text-slate-600 font-medium">
                            <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-mono">
                              {p.sizes && p.sizes.length > 0 ? p.sizes.slice(0, 3).join(', ') + (p.sizes.length > 3 ? '...' : '') : 'N/A'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            {deletingProductId === p.id ? (
                              <div className="inline-flex items-center gap-1 bg-rose-50 border border-rose-300 p-1 rounded-lg animate-in fade-in">
                                <span className="text-[10px] font-bold text-rose-800">
                                  {isBn ? 'মুছবেন?' : 'Delete?'}
                                </span>
                                <button
                                  onClick={() => {
                                    onDeleteProduct(p.id);
                                    setDeletingProductId(null);
                                    showToast(isBn ? `"${p.designNumber}" পণ্যটি মোছা হয়েছে` : `Product "${p.designNumber}" deleted`);
                                  }}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded transition"
                                >
                                  {isBn ? 'হ্যাঁ' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setDeletingProductId(null)}
                                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] px-1.5 py-0.5 rounded transition"
                                >
                                  {isBn ? 'না' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct({
                                    ...p,
                                    images: p.images && p.images.length > 0 ? p.images : [p.image]
                                  })}
                                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
                                  title={isBn ? 'ছবি ও গ্যালারি পরিবর্তন করুন' : 'Manage Photos & Info'}
                                >
                                  <Images className="w-3.5 h-3.5 text-amber-700" />
                                  <span>
                                    {p.images && p.images.length > 1 ? `${p.images.length}টি ছবি` : (isBn ? 'ছবি' : 'Photos')}
                                  </span>
                                </button>

                                <button
                                  onClick={() => setEditingProduct({
                                    ...p,
                                    images: p.images && p.images.length > 0 ? p.images : [p.image]
                                  })}
                                  className="p-1.5 text-slate-600 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded transition"
                                  title="Full Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  onClick={() => setDeletingProductId(p.id)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded transition"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
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

