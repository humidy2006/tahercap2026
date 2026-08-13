import React, { useState } from 'react';
import { Scissors, Sparkles, Check, ShoppingBag, Info, RefreshCw, Layers, Ruler, Palette, Type } from 'lucide-react';
import { Language, Currency, CustomTupiDesign } from '../types';
import { formatPrice } from '../utils/currency';

interface CustomTupiDesignerProps {
  language: Language;
  currency: Currency;
  onAddCustomToCart: (design: CustomTupiDesign) => void;
  onOpenSizeGuide: () => void;
}

export const CustomTupiDesigner: React.FC<CustomTupiDesignerProps> = ({
  language,
  currency,
  onAddCustomToCart,
  onOpenSizeGuide
}) => {
  const isBn = language === 'bn';

  // State for customization selections
  const [baseStyle, setBaseStyle] = useState<CustomTupiDesign['baseStyle']>('Omani Flat Top');
  const [fabric, setFabric] = useState<CustomTupiDesign['fabric']>('Organic Cotton');
  const [baseColor, setBaseColor] = useState<{ name: string; hex: string }>({ name: 'Pure White', hex: '#FFFFFF' });
  const [embroideryPattern, setEmbroideryPattern] = useState<CustomTupiDesign['embroideryPattern']>('Golden Zari Rim');
  const [crownHeight, setCrownHeight] = useState<CustomTupiDesign['crownHeight']>('3.2 Inches');
  const [customText, setCustomText] = useState<string>('');
  const [customTextLanguage, setCustomTextLanguage] = useState<'Bangla' | 'Arabic' | 'English'>('Bangla');
  const [size, setSize] = useState<string>('22.5"');
  const [quantity, setQuantity] = useState<number>(1);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Available options lists
  const baseStyles = [
    { id: 'Omani Flat Top', name: 'ওমানি ফ্ল্যাট টপ', desc: 'Flat circular top with sharp vertical walls' },
    { id: 'Classic Round', name: 'ক্লাসিক রাউন্ড ডোম', desc: 'Traditional rounded Islamic dome cap' },
    { id: 'Turkish High Crown', name: 'তুর্কি দীর্ঘ ক্রাউন', desc: 'Tall structured cylinder top with sharp cuts' },
    { id: 'Stretch Dome', name: 'নমনীয় সুতি ডোম', desc: 'Stretchable lightweight body fitting' }
  ];

  const fabrics = [
    { id: 'Organic Cotton', name: '১০০% অর্গানিক কটন', extra: 0, desc: 'Soft, sweat-absorbent, ideal for summer' },
    { id: 'Royal Velvet', name: 'রয়াল ভেলভেট', extra: 250, desc: 'Plush velvet finish for royal look' },
    { id: 'Micro Silk', name: 'মাইক্রো সিল্ক', extra: 180, desc: 'Smooth sheen texture' },
    { id: 'Linen Mesh', name: 'নিঃশ্বাসযোগ্য লিনেন', extra: 100, desc: 'Ultra breathable structured weave' }
  ];

  const colors = [
    { name: 'Pure White', hex: '#FFFFFF', border: 'border-slate-300' },
    { name: 'Royal Maroon', hex: '#7F1D1D', border: 'border-transparent' },
    { name: 'Midnight Navy', hex: '#1E3A8A', border: 'border-transparent' },
    { name: 'Emerald Green', hex: '#065F46', border: 'border-transparent' },
    { name: 'Jet Black', hex: '#0F172A', border: 'border-transparent' },
    { name: 'Cream Ivory', hex: '#FEF3C7', border: 'border-amber-200' }
  ];

  const embroideryPatterns = [
    { id: 'Golden Zari Rim', name: 'গোল্ডেন জারি পাড়', extra: 200, desc: 'Metallic gold embroidery trim around the base' },
    { id: 'Silver Calligraphy', name: 'সিলভার ক্যালিগ্রাফি', extra: 250, desc: 'Ornate Islamic motif stitching' },
    { id: 'Floral Hand-Stitch', name: 'হাতে সেলাইয়ের নকশী', extra: 350, desc: '100% handmade artisanal needlework' },
    { id: 'Minimalist Edge', name: 'একদম সাধারণ বর্ডার', extra: 50, desc: 'Subtle tone-on-tone stitch' },
    { id: 'None (Plain)', name: 'কোনো নকশা নেই (প্লেন)', extra: 0, desc: 'Clean unembroidered finish' }
  ];

  const heights: CustomTupiDesign['crownHeight'][] = ['2.8 Inches', '3.2 Inches', '3.8 Inches (Hard)'];
  const sizesList = ['21.5"', '22.0"', '22.5"', '23.0"', '23.5"', '24.0"'];

  // Calculate price dynamically
  const basePrice = 450;
  const fabricExtra = fabrics.find(f => f.id === fabric)?.extra || 0;
  const embroideryExtra = embroideryPatterns.find(e => e.id === embroideryPattern)?.extra || 0;
  const textExtra = customText.trim().length > 0 ? 150 : 0;
  
  const unitPrice = basePrice + fabricExtra + embroideryExtra + textExtra;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const customDesign: CustomTupiDesign = {
      baseStyle,
      fabric,
      baseColor,
      embroideryPattern,
      crownHeight,
      customText,
      customTextLanguage,
      size,
      quantity,
      unitPrice
    };

    onAddCustomToCart(customDesign);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Title Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white rounded-3xl p-6 md:p-10 shadow-xl border border-amber-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Scissors className="w-3.5 h-3.5" />
            <span>{isBn ? 'অনলাইন কাস্টম সেলাই স্টুডিও' : 'Custom Tupi Tailoring Studio'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-serif text-white">
            {isBn ? 'আপনার পছন্দের ডিজাইনে টুপি তৈরি করুন' : 'Interactive Custom Namaz Tupi Designer'}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isBn
              ? 'পছন্দের কাপড়ের ধরন, রং, ক্রাউনের উচ্চতা, এমব্রয়ডারি বর্ডার এবং নিজের নাম বা মাদরাসার নাম সেলাই করে সুনির্দিষ্ট মাপে টুপি অর্ডার করুন। আল তাহের কারখানায় বিশেষ যত্নে আপনার টুপি তৈরি করা হবে।'
              : 'Customize every detail of your Islamic prayer cap—choose fabric, shape, colors, embroidery pattern, crown height, and personalize with custom name stitching.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Interactive 2D/3D Cap Visual Preview */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>{isBn ? 'লাইভ প্রিভিউ' : 'Live Design Preview'}</span>
            </h3>
            <span className="text-[11px] font-semibold bg-slate-100 text-slate-900 px-2.5 py-1 rounded-full">
              {baseStyle}
            </span>
          </div>

          {/* SVG Visual Cap Canvas */}
          <div className="bg-slate-100 rounded-xl p-8 flex flex-col items-center justify-center relative min-h-[260px] border border-slate-200/80 overflow-hidden shadow-inner">
            
            {/* Render Cap Representation */}
            <div className="relative w-56 h-44 flex flex-col items-center justify-end transform transition-all duration-300">
              
              {/* Cap Main Crown Body */}
              <div
                style={{ backgroundColor: baseColor.hex }}
                className={`w-48 transition-all duration-300 rounded-t-3xl shadow-lg border relative flex flex-col items-center justify-center ${
                  crownHeight.includes('3.8') ? 'h-32' : crownHeight.includes('3.2') ? 'h-28' : 'h-22'
                } ${baseColor.hex === '#FFFFFF' ? 'border-slate-300' : 'border-black/20'}`}
              >
                {/* Texture Overlay for Fabric */}
                <div className="absolute inset-0 bg-black/5 rounded-t-3xl pointer-events-none"></div>

                {/* Embroidery Pattern Rim Accent */}
                {embroideryPattern !== 'None (Plain)' && (
                  <div
                    className={`absolute bottom-0 inset-x-0 h-6 flex items-center justify-center border-t border-b text-[10px] font-bold tracking-widest ${
                      embroideryPattern.includes('Golden')
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 border-amber-600/50 shadow-sm'
                        : embroideryPattern.includes('Silver')
                        ? 'bg-gradient-to-r from-slate-200 via-white to-slate-300 text-slate-900 border-slate-400'
                        : embroideryPattern.includes('Floral')
                        ? 'bg-rose-900 text-amber-200 border-amber-300'
                        : 'bg-slate-900 text-slate-100'
                    }`}
                  >
                    <span>❖ ❖ ❖ {embroideryPattern.split(' ')[0]} ❖ ❖ ❖</span>
                  </div>
                )}

                {/* Custom Stitched Name Text on Side */}
                {customText.trim() && (
                  <div className="absolute top-4 text-center px-2 z-10">
                    <span className="font-serif text-xs font-black tracking-widest px-2 py-0.5 rounded bg-black/20 text-amber-300 backdrop-blur-xs border border-amber-400/30">
                      {customText}
                    </span>
                  </div>
                )}
              </div>

              {/* Base Cap Rim Shadow */}
              <div className="w-52 h-3 bg-slate-400/30 rounded-full blur-xs mt-1"></div>
            </div>

            <div className="mt-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-800">
                {isBn ? `${fabric} • ${baseColor.name}` : `${fabric} • ${baseColor.name}`}
              </p>
              <p className="text-[11px] text-slate-500">
                {isBn ? `ক্রাউন: ${crownHeight} | সাইজ: ${size}` : `Crown: ${crownHeight} | Size: ${size}`}
              </p>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-950">{isBn ? 'কাস্টম মূল্য তালিকা:' : 'Tailored Pricing:'}</span>
              <span className="text-2xl font-black font-serif text-slate-950">
                {formatPrice(totalPrice, currency)}
              </span>
            </div>

            <div className="text-[11px] space-y-1 text-slate-600 border-t border-slate-200 pt-2">
              <div className="flex justify-between">
                <span>{isBn ? 'বেস টুপি ও কাটিং:' : 'Base Cap & Cutting:'}</span>
                <span className="font-semibold">{formatPrice(basePrice, currency)}</span>
              </div>
              {fabricExtra > 0 && (
                <div className="flex justify-between">
                  <span>{isBn ? `কাপড় ফি (${fabric}):` : `Fabric Upgrade (${fabric}):`}</span>
                  <span className="font-semibold">+{formatPrice(fabricExtra, currency)}</span>
                </div>
              )}
              {embroideryExtra > 0 && (
                <div className="flex justify-between">
                  <span>{isBn ? `এমব্রয়ডারি বর্ডার (${embroideryPattern}):` : `Embroidery (${embroideryPattern}):`}</span>
                  <span className="font-semibold">+{formatPrice(embroideryExtra, currency)}</span>
                </div>
              )}
              {textExtra > 0 && (
                <div className="flex justify-between">
                  <span>{isBn ? 'নাম/ক্যালিগ্রাফি সেলাই:' : 'Custom Text Stitching:'}</span>
                  <span className="font-semibold">+{formatPrice(textExtra, currency)}</span>
                </div>
              )}
            </div>

            {/* Add Custom Tupi to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={addedAnimation}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 ${
                addedAnimation
                  ? 'bg-slate-800 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 active:scale-95'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-4 h-4 text-amber-300" />
                  <span>{isBn ? 'কাস্টম টুপি কার্টে যুক্ত হয়েছে!' : 'Custom Cap Added To Cart!'}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isBn ? 'কার্টে যোগ করুন' : 'Add Custom Cap To Cart'}</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Customization Options Controls */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-lg p-6 md:p-8 space-y-8">
          
          {/* Step 1: Base Shape/Style */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="w-4 h-4 text-slate-800" />
              <span>১. টুপির শেপ/স্টাইল বেছে নিন (Select Shape)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {baseStyles.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setBaseStyle(st.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition ${
                    baseStyle === st.id
                      ? 'border-slate-900 bg-slate-100/80 ring-2 ring-slate-900/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{isBn ? st.name : st.id}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Fabric Material */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Scissors className="w-4 h-4 text-amber-600" />
              <span>২. প্রিমিয়াম কাপড় নির্বাচন (Choose Fabric)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fabrics.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFabric(f.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition flex justify-between items-center ${
                    fabric === f.id
                      ? 'border-slate-900 bg-slate-100/80 ring-2 ring-slate-900/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{isBn ? f.name : f.id}</p>
                    <p className="text-[11px] text-slate-500">{f.desc}</p>
                  </div>
                  {f.extra > 0 && (
                    <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      +{formatPrice(f.extra, currency)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Base Color */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Palette className="w-4 h-4 text-slate-800" />
              <span>৩. কাপড়ের রং নির্বাচন (Fabric Color)</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {colors.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => setBaseColor(col)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    baseColor.name === col.name
                      ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/30'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    style={{ backgroundColor: col.hex }}
                    className={`w-6 h-6 rounded-full border shadow-xs ${col.border}`}
                  />
                  <span className="text-[10px] font-bold text-slate-700 text-center truncate max-w-full">
                    {col.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Embroidery Pattern */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>৪. বর্ডার সেলাই ও নকশা (Embroidery Trim)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {embroideryPatterns.map((pat) => (
                <button
                  key={pat.id}
                  onClick={() => setEmbroideryPattern(pat.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition flex justify-between items-center ${
                    embroideryPattern === pat.id
                      ? 'border-slate-900 bg-slate-100/80 ring-2 ring-slate-900/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <p className="font-bold text-xs text-slate-900">{isBn ? pat.name : pat.id}</p>
                    <p className="text-[11px] text-slate-500">{pat.desc}</p>
                  </div>
                  {pat.extra > 0 && (
                    <span className="text-[11px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      +{formatPrice(pat.extra, currency)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Crown Height */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Ruler className="w-4 h-4 text-slate-800" />
              <span>৫. ক্রাউনের উচ্চতা (Crown Height)</span>
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {heights.map((h, idx) => (
                <button
                  key={idx}
                  onClick={() => setCrownHeight(h)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition ${
                    crownHeight === h
                      ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* Step 6: Custom Stitched Name Text */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600" />
                <span>৬. নিজের নাম / ক্যালিগ্রাফি সেলাই (Optional)</span>
              </h3>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                +{formatPrice(150, currency)}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isBn
                ? 'টুপির পাশে নিজের নাম, মাদরাসা বা মসজিদের নাম সেলাই করাতে চান? নিচে লিখুন:'
                : 'Stitch your custom name, organization name, or calligraphy onto the cap rim:'}
            </p>
            <input
              type="text"
              maxLength={25}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder={isBn ? 'উদাহরণ: মোঃ আব্দুল্লাহ / Al-Huda Madrasa' : 'e.g. Mohammad / Al Huda Madrasa'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-slate-900 focus:bg-white"
            />
          </div>

          {/* Step 7: Size Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Ruler className="w-4 h-4 text-slate-800" />
                <span>৭. মাথার সাইজ (Head Size)</span>
              </h3>
              <button
                onClick={onOpenSizeGuide}
                className="text-amber-600 hover:text-amber-800 text-xs font-bold"
              >
                {isBn ? 'সাইজ মাপার নিয়ম' : 'How to measure?'}
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {sizesList.map((sz, idx) => (
                <button
                  key={idx}
                  onClick={() => setSize(sz)}
                  className={`py-2 px-2 rounded-lg text-xs font-bold border text-center transition ${
                    size === sz
                      ? 'bg-slate-950 text-amber-300 border-slate-950 shadow-xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 pt-4 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-700">{isBn ? 'অর্ডারের পরিমাণ:' : 'Quantity:'}</span>
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                -
              </button>
              <span className="px-5 py-1.5 text-sm font-bold text-slate-800">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
              >
                +
              </button>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
