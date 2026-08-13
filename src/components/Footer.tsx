import React from 'react';
import { Factory, ShieldCheck, Phone, Mail, MapPin, Globe, Heart, Scissors, PackageCheck } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_DETAILS } from '../data/company';

interface FooterProps {
  language: Language;
  setActiveTab: (tab: string) => void;
  onOpenSizeGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  setActiveTab,
  onOpenSizeGuide
}) => {
  const isBn = language === 'bn';

  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-amber-500/30 font-sans">
      
      {/* Top Value Banner */}
      <div className="bg-slate-900 border-b border-slate-800 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          
          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {isBn ? '১০০% আসল সুতি ও গুণগত মান' : '100% Fine Quality Guarantee'}
              </h4>
              <p className="text-xs text-slate-400">
                {isBn ? 'প্রতিটি টুপি সুনির্দিষ্ট কাটিং ও সেলাই সমৃদ্ধ' : 'Hand-checked for stitching precision'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {isBn ? 'সারাদেশে হোম ডেলিভারি' : 'Countrywide & Global Shipping'}
              </h4>
              <p className="text-xs text-slate-400">
                {isBn ? 'ক্যাশ অন ডেলিভারি এবং দ্রুততম কুরিয়ার' : 'Cash on delivery & air freight'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                {isBn ? 'কারখানা সরাসরি পাইকারি রেট' : 'Direct Factory Wholesale'}
              </h4>
              <p className="text-xs text-slate-400">
                {isBn ? 'মাসে ৭৫,০০০+ টুপি উৎপাদনের ক্ষমতা' : '75,000+ pcs monthly manufacturing'}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Col 1: Brand Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-serif font-bold text-lg">
              T
            </div>
            <div>
              <h3 className="font-bold font-serif text-xl text-white">
                {isBn ? COMPANY_DETAILS.nameBn : COMPANY_DETAILS.name}
              </h3>
              <p className="text-xs text-amber-300 font-medium">
                {isBn ? COMPANY_DETAILS.taglineBn : COMPANY_DETAILS.tagline}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {isBn
              ? 'আমরা ঐতিহ্যবাহী ইসলামি নামাজের টুপি (নমাজের টুপি) প্রস্তুত ও রফতানিতে বিশ্বস্ত নাম। প্রিমিয়াম ওমানি এমব্রয়ডারি, রয়াল ভেলভেট, সফট কটন জালি ও নকশী টুপির বিশাল ক্যাটালগ।'
              : 'Premier manufacturer and exporter of traditional Islamic prayer caps based in Dhaka, Bangladesh. Specializing in Omani Embroidery, Royal Velvet, Organic Cotton, and Custom Tailoring.'}
          </p>

          <div className="text-xs space-y-1.5 text-slate-300 pt-1">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>{isBn ? COMPANY_DETAILS.addressBn : COMPANY_DETAILS.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Hotline & WhatsApp: {COMPANY_DETAILS.phone} / {COMPANY_DETAILS.phoneSecondary}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Email: {COMPANY_DETAILS.email}</span>
            </p>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="font-bold text-amber-300 text-sm font-serif border-b border-slate-800 pb-2">
            {isBn ? 'জরুরি লিংক' : 'Quick Navigation'}
          </h4>
          <ul className="space-y-2 text-xs font-medium text-slate-300">
            <li>
              <button onClick={() => setActiveTab('shop')} className="hover:text-amber-300 transition">
                {isBn ? '• নামাজের টুপি কালেকশন' : '• Tupi Catalogue'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('customizer')} className="hover:text-amber-300 transition flex items-center gap-1">
                <span>• {isBn ? 'কাস্টম টুপি ডিজাইন' : 'Custom Tupi Designer'}</span>
                <span className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1 rounded">NEW</span>
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('wholesale')} className="hover:text-amber-300 transition">
                {isBn ? '• পাইকারি ও বি২বি রফতানি' : '• Wholesale & Export Portal'}
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('company')} className="hover:text-amber-300 transition">
                {isBn ? '• আমাদের কোম্পানি ও কারখানা' : '• About Factory'}
              </button>
            </li>
            <li>
              <button onClick={onOpenSizeGuide} className="hover:text-amber-300 transition">
                {isBn ? '• টুপি সাইজ মাপার নির্দেশিকা' : '• Head Size & Fit Guide'}
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Categories & Payments */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="font-bold text-amber-300 text-sm font-serif border-b border-slate-800 pb-2">
            {isBn ? 'জনপ্রিয় টুপি সিরিজ' : 'Popular Series & Payment'}
          </h4>
          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Omani Zari</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Royal Velvet</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Soft Cotton Net</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Nakshi Handstitch</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Turkish Crown Cut</span>
            <span className="bg-slate-900 border border-slate-800 px-2 py-1 rounded text-slate-300">Multani Shahi</span>
          </div>

          <div className="pt-2">
            <p className="text-xs text-amber-300 font-bold mb-1.5">{isBn ? 'পেমেন্ট পদ্ধতিসমূহ:' : 'Accepted Payment Gateways:'}</p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="bg-rose-900 text-rose-100 px-2 py-1 rounded border border-rose-800">bKash</span>
              <span className="bg-orange-900 text-orange-100 px-2 py-1 rounded border border-orange-800">Nagad</span>
              <span className="bg-purple-900 text-purple-100 px-2 py-1 rounded border border-purple-800">Rocket</span>
              <span className="bg-slate-800 text-slate-200 px-2 py-1 rounded border border-slate-700">Cash On Delivery</span>
              <span className="bg-blue-900 text-blue-100 px-2 py-1 rounded border border-blue-800">Visa / Mastercard</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="bg-black border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} {COMPANY_DETAILS.name}. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All Rights Reserved.'}</p>
          <p className="text-[11px] text-slate-500 font-mono">
            Trade License: {COMPANY_DETAILS.tradeLicense} • Made with Excellence in Bangladesh
          </p>
        </div>
      </div>

    </footer>
  );
};
