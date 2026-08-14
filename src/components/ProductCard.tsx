import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Sparkles, Images, ZoomIn } from 'lucide-react';
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

  const totalPhotoCount = (product.images && product.images.length > 0)
    ? product.images.length
    : (product.image ? 1 : 0);

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Image Container */}
      <div 
        className="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer" 
        onClick={() => onQuickView(product)}
        title={isBn ? 'টুপির সব ছবি ও বিস্তারিত দেখতে ক্লিক করুন' : 'Click to view all photos and details'}
      >
        <img
          src={product.image}
          alt={`Taher Cap - Al Taher Cap ${product.category} ${product.designNumber} Namaz Topi (নামাজের টুপি)`}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Top-Left Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
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
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          <span className="bg-slate-950/85 backdrop-blur-xs text-amber-300 font-mono font-bold text-[11px] px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-md">
            {product.designNumber || 'Design #101'}
          </span>
          {totalPhotoCount > 1 && (
            <span className="bg-slate-900/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-md flex items-center gap-1">
              <Images className="w-3 h-3 text-amber-400" />
              <span>{isBn ? `${totalPhotoCount}টি ছবি` : `${totalPhotoCount} Photos`}</span>
            </span>
          )}
        </div>

        {/* Quick View Floating Action Overlay */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-2">
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
