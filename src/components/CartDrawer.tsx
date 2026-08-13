import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Scissors } from 'lucide-react';
import { CartItem, Language, Currency } from '../types';
import { formatPrice } from '../utils/currency';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  language: Language;
  currency: Currency;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  language,
  currency,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  const subtotal = cartItems.reduce((sum, item) => {
    const itemUnitPrice = item.isCustomItem && item.customDetails
      ? item.customDetails.unitPrice
      : item.product.price;
    return sum + itemUnitPrice * item.quantity;
  }, 0);

  // Free shipping over BDT 1500
  const freeShippingThreshold = 1500;
  const deliveryFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 80; // BDT
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="bg-slate-950 text-white p-4 flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold font-serif text-base text-amber-200">
              {isBn ? 'শপিং কার্ট' : 'Your Shopping Cart'}
            </h3>
            <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {cartItems.length} {isBn ? 'টি আইটেম' : 'Items'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 text-xs">
          {subtotal >= freeShippingThreshold ? (
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'অভিনন্দন! আপনি পাচ্ছেন ফ্রী ডেলিভারি!' : 'Congratulations! You unlocked FREE Delivery!'}</span>
            </p>
          ) : (
            <p className="text-slate-700">
              {isBn
                ? `আর ${formatPrice(freeShippingThreshold - subtotal, currency)} টাকার শপিং করলেই ফ্রী ডেলিভারি!`
                : `Add ${formatPrice(freeShippingThreshold - subtotal, currency)} more to get FREE shipping!`}
            </p>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {cartItems.length > 0 ? (
            cartItems.map((item) => {
              const itemUnitPrice = item.isCustomItem && item.customDetails
                ? item.customDetails.unitPrice
                : item.product.price;
              const itemTotal = itemUnitPrice * item.quantity;

              return (
                <div key={item.id} className="pt-3 first:pt-0 flex gap-3 items-start">
                  
                  {/* Thumbnail */}
                  <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 relative">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {item.isCustomItem && (
                      <span className="absolute top-0 right-0 bg-amber-500 text-slate-950 p-0.5 rounded-bl">
                        <Scissors className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                        {isBn ? item.product.titleBn : item.product.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Specifications */}
                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-2">
                      <span className="flex items-center gap-1">
                        <span
                          style={{ backgroundColor: item.selectedColor.hex }}
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                        />
                        {item.selectedColor.name}
                      </span>
                      <span>•</span>
                      <span>Size: {item.selectedSize}</span>
                    </div>

                    {item.isCustomItem && item.customDetails && (
                      <div className="bg-amber-50 text-[10px] text-amber-900 p-1.5 rounded border border-amber-200 space-y-0.5">
                        <p><strong>Style:</strong> {item.customDetails.baseStyle}</p>
                        <p><strong>Embroidery:</strong> {item.customDetails.embroideryPattern}</p>
                        {item.customDetails.customText && (
                          <p><strong>Custom Stitch:</strong> "{item.customDetails.customText}"</p>
                        )}
                      </div>
                    )}

                    {/* Quantity & Item Total */}
                    <div className="flex justify-between items-center pt-1">
                      <div className="flex items-center border border-slate-300 rounded overflow-hidden text-xs bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-slate-200 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-slate-200 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-extrabold text-slate-950 text-xs font-serif">
                        {formatPrice(itemTotal, currency)}
                      </span>
                    </div>

                  </div>

                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">{isBn ? 'আপনার কার্ট এখন খালি রয়েছে' : 'Your cart is currently empty'}</p>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
              <span className="font-bold text-slate-900">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
              <span className="font-bold text-slate-900">
                {deliveryFee === 0 ? (
                  <span className="text-slate-900 font-extrabold">{isBn ? 'ফ্রী' : 'FREE'}</span>
                ) : (
                  formatPrice(deliveryFee, currency)
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 text-slate-950">
              <span>{isBn ? 'সর্বমোট প্রদেয়:' : 'Grand Total:'}</span>
              <span className="font-serif text-lg text-slate-950">{formatPrice(grandTotal, currency)}</span>
            </div>
          </div>

          <button
            onClick={onProceedToCheckout}
            disabled={cartItems.length === 0}
            className="w-full py-3.5 px-4 bg-slate-950 hover:bg-black disabled:opacity-50 text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            <span>{isBn ? 'চেকআউটে এগিয়ে যান' : 'Proceed to Checkout'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
