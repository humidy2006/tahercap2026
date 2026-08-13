import React from 'react';
import { Phone, MessageCircle, ShoppingBag, Scissors, Store } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_DETAILS } from '../data/company';

interface MobileBottomNavProps {
  language: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  language,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart
}) => {
  const isBn = language === 'bn';

  const whatsappMessage = encodeURIComponent(
    isBn
      ? 'আসসালামু আলাইকুম, আমি আল তাহের ক্যাপ গার্মেন্টস থেকে নামাজের টুপি অর্ডার করতে চাই।'
      : 'Assalamu Alaikum, I would like to order Taher Cap from Al Taher Cap Garments.'
  );

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md text-slate-200 border-t border-amber-500/30 shadow-2xl px-2 py-1.5 flex items-center justify-around text-[10px]">
      
      {/* Home / Collection Tab */}
      <button
        onClick={() => setActiveTab('shop')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition min-w-[56px] ${
          activeTab === 'shop' ? 'text-amber-300 font-bold bg-slate-900/90' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Store className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>{isBn ? 'টুপি শপ' : 'Catalog'}</span>
      </button>

      {/* Custom Tupi Tab */}
      <button
        onClick={() => setActiveTab('customizer')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition min-w-[56px] ${
          activeTab === 'customizer' ? 'text-amber-300 font-bold bg-slate-900/90' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Scissors className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>{isBn ? 'কাস্টম টুপি' : 'Custom'}</span>
      </button>

      {/* Cart Button */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-white transition min-w-[56px]"
      >
        <div className="relative">
          <ShoppingBag className="w-5 h-5 text-amber-300 mb-0.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-md border border-slate-950">
              {cartCount}
            </span>
          )}
        </div>
        <span>{isBn ? 'কার্ট' : 'Cart'}</span>
      </button>

      {/* WhatsApp Quick Order */}
      <a
        href={`https://wa.me/8801716587670?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 transition min-w-[56px]"
      >
        <MessageCircle className="w-5 h-5 mb-0.5 text-emerald-400 fill-emerald-500/20" />
        <span>{isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}</span>
      </a>

      {/* Phone Call Button */}
      <a
        href={`tel:${COMPANY_DETAILS.phone}`}
        className="flex flex-col items-center justify-center p-1.5 rounded-lg text-amber-300 hover:text-amber-200 transition min-w-[56px]"
      >
        <Phone className="w-5 h-5 mb-0.5 text-amber-400" />
        <span>{isBn ? 'কল দিন' : 'Call'}</span>
      </a>

    </div>
  );
};
