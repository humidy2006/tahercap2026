import React, { useState } from 'react';
import { ShoppingBag, Eye, Star, Scissors, Check, Sparkles } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductCardProps {
  product: Product;
  language: Language;
  currency: Currency;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }) => void;
  onCustomize: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  language,
  currency,
  onQuickView,
  onAddToCart,
  onCustomize
}) => {
  const isBn = language === 'bn';

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '22.0"');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.availableColors[0] || { name: 'White', hex: '#FFFFFF' }
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleQuickAdd = () => {
    onAddToCart(product, selectedSize, selectedColor);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Top Image Container */}
      <div className="relative bg-slate-100 aspect-square overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercentage > 0 && (
            <span className="bg-rose-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
              -{discountPercentage}% {isBn ? 'ছাড়' : 'OFF'}
            </span>
          )}
          {product.isFeatured && (
            <span className="bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {isBn ? 'জনপ্রিয়' : 'FEATURED'}
            </span>
          )}
        </div>

        {/* Quick View Floating Button */}
        <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 bg-white/95 hover:bg-white text-slate-900 font-bold text-xs py-2 px-3 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isBn ? 'এক নজরে দেখুন' : 'Quick View'}</span>
          </button>

          {product.isCustomizable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCustomize(product);
              }}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs p-2 rounded-lg shadow-md transition"
              title="Custom Stitching Option"
            >
              <Scissors className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Product Information Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Crown Height */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mb-1">
            <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">
              {isBn ? product.categoryBn : product.category}
            </span>
            <span>
              {isBn ? product.crownHeightBn : product.crownHeight}
            </span>
          </div>

          {/* Product Title */}
          <h3 
            onClick={() => onQuickView(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-amber-600 cursor-pointer font-serif transition"
          >
            {isBn ? product.titleBn : product.title}
          </h3>

          {/* Rating & Fabric */}
          <div className="flex items-center justify-between mt-2 text-xs">
            <div className="flex items-center text-amber-500 font-bold gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewsCount})</span>
            </div>
            <span className="text-slate-500 text-[11px] truncate max-w-[120px]" title={isBn ? product.fabricBn : product.fabric}>
              {isBn ? product.fabricBn : product.fabric}
            </span>
          </div>
        </div>

        {/* Color & Size Selector Options */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {/* Available Colors */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">{isBn ? 'রং:' : 'Color:'}</span>
            <div className="flex items-center space-x-1">
              {product.availableColors.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedColor(color)}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                  className={`w-4 h-4 rounded-full border border-slate-300 transition-transform ${
                    selectedColor.name === color.name ? 'ring-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Size Pills */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">{isBn ? 'সাইজ:' : 'Size:'}</span>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="bg-slate-50 text-slate-800 text-[11px] font-bold border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none"
            >
              {product.sizes.map((sz, idx) => (
                <option key={idx} value={sz}>{sz}</option>
              ))}
            </select>
          </div>

          {/* Price & Add to Cart Button */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-base font-extrabold text-slate-950 font-serif">
                {formatPrice(product.price, currency)}
              </div>
              {product.originalPrice && (
                <div className="text-xs text-slate-400 line-through">
                  {formatPrice(product.originalPrice, currency)}
                </div>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              disabled={addedAnimation}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                addedAnimation
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-950 hover:bg-black text-white active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isBn ? 'যুক্ত হয়েছে' : 'Added'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isBn ? 'কার্টে দিন' : 'Add to Cart'}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
