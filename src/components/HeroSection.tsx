import React from 'react';
import { ShoppingBag, Scissors, ShieldCheck, Award, Truck, Sparkles, PhoneCall } from 'lucide-react';
import { Language } from '../types';
import { IMAGES } from '../data/images';
import { COMPANY_DETAILS } from '../data/company';

interface HeroSectionProps {
  language: Language;
  onShopClick: () => void;
  onCustomizerClick: () => void;
  onWholesaleClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  language,
  onShopClick,
  onCustomizerClick,
  onWholesaleClick
}) => {
  const isBn = language === 'bn';

  return (
    <div className="relative bg-black text-white overflow-hidden border-b border-amber-500/30">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 z-0 opacity-20 mix-blend-luminosity">
        <img
          src={IMAGES.heroBanner}
          alt="Al Taher Namaz Tupi Collection"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Decorative Radial Gradients */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isBn ? 'স্থাপিত ১৯৯৯ • আন্তর্জাতিক মানের আসল কটন ও জারি সেলাই এর টুপি' : 'Est. 1999 • Premier Islamic Cap Manufacturer'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-serif text-white leading-tight">
              {isBn ? (
                <>
                  আসল তাহের ক্যাপ ও নামাজের টুপি <br />
                  <span className="text-amber-400 font-extrabold">আল তাহের ক্যাপ গার্মেন্টস</span>
                </>
              ) : (
                <>
                  Authentic Taher Cap & Namaz Topi <br />
                  <span className="text-amber-400 font-extrabold">Al Taher Cap Garments</span>
                </>
              )}
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {isBn ? (
                'আমরা ১৯৯৯ সাল থেকে দীর্ঘ ২৭ বছর ধরে আসল তাহের ক্যাপ (Taher Cap / Al Taher Cap) এবং প্রিমিয়াম নামাজের টুপি (Namaz Topi / Namaz Tupi) প্রস্তুত ও বিশ্বব্যাপী পাইকারি রফতানি করে আসছি। ওমানি জারি, রয়াল ভেলভেট, সফট কটন এবং তুর্কি ও নকশী টুপির সবচেয়ে বড় কারখানা।'
              ) : (
                'Discover Bangladesh’s premier manufacturer (Est. 1999, 27+ years of legacy) of authentic Taher Cap, Al Taher Cap, and Namaz Topi (Islamic Prayer Caps). From royal velvet zari borders and Omani embroidery to breathable organic cotton net caps—direct from our Dhaka factory.'
              )}
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
              <button
                onClick={onShopClick}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 px-6 py-3.5 rounded-xl font-bold shadow-lg transition transform hover:-translate-y-0.5 text-sm"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isBn ? 'টুপি কালেকশন দেখুন' : 'Shop Tupi Collection'}</span>
              </button>

              <button
                onClick={onCustomizerClick}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-400/40 px-5 py-3.5 rounded-xl font-bold transition text-sm"
              >
                <Scissors className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'কাস্টম টুপি ডিজাইন করুন' : 'Custom Tupi Designer'}</span>
              </button>

              <button
                onClick={onWholesaleClick}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-3.5 rounded-xl font-semibold transition text-sm"
              >
                <PhoneCall className="w-4 h-4 text-amber-300" />
                <span>{isBn ? 'পাইকারি অর্ডার ইনকোয়ারি' : 'Wholesale Inquiry'}</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-800 text-left">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{isBn ? '১০০% সুতি কাপড়' : '100% Fine Cotton'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'ঘাম প্রতিরোধী লাইনিং' : 'Breathable Inner'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{isBn ? 'হস্তশিল্প সেলাই' : 'Hand Embroidery'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'অভিজ্ঞ কারিগর' : 'Expert Artisans'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{isBn ? 'সারাদেশে ক্যাশ অন ডেলিভারি' : 'Countrywide COD'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'দ্রুত হোম ডেলিভারি' : 'Worldwide Shipping'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white">{isBn ? '৭৫,০০০+ মাসিক উৎপাদন' : '75,000+ Monthly'}</p>
                  <p className="text-[10px] text-slate-400">{isBn ? 'কারখানা সরাসরি পাইকারি' : 'Direct Factory Rates'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Visual Showcase Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-amber-400/40 to-slate-900 border border-amber-400/30 shadow-2xl backdrop-blur-xs">
              <div className="overflow-hidden rounded-xl bg-slate-900 relative aspect-4/3">
                <img
                  src={IMAGES.omaniTupi}
                  alt="Al Taher Omani Tupi"
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="bg-amber-400 text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {isBn ? 'হট সেলিং ডিজাইন' : 'HOT SELLING'}
                  </span>
                  <h3 className="text-lg font-bold font-serif mt-1 text-amber-100">
                    {isBn ? 'রাজকীয় ওমানি জাড়ী সেলাই টুপি' : 'Royal Omani Gold Zari Stitch Tupi'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {isBn ? 'আল তাহের ক্যাপ গার্মেন্টস সিগনেচার কালেকশন' : 'Al Taher Signature Collection • Factory Direct'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
