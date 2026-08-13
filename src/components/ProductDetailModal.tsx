import React, { useState } from 'react';
import { X, Star, ShoppingBag, Scissors, ShieldCheck, Ruler, Check, Heart, Share2 } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currency: Currency;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity: number) => void;
  onCustomize: (product: Product) => void;
  onOpenSizeGuide: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  language,
  currency,
  onAddToCart,
  onCustomize,
  onOpenSizeGuide
}) => {
  if (!isOpen || !product) return null;

  const isBn = language === 'bn';

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '22.0"');
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string }>(
    product.availableColors[0] || { name: 'White', hex: '#FFFFFF' }
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Product Image Section */}
          <div className="bg-slate-50 p-6 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-200">
            <div className="w-full aspect-square rounded-xl overflow-hidden shadow-md bg-white border border-slate-200">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="absolute top-8 left-8 bg-slate-950 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
              {isBn ? product.categoryBn : product.category}
            </div>
          </div>

          {/* Product Content Section */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-900 font-bold bg-slate-100 px-2.5 py-1 rounded-md">
                  Crown Height: {isBn ? product.crownHeightBn : product.crownHeight}
                </span>
                <div className="flex items-center text-amber-500 font-bold gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                  <span className="text-slate-400">({product.reviewsCount} {isBn ? 'রিভিউ' : 'reviews'})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-xl md:text-2xl font-bold font-serif text-slate-900 leading-snug">
                {isBn ? product.titleBn : product.title}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-slate-950 font-serif">
                  {formatPrice(product.price * quantity, currency)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(product.originalPrice * quantity, currency)}
                  </span>
                )}
                {quantity > 1 && (
                  <span className="text-xs text-slate-500 font-medium">
                    ({formatPrice(product.price, currency)} x {quantity})
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {isBn ? product.descriptionBn : product.description}
              </p>

              {/* Fabric Specs */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700">{isBn ? 'কাপড়ের ধরন: ' : 'Fabric Spec: '}</span>
                <span className="text-slate-600">{isBn ? product.fabricBn : product.fabric}</span>
              </div>

              {/* Color Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span>{isBn ? 'রং নির্বাচন করুন' : 'Select Color:'}</span>
                  <span className="text-slate-900 font-medium">{selectedColor.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {product.availableColors.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color.hex }}
                      className={`w-7 h-7 rounded-full border border-slate-300 transition-transform flex items-center justify-center ${
                        selectedColor.name === color.name ? 'ring-2 ring-slate-900 ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={color.name}
                    >
                      {selectedColor.name === color.name && (
                        <Check className={`w-3.5 h-3.5 ${color.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector & Guide Link */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{isBn ? 'সাইজ নির্বাচন করুন' : 'Select Size:'}</span>
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
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition ${
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

              {/* Quantity Picker */}
              <div className="flex items-center space-x-4 pt-1">
                <span className="text-xs font-bold text-slate-700">{isBn ? 'পরিমাণ:' : 'Quantity:'}</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
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

              {product.isCustomizable && (
                <button
                  onClick={() => {
                    onClose();
                    onCustomize(product);
                  }}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isBn ? 'এই টুপি নিজের মাপে কাস্টমাইজ করুন' : 'Customize This Cap Design'}</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
