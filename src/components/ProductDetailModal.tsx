import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag, Ruler, Check, ChevronLeft, ChevronRight, Images, ZoomIn } from 'lucide-react';
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
  if (!isOpen || !product) return null;

  const isBn = language === 'bn';

  // Compute all available images for this product
  const imageList = React.useMemo(() => {
    if (product.images && product.images.length > 0) {
      // Ensure product.image is also included if distinct
      const list = [...product.images];
      if (product.image && !list.includes(product.image)) {
        list.unshift(product.image);
      }
      return list;
    }
    return [product.image];
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '48 cm');
  const [orderCount, setOrderCount] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Reset image index when product changes
  useEffect(() => {
    setActiveImageIndex(0);
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    setOrderCount(1);
  }, [product.id]);

  const handlePrevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe Handlers for Mobile Devices
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (diff > 45) {
      // Swiped Left -> Next Image
      handleNextImage();
    } else if (diff < -45) {
      // Swiped Right -> Previous Image
      handlePrevImage();
    }
    setTouchStartX(null);
  };

  const handleAdd = () => {
    onAddToCart(product, selectedSize, orderCount);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 relative my-auto animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full transition shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image & Multi-Picture Slider Section */}
          <div className="bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-800 select-none">
            
            {/* Category Badge */}
            <div className="flex items-center gap-2 absolute top-4 left-4 z-10">
              <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-3 py-1 rounded-full shadow-md">
                {isBn ? product.categoryBn : product.category}
              </span>
            </div>

            {/* Slide Count Indicator Badge */}
            {imageList.length > 1 && (
              <div className="flex items-center gap-1 absolute top-4 right-14 z-10 bg-slate-900/80 backdrop-blur-xs text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-amber-400/30 shadow-md">
                <Images className="w-3 h-3 text-amber-400" />
                <span>
                  {activeImageIndex + 1} / {imageList.length}
                </span>
              </div>
            )}

            {/* Main Active Image with Swipe & Arrows */}
            <div 
              className="w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 relative group cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={imageList[activeImageIndex] || product.image}
                alt={`Taher Cap - Al Taher Cap ${product.category} ${product.designNumber} View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover object-center transition-all duration-300 transform scale-100 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />

              {/* Slider Left Arrow */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition shadow-lg border border-white/20 backdrop-blur-xs opacity-90 group-hover:opacity-100"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Slider Right Arrow */}
              {imageList.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/80 hover:bg-amber-400 text-white hover:text-slate-950 flex items-center justify-center transition shadow-lg border border-white/20 backdrop-blur-xs opacity-90 group-hover:opacity-100"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Mobile Slide Hint / Dots */}
              {imageList.length > 1 && (
                <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                  {imageList.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeImageIndex === idx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation Row */}
            {imageList.length > 1 && (
              <div className="w-full mt-3 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
                {imageList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-md'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-400 text-center mt-2">
              {imageList.length > 1 
                ? (isBn ? '👈 সোয়াইপ বা তীর চিহ্নে ক্লিক করে অন্য ছবি দেখুন 👉' : '👈 Swipe or click arrows to view more photos 👉')
                : (isBn ? 'আসল আল তাহের ক্যাপ প্রিভিউ' : 'Authentic Al Taher Cap Preview')
              }
            </p>

          </div>

          {/* Product Details Section */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Design No Header */}
              <div className="border-b border-slate-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block mb-1">
                  {isBn ? product.categoryBn : product.category}
                </span>
                <h2 className="text-2xl font-black font-mono text-slate-900">
                  {product.designNumber || 'Design #101'}
                </h2>
              </div>

              {/* Price & Price Quantity */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    {isBn ? 'মূল্য (Price)' : 'Price'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-slate-950 font-serif">
                      {formatPrice(product.price * orderCount, currency)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice * orderCount, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                  <span className="font-bold text-slate-600">{isBn ? 'প্যাকেজ পরিমাণ:' : 'Price Quantity:'}</span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    {product.quantity || '1 Pc'}
                  </span>
                </div>
              </div>

              {/* Size Selector & Guide Link */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">{isBn ? 'সাইজ নির্বাচন করুন (cm):' : 'Select Size (cm):'}</span>
                  <button
                    onClick={onOpenSizeGuide}
                    className="text-amber-600 hover:text-amber-800 font-bold flex items-center gap-1"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সাইজ গাইড' : 'Size Chart'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {product.sizes.map((sz, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedSize(sz)}
                      className={`py-2 px-2 text-xs font-extrabold font-mono rounded-lg border transition ${
                        selectedSize === sz
                          ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Item Counter */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="font-bold text-slate-700">{isBn ? 'অর্ডার সংখ্যা:' : 'Order Pack:'}</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setOrderCount(Math.max(1, orderCount - 1))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold text-slate-800">{orderCount}</span>
                  <button
                    onClick={() => setOrderCount(orderCount + 1)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Add to Cart Button */}
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleAdd}
                disabled={addedSuccess}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                  addedSuccess
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-950 hover:bg-black text-amber-300'
                }`}
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-amber-300" />
                    <span>{isBn ? 'কার্টে যুক্ত হয়েছে!' : 'Added to Cart Successfully!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{isBn ? 'কার্টে যোগ করুন' : 'Add to Shopping Cart'}</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
