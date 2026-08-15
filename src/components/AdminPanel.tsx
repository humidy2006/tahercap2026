import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, Plus, Edit2, Trash2, CheckCircle, RefreshCw, X, Image as ImageIcon, 
  Save, Check, Upload, FolderOpen, Camera, Images, Star, Mail, Phone, MapPin, 
  ExternalLink, MessageSquare, Send, CheckCircle2, Clock, Truck, AlertTriangle, 
  Search, Filter, ShoppingBag, Bell
} from 'lucide-react';
import { Product, WholesaleInquiry, Order, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';
import { IMAGES } from '../data/images';
import { db, collection, onSnapshot, doc, updateDoc, deleteDoc } from '../lib/firebase';

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
  const [testEmailLoading, setTestEmailLoading] = useState(false);
  const [orderStatusUpdatingId, setOrderStatusUpdatingId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Success Message Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Optimize and process uploaded image files (accepts all formats: JPG, PNG, WEBP, AVIF, HEIC, BMP, GIF, SVG, any size)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const fileName = file.name.toLowerCase();
      const isImageExtension = /\.(jpg|jpeg|png|webp|avif|bmp|gif|svg|heic|heif|jfif|pjpeg|pjp)$/i.test(fileName);
      const isImageMime = file.type.startsWith('image/') || file.type === '';

      if (!isImageMime && !isImageExtension) {
        alert(isBn 
          ? 'দয়া করে একটি সঠিক ছবির ফাইল (JPG, PNG, WebP, AVIF, BMP, GIF, SVG ইত্যাদি) নির্বাচন করুন।' 
          : 'Please select a valid image file (JPG, PNG, WebP, AVIF, BMP, GIF, SVG, etc.).'
        );
        resolve('');
        return;
      }

      // If SVG, handle directly
      if (file.type === 'image/svg+xml' || fileName.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        if (!rawDataUrl) {
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const maxDim = 1000; // Crisp high-definition size for prayer caps
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
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);

              // Try WebP first for optimal size/quality, fallback to JPEG
              let compressed = '';
              try {
                compressed = canvas.toDataURL('image/webp', 0.82);
                if (!compressed.startsWith('data:image/webp')) {
                  compressed = canvas.toDataURL('image/jpeg', 0.80);
                }
              } catch {
                compressed = canvas.toDataURL('image/jpeg', 0.80);
              }
              const finalData = compressed || rawDataUrl;

              // Upload immediately to backend server for ultra-lightweight URL & durable file persistence
              fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: finalData })
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data && data.url) {
                    resolve(data.url);
                  } else {
                    resolve(finalData);
                  }
                })
                .catch(() => {
                  resolve(finalData);
                });
            } else {
              // Upload raw if canvas failed
              fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: rawDataUrl })
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data && data.url) {
                    resolve(data.url);
                  } else {
                    resolve(rawDataUrl);
                  }
                })
                .catch(() => resolve(rawDataUrl));
            }
          } catch {
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

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    setOrderStatusUpdatingId(orderId);
    try {
      // 1. Update Firestore
      await updateDoc(doc(db, 'orders', orderId), { orderStatus: newStatus }).catch(() => {});

      // 2. Update Backend Express DB
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus })
      });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
      }
      showToast(isBn ? `অর্ডার #${orderId} এর স্ট্যাটাস '${newStatus}' করা হয়েছে` : `Order #${orderId} marked as ${newStatus}`);
    } catch (err) {
      console.error('Update order status error:', err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } finally {
      setOrderStatusUpdatingId(null);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId)).catch(() => {});
      const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.orders) {
        setOrders(data.orders);
      } else {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      }
      setDeletingOrderId(null);
      showToast(isBn ? `অর্ডার #${orderId} মুছে ফেলা হয়েছে` : `Order #${orderId} removed`);
    } catch (err) {
      console.error('Delete order error:', err);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setDeletingOrderId(null);
    }
  };

  // Send Test Notification Email
  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(isBn ? `📧 টেস্ট ইমেইল পাঠানো হয়েছে: ${data.recipient}` : `📧 Test email alert sent to: ${data.recipient}`);
      } else {
        showToast(isBn ? 'ইমেইল পাঠাতে সমস্যা হয়েছে' : 'Failed to dispatch test email');
      }
    } catch (err) {
      console.error('Test email error:', err);
      showToast('Error testing email notification');
    } finally {
      setTestEmailLoading(false);
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
    { label: 'Omani Diamond Cap', url: IMAGES.omaniDiamond },
    { label: 'Royal Velvet Circular', url: IMAGES.velvetCircular },
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
                accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif,.svg,.heic,.heif,.jfif"
                className="hidden"
              />

              {/* Product Search & Category Filter Toolbar */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder={isBn ? 'ডিজাইন নং বা ক্যাটাগরি দিয়ে খুঁজুন...' : 'Search by Design No, Category or ID...'}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white transition"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    {productSearchQuery && (
                      <button
                        onClick={() => setProductSearchQuery('')}
                        className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold"
                  >
                    <option value="All">{isBn ? 'সব ক্যাটাগরি' : 'All Categories'}</option>
                    <option value="Omani & Zari Series">Omani & Zari Series</option>
                    <option value="Royal Velvet">Royal Velvet</option>
                    <option value="Daily Comfort">Daily Comfort</option>
                    <option value="Handcrafted Heritage">Handcrafted Heritage</option>
                    <option value="Turkish Cut">Turkish Cut</option>
                    <option value="Kid's Collection">Kid's Collection</option>
                    <option value="Hajj & Umrah Package">Hajj & Umrah Package</option>
                  </select>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {isBn ? `মোট টুপি: ${products.length}টি` : `Total Caps: ${products.length}`}
                  </span>
                </div>
              </div>

              {/* Products Table with Quick Price Edit */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto shadow-xs">
                {(() => {
                  const filteredProducts = products.filter(p => {
                    const matchesSearch = productSearchQuery.trim() === '' || 
                      (p.designNumber && p.designNumber.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                      (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase())) ||
                      (p.id && p.id.toLowerCase().includes(productSearchQuery.toLowerCase()));
                    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
                    return matchesSearch && matchesCategory;
                  });

                  if (filteredProducts.length === 0) {
                    return (
                      <div className="p-8 text-center text-slate-500 space-y-2">
                        <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-xs">
                          {isBn ? 'কোনো পণ্য পাওয়া যায়নি' : 'No products match your filter'}
                        </p>
                        <button
                          onClick={() => {
                            setProductSearchQuery('');
                            setCategoryFilter('All');
                          }}
                          className="text-xs text-amber-700 underline font-semibold"
                        >
                          {isBn ? 'ফিল্টার ক্লিয়ার করুন' : 'Clear filters'}
                        </button>
                      </div>
                    );
                  }

                  return (
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
                        {filteredProducts.map((p) => {
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
              );
            })()}
          </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER ORDERS WITH EMAIL NOTIFICATIONS */}
          {activeSubTab === 'orders' && (
            <div className="space-y-5">
              {/* Notification Channel Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-900 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{isBn ? 'অর্ডার নোটিফিকেশন ইমেইল' : 'Order Notification Channel'}:</span>
                      <code className="bg-white px-2 py-0.5 rounded border border-amber-300 text-amber-950 font-bold font-mono">
                        abdullahalhumidy@gmail.com
                      </code>
                    </h5>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {isBn 
                        ? 'প্রতিটি নতুন অর্ডার প্লেস হলে স্বয়ংক্রিয়ভাবে বিস্তারিত ইমেইল পাঠানো হয় এবং নিচের ড্যাশবোর্ডে লাইভ শো করে।' 
                        : 'Instant order alerts with customer details & items table are dispatched to your email and listed below.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSendTestEmail}
                  disabled={testEmailLoading}
                  className="bg-slate-950 hover:bg-black text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs transition shrink-0 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${testEmailLoading ? 'animate-spin' : ''}`} />
                  <span>{testEmailLoading ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'টেস্ট ইমেইল পাঠান' : 'Send Test Alert')}</span>
                </button>
              </div>

              {/* Orders Header */}
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-600" />
                  <span>{isBn ? 'কাস্টমারদের সমস্ত অর্ডার' : 'All Customer Orders'} ({orders.length})</span>
                </h4>

                <button
                  onClick={fetchInquiriesAndOrders}
                  className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isBn ? 'রিফ্রেশ' : 'Refresh'}</span>
                </button>
              </div>

              {/* Orders List */}
              {orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => {
                    const isUpdating = orderStatusUpdatingId === ord.id;
                    const isDeleting = deletingOrderId === ord.id;

                    return (
                      <div 
                        key={ord.id} 
                        className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 text-xs shadow-xs hover:border-slate-300 transition"
                      >
                        {/* Order Header Row */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-sm text-slate-950 bg-slate-100 px-2.5 py-1 rounded-lg">
                              {ord.id}
                            </span>
                            <span className="text-slate-500 text-[11px] font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {ord.date}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Email notification status tag */}
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1">
                              <Mail className="w-3 h-3 text-emerald-600" />
                              <span>{isBn ? 'ইমেইল: abdullahalhumidy@gmail.com' : 'Email Sent to abdullahalhumidy@gmail.com'}</span>
                            </span>

                            {/* Payment Status Pill */}
                            <span className={`font-bold px-2.5 py-1 rounded-lg text-[10px] ${
                              ord.paymentStatus === 'Paid' 
                                ? 'bg-emerald-100 text-emerald-900' 
                                : 'bg-amber-100 text-amber-900'
                            }`}>
                              {ord.paymentStatus} • {ord.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Customer Info & Order Status Control */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          {/* Customer Details */}
                          <div className="space-y-1 md:col-span-2">
                            <div className="font-bold text-slate-900 text-sm flex flex-wrap items-center gap-2">
                              <span>{ord.customerName}</span>
                              <span className="text-slate-400 text-xs font-normal">|</span>
                              <a 
                                href={`tel:${ord.phone}`} 
                                className="text-amber-800 hover:text-amber-950 font-mono font-bold flex items-center gap-1 bg-amber-100/80 px-2 py-0.5 rounded text-[11px]"
                                title="Click to call customer"
                              >
                                <Phone className="w-3 h-3 text-amber-700" />
                                {ord.phone}
                              </a>
                              <a
                                href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-0.5 bg-emerald-100/70 px-1.5 py-0.5 rounded text-[10px]"
                                title="Chat on WhatsApp"
                              >
                                <MessageSquare className="w-3 h-3" />
                                WhatsApp
                              </a>
                            </div>

                            <p className="text-slate-600 flex items-center gap-1.5 text-[11px] pt-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{ord.address}, {ord.district ? `${ord.district}, ` : ''}{ord.city}</span>
                            </p>

                            {ord.email && ord.email !== 'N/A' && (
                              <p className="text-slate-500 text-[11px] pl-5">
                                Customer Email: {ord.email}
                              </p>
                            )}
                          </div>

                          {/* Order Status Select & Quick Action */}
                          <div className="flex flex-col justify-between items-start md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4">
                            <div className="w-full md:w-auto">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">
                                {isBn ? 'অর্ডার স্ট্যাটাস পরিবর্তন করুন:' : 'Update Order Status:'}
                              </label>
                              <select
                                value={ord.orderStatus || 'Processing'}
                                disabled={isUpdating}
                                onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                                className={`w-full md:w-auto text-xs font-bold rounded-lg px-2.5 py-1.5 border transition cursor-pointer ${
                                  ord.orderStatus === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                    : ord.orderStatus === 'Shipped'
                                    ? 'bg-blue-50 text-blue-900 border-blue-300'
                                    : ord.orderStatus === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-900 border-rose-300'
                                    : 'bg-amber-50 text-amber-950 border-amber-300'
                                }`}
                              >
                                <option value="Processing">🟡 {isBn ? 'প্রসেসিং হচ্ছে' : 'Processing'}</option>
                                <option value="Shipped">🚚 {isBn ? 'ডেলিভারিতে পাঠানো হয়েছে' : 'Shipped / In Transit'}</option>
                                <option value="Delivered">✅ {isBn ? 'ডেলিভারি সম্পন্ন' : 'Delivered'}</option>
                                <option value="Cancelled">❌ {isBn ? 'বাতিল' : 'Cancelled'}</option>
                              </select>
                            </div>

                            {/* Delete Order Option */}
                            {isDeleting ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-300 p-1 rounded-lg">
                                <span className="text-[10px] font-bold text-rose-800">{isBn ? 'মুছবেন?' : 'Delete order?'}</span>
                                <button
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] px-1.5 py-0.5 rounded"
                                >
                                  {isBn ? 'হ্যাঁ' : 'Yes'}
                                </button>
                                <button
                                  onClick={() => setDeletingOrderId(null)}
                                  className="bg-slate-200 text-slate-700 text-[10px] px-1.5 py-0.5 rounded"
                                >
                                  {isBn ? 'না' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingOrderId(ord.id)}
                                className="text-slate-400 hover:text-rose-600 text-[10px] font-semibold flex items-center gap-1 transition"
                                title="Delete Order record"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>{isBn ? 'অর্ডার রেকর্ড মুছুন' : 'Remove Order'}</span>
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ordered Items Table */}
                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100/80 font-bold text-slate-700">
                              <tr>
                                <th className="p-2.5">{isBn ? 'টুপি / ডিজাইন' : 'Product / Cap'}</th>
                                <th className="p-2.5 text-center">{isBn ? 'সাইজ' : 'Size'}</th>
                                <th className="p-2.5 text-center">{isBn ? 'পরিমাণ' : 'Quantity'}</th>
                                <th className="p-2.5 text-right">{isBn ? 'একক মূল্য' : 'Unit Price'}</th>
                                <th className="p-2.5 text-right">{isBn ? 'মোট' : 'Subtotal'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {ord.items && ord.items.map((item, idx) => {
                                const title = item.product?.designNumber || item.product?.title || `Item #${idx + 1}`;
                                const price = item.product?.price || 0;
                                const subtotal = price * item.quantity;
                                return (
                                  <tr key={idx} className="hover:bg-slate-50/50">
                                    <td className="p-2.5 font-bold text-slate-900 flex items-center gap-2">
                                      <img 
                                        src={item.product?.image || IMAGES.omaniTupi} 
                                        alt={title} 
                                        className="w-7 h-7 rounded object-cover border border-slate-200"
                                      />
                                      <div>
                                        <p>{title}</p>
                                        <p className="text-[10px] text-slate-500 font-normal">{item.product?.category}</p>
                                      </div>
                                    </td>
                                    <td className="p-2.5 text-center font-mono font-semibold text-slate-700">
                                      {item.selectedSize || 'Standard'}
                                    </td>
                                    <td className="p-2.5 text-center font-extrabold text-slate-900">
                                      {item.quantity}
                                    </td>
                                    <td className="p-2.5 text-right font-medium text-slate-600">
                                      ৳{price}
                                    </td>
                                    <td className="p-2.5 text-right font-bold text-slate-900 font-mono">
                                      ৳{subtotal}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot className="bg-slate-50/80 border-t border-slate-200 font-bold">
                              <tr>
                                <td colSpan={4} className="p-2.5 text-right text-slate-700">
                                  {isBn ? 'সর্বমোট মূল্য (Grand Total):' : 'Grand Total:'}
                                </td>
                                <td className="p-2.5 text-right text-amber-900 font-serif font-black text-sm">
                                  {formatPrice(ord.total, currency)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-600 font-bold">{isBn ? 'এখনও কোনো কাস্টমার অর্ডার নেই' : 'No online customer orders yet'}</p>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'ওয়েবসাইটে কাস্টমার অর্ডার করার সাথে সাথে এখানে প্রদর্শিত হবে এবং আপনার ইমেইলে নোটিফিকেশন যাবে।' : 'Orders placed on the website will appear here in real-time.'}
                  </p>
                </div>
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

