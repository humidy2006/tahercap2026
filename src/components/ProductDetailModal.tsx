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

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || '48 cm');
  const [orderCount, setOrderCount] = useState<number>(1);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize, orderCount);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        
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
                alt={`${product.category} ${product.designNumber}`}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-2 absolute top-8 left-8">
              <span className="bg-slate-950 text-amber-300 font-extrabold text-xs px-3 py-1 rounded-full shadow-md">
                {isBn ? product.categoryBn : product.category}
              </span>
            </div>
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
