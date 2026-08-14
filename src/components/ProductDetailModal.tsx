import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  ShoppingBag, 
  Ruler, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Images, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product, size: string, quantity: number) => void;
  onOpenSizeGuide: () => void;
  onCustomize?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  language,
  currency,
  onAddToCart,
  onOpenSizeGuide
}) => {
  const isBn = language === 'bn';

  // Compute all unique available images for this product
  const imageList = React.useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    if (product.image && !list.includes(product.image)) {
      list.unshift(product.image);
    }
    return list.length > 0 ? list : [product.image || ''];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '48 cm');
  const [orderCount, setOrderCount] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Fullscreen Lightbox Zoom state
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [lightboxTouchStartX, setLightboxTouchStartX] = useState<number | null>(null);

  // Reset states when product changes
  useEffect(() => {
    if (!product) return;
    setActiveImageIndex(0);
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setOrderCount(1);
    setIsLightboxOpen(false);
    setZoomScale(1);
  }, [product?.id]);

  const handlePrevImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? Math.max(0, imageList.length - 1) : prev - 1));
    setZoomScale(1);
  }, [imageList.length]);

  const handleNextImage = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    setZoomScale(1);
  }, [imageList.length]);

  // Keyboard navigation (Arrow keys for slider, Escape for close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        if (isLightboxOpen) {
          setIsLightboxOpen(false);
          setZoomScale(1);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLightboxOpen, handleNextImage, handlePrevImage, onClose]);

  // Touch Swipe Handlers for Main Modal
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 40) {
      handleNextImage();
    } else if (diff < -40) {
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  // Touch Swipe Handlers for Lightbox
  const handleLightboxTouchStart = (e: React.TouchEvent) => {
    if (zoomScale > 1) return; // Don't swipe if zoomed in
    setLightboxTouchStartX(e.touches[0].clientX);
  };

  const handleLightboxTouchEnd = (e: React.TouchEvent) => {
    if (lightboxTouchStartX === null || zoomScale > 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = lightboxTouchStartX - touchEndX;
    if (diff > 45) {
      handleNextImage();
    } else if (diff < -45) {
      handlePrevImage();
    }
    setLightboxTouchStartX(null);
  };

  if (!isOpen || !product) return null;

  const handleAdd = () => {
    onAddToCart(product, selectedSize, orderCount);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const activeImage = imageList[activeImageIndex] || product.image;

  return (
    <>
      {/* 1. Main Quick View Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-30 p-2.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition shadow-lg hover:scale-105 active:scale-95"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Left Column: Product Image & Interactive Multi-Picture Slider (7 Cols) */}
            <div className="md:col-span-7 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-800 select-none">
              
              {/* Category Badge & Featured Tag */}
              <div className="flex items-center gap-2 absolute top-4 left-4 z-20">
                <span className="bg-amber-400 text-slate-950 font-black text-[11px] px-3 py-1 rounded-full shadow-md">
                  {isBn ? product.categoryBn : product.category}
                </span>
                {product.isFeatured && (
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {isBn ? 'জনপ্রিয়' : 'Featured'}
                  </span>
                )}
              </div>

              {/* Multi-Photo Count Indicator */}
              {imageList.length > 1 && (
                <div className="flex items-center gap-1.5 absolute top-4 right-14 z-20 bg-slate-900/90 backdrop-blur-xs text-amber-300 text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-amber-400/40 shadow-md">
                  <Images className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isBn ? `${activeImageIndex + 1} / ${imageList.length} ছবি` : `${activeImageIndex + 1} / ${imageList.length} Photos`}
                  </span>
                </div>
              )}

              {/* Main Interactive Active Image Container */}
              <div 
                className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 relative group cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                title={isBn ? 'পূর্ণাঙ্গ স্ক্রিনে ছবি দেখতে ক্লিক করুন' : 'Click to view full screen high resolution photo'}
              >
                <img
                  src={activeImage}
                  alt={`Taher Cap - Al Taher Cap ${product.category} ${product.designNumber} Angle ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover object-center transition-all duration-300 transform scale-100 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Click for Full Photo Hover Badge (Always visible overlay button) */}
                <div className="absolute top-3 right-3 z-10 opacity-90 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className="bg-slate-950/85 hover:bg-amber-400 hover:text-slate-950 text-amber-300 text-[11px] font-bold py-1.5 px-3 rounded-full border border-amber-400/40 flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>{isBn ? 'পূর্ণাঙ্গ ছবি দেখুন' : 'Full Photo'}</span>
                  </button>
                </div>

                {/* Slider Left Arrow */}
                {imageList.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-xl border border-white/20 backdrop-blur-xs z-10 opacity-80 group-hover:opacity-100 active:scale-95"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}

                {/* Slider Right Arrow */}
                {imageList.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/85 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition-all shadow-xl border border-white/20 backdrop-blur-xs z-10 opacity-80 group-hover:opacity-100 active:scale-95"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}

                {/* Bottom Slide Indicator Dots */}
                {imageList.length > 1 && (
                  <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                    {imageList.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeImageIndex === idx ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Thumbnail Gallery Strip */}
              {imageList.length > 1 && (
                <div className="w-full mt-3.5 flex items-center justify-center gap-2.5 overflow-x-auto py-1 px-2 no-scrollbar">
                  {imageList.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImageIndex === idx
                          ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-lg'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                      }`}
                      title={`Photo ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail angle ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-0 right-0 bg-slate-950/80 text-amber-300 font-mono text-[9px] px-1 rounded-tl">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Bottom Helper Hint */}
              <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-slate-400">
                <span className="text-amber-400 font-bold">🔍</span>
                <span>
                  {imageList.length > 1
                    ? (isBn ? 'ছবিতে ক্লিক করে বড় করুন অথবা তীর চিহ্নে ক্লিক করে অন্য ছবি দেখুন' : 'Click photo for full view or use arrows/thumbnails to slide')
                    : (isBn ? 'ছবিটি বড় ও পূর্ণাঙ্গ দেখতে এর উপর ক্লিক করুন' : 'Click the photo to open full resolution view')
                  }
                </span>
              </div>

            </div>

            {/* Right Column: Product Details & Actions (5 Cols) */}
            <div className="md:col-span-5 p-5 sm:p-7 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                
                {/* Header Info */}
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
                    {isBn ? product.categoryBn : product.category}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-950 tracking-tight">
                    {product.designNumber || 'Design #101'}
                  </h2>
                </div>

                {/* Price & Quantity Card */}
                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-600 uppercase">
                      {isBn ? 'মূল্য (Price)' : 'Price'}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-slate-950 font-serif">
                        {formatPrice(product.price * orderCount, currency)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(product.originalPrice * orderCount, currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-amber-200/60 text-xs">
                    <span className="font-bold text-slate-700">{isBn ? 'প্যাকেজ পরিমাণ:' : 'Price Quantity:'}</span>
                    <span className="font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      {product.quantity || '1 Pc'}
                    </span>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{isBn ? 'সাইজ নির্বাচন করুন (cm):' : 'Select Size (cm):'}</span>
                    <button
                      onClick={onOpenSizeGuide}
                      className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 transition underline decoration-amber-400 underline-offset-2"
                    >
                      <Ruler className="w-3.5 h-3.5 text-amber-600" />
                      <span>{isBn ? 'সাইজ গাইড' : 'Size Guide'}</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {product.sizes.map((sz, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`py-2 px-2 text-xs font-extrabold font-mono rounded-xl border transition ${
                          selectedSize === sz
                            ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-md scale-102'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Item Pack Counter */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-bold text-slate-700">{isBn ? 'অর্ডার সংখ্যা (Pack):' : 'Quantity / Pack:'}</span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      type="button"
                      onClick={() => setOrderCount(Math.max(1, orderCount - 1))}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-black text-slate-800 transition"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-sm font-black text-slate-900">{orderCount}</span>
                    <button
                      type="button"
                      onClick={() => setOrderCount(orderCount + 1)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-black text-slate-800 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

              </div>

              {/* Add to Cart Button */}
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={addedSuccess}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white scale-98'
                      : 'bg-slate-950 hover:bg-black text-amber-300 hover:shadow-amber-950/20 active:scale-95'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-5 h-5 text-white" />
                      <span>{isBn ? 'কার্টে সফলভাবে যুক্ত হয়েছে!' : 'Added to Cart Successfully!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-amber-400" />
                      <span>{isBn ? 'শপিং কার্টে যোগ করুন' : 'Add to Shopping Cart'}</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 2. Fullscreen Photo Lightbox / Zoom Modal (পূর্ণাঙ্গ ছবি ভিউয়ার) */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-60 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => {
            setIsLightboxOpen(false);
            setZoomScale(1);
          }}
        >
          {/* Lightbox Top Header Controls */}
          <div 
            className="flex items-center justify-between w-full z-20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                {product.designNumber}
              </span>
              <span className="text-white font-bold text-sm hidden sm:inline">
                {isBn ? product.categoryBn : product.category}
              </span>
              {imageList.length > 1 && (
                <span className="text-amber-300 text-xs font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-amber-400/30">
                  {activeImageIndex + 1} / {imageList.length}
                </span>
              )}
            </div>

            {/* Zoom Controls & Close */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(prev + 0.4, 3))}
                className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-white/20 transition"
                title={isBn ? 'জুম ইন (+)' : 'Zoom In (+)'}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(prev - 0.4, 0.8))}
                className="p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-xl border border-white/20 transition"
                title={isBn ? 'জুম আউট (-)' : 'Zoom Out (-)'}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              {zoomScale !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoomScale(1)}
                  className="p-2 bg-slate-900/90 hover:bg-slate-800 text-amber-300 rounded-xl border border-amber-400/30 transition text-xs font-bold flex items-center gap-1"
                  title={isBn ? 'রিসেট জুম' : 'Reset Zoom'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>100%</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomScale(1);
                }}
                className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-lg ml-2"
                title={isBn ? 'বন্ধ করুন (Esc)' : 'Close (Esc)'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Center Image Stage */}
          <div 
            className="flex-1 flex items-center justify-center relative my-auto overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleLightboxTouchStart}
            onTouchEnd={handleLightboxTouchEnd}
          >
            {/* Left Nav Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition shadow-2xl border border-white/20 z-30"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-7 h-7" />
              </button>
            )}

            {/* The Full Size Image */}
            <div 
              className="max-w-[92vw] max-h-[78vh] flex items-center justify-center transition-transform duration-200 cursor-zoom-in"
              style={{ transform: `scale(${zoomScale})` }}
              onDoubleClick={() => setZoomScale(prev => (prev === 1 ? 2 : 1))}
            >
              <img
                src={activeImage}
                alt={`Full View - ${product.category} ${product.designNumber}`}
                className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Right Nav Arrow */}
            {imageList.length > 1 && (
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/90 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition shadow-2xl border border-white/20 z-30"
                aria-label="Next photo"
              >
                <ChevronRight className="w-7 h-7" />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnail Strip & Navigation Helper */}
          <div 
            className="flex flex-col items-center justify-center gap-2 z-20"
            onClick={(e) => e.stopPropagation()}
          >
            {imageList.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1 px-4 max-w-full no-scrollbar bg-slate-950/80 rounded-2xl border border-white/10">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIndex(idx);
                      setZoomScale(1);
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105'
                        : 'border-slate-800 opacity-50 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400 text-center">
              {isBn 
                ? 'ডাবল ক্লিক করে জুম ইন/আউট করুন • কীবোর্ডের Left/Right তীর দিয়ে পরবর্তী ছবি দেখুন' 
                : 'Double click to toggle zoom • Use keyboard Left/Right arrows to switch photos'}
            </p>
          </div>

        </div>
      )}
    </>
  );
};
