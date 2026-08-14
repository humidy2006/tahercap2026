import React, { useState, useMemo } from 'react';
import { ShoppingBag, Eye, Check, Sparkles, Images, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  language: Language;
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onCustomize?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  currency,
  onQuickView,
  onAddToCart
}) => {
  const isBn = language === 'bn';

  // Compute all available images for this product
  const galleryImages = useMemo(() => {
    const list: string[] = [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach(img => {
        if (img && typeof img === 'string' && !list.includes(img)) {
          list.push(img);
        }
      });
    }
    if (product.image && typeof product.image === 'string' && !list.includes(product.image)) {
      list.unshift(product.image);
    }
    return list.length > 0 ? list : [product.image || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80'];
  }, [product.images, product.image]);

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '48 cm');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = () => {
    onAddToCart(product, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const totalPhotoCount = galleryImages.length;

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  // Touch Swipe on Card
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next image
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
      } else {
        // swipe right -> prev image
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
      }
    }
    setTouchStartX(null);
  };

  const activePhotoUrl = galleryImages[currentImageIndex] || galleryImages[0];

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Image Container with Direct Slide & Full View */}
      <div 
        className="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer select-none" 
        onClick={() => onQuickView(product)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        title={isBn ? 'টুপির সব ছবি ও বিস্তারিত দেখতে ক্লিক করুন' : 'Click to view all photos and details'}
      >
        <img
          key={activePhotoUrl}
          src={activePhotoUrl}
          alt={`Taher Cap - ${product.category} ${product.designNumber} Namaz Topi (নামাজের টুপি)`}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 animate-in fade-in duration-200"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top-Left Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          {discountPercentage > 0 && (
            <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
              -{discountPercentage}% {isBn ? 'ছাড়' : 'OFF'}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isBn ? 'জনপ্রিয়' : 'FEATURED'}
            </span>
          )}
        </div>

        {/* Top-Right: Design Number Badge & Multi-Photo Pill */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 pointer-events-none">
          <span className="bg-slate-950/85 backdrop-blur-xs text-amber-300 font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-md">
            {product.designNumber || 'Design #101'}
          </span>
          {totalPhotoCount > 1 && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md flex items-center gap-1">
              <Images className="w-3 h-3 text-amber-400" />
              <span>
                {currentImageIndex + 1}/{totalPhotoCount} {isBn ? 'ছবি' : 'Photos'}
              </span>
            </span>
          )}
        </div>

        {/* Direct Next & Prev Slide Arrows on the Card */}
        {totalPhotoCount > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              aria-label="Previous Photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center shadow-lg transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-20"
            >
              <ChevronLeft className="w-5 h-5 text-amber-300" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              aria-label="Next Photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center shadow-lg transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-20"
            >
              <ChevronRight className="w-5 h-5 text-amber-300" />
            </button>

            {/* Pagination Dots at Bottom */}
            <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5 z-10 pointer-events-none">
              {galleryImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex
                      ? 'w-5 bg-amber-400 shadow-xs'
                      : 'w-1.5 bg-white/70 shadow-xs'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Quick View Floating Action Overlay */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-slate-950/90 hover:bg-slate-950 text-amber-300 hover:text-amber-200 font-black text-xs py-2 px-3 rounded-xl shadow-xl flex items-center justify-center gap-1.5 transition backdrop-blur-xs border border-amber-400/30 active:scale-95"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span>{isBn ? 'ছবি ও বিবরণ দেখুন' : 'View Photos & Info'}</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl shadow-xl transition backdrop-blur-xs border border-slate-200 active:scale-95"
            title={isBn ? 'বড় করে দেখুন' : 'Expand full photo'}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Category & Design No */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-950 bg-amber-100/90 border border-amber-200 px-2.5 py-0.5 rounded-md">
              {isBn ? product.categoryBn : product.category}
            </span>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {product.designNumber}
            </span>
          </div>

          {/* Price & Quantity Info */}
          <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                {isBn ? 'মূল্য (Price)' : 'Price'}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-extrabold text-slate-950 font-serif">
                  {formatPrice(product.price, currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatPrice(product.originalPrice, currency)}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                {isBn ? 'পরিমাণ (Quantity)' : 'Quantity'}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-0.5">
                {product.quantity || '1 Pc'}
              </span>
            </div>
          </div>
        </div>

        {/* Size Selection & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {/* Size Dropdown */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{isBn ? 'সাইজ (Size cm):' : 'Size (cm):'}</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-slate-50 text-slate-900 text-xs font-bold border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {product.sizes.map((sz, idx) => (
                <option key={idx} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={addedAnimation}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
              addedAnimation
                ? 'bg-slate-800 text-white'
                : 'bg-slate-950 hover:bg-black text-white active:scale-95'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4 text-amber-300" />
                <span>{isBn ? 'কার্টে যুক্ত হয়েছে' : 'Added to Cart'}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'অর্ডার করতে কার্টে যোগ করুন' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
