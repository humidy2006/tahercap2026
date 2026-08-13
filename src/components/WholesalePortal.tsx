import React, { useState } from 'react';
import { PackageCheck, Truck, ShieldCheck, Send, CheckCircle2, PhoneCall, Building2, Calculator, MessageSquare } from 'lucide-react';
import { Language, Currency } from '../types';
import { COMPANY_DETAILS } from '../data/company';
import { formatPrice } from '../utils/currency';

interface WholesalePortalProps {
  language: Language;
  currency: Currency;
}

export const WholesalePortal: React.FC<WholesalePortalProps> = ({ language, currency }) => {
  const isBn = language === 'bn';

  // Wholesale calculator state
  const [estimateQty, setEstimateQty] = useState<number>(200);
  const [selectedTupiType, setSelectedTupiType] = useState<string>('Omani Zari Stitch Tupi');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    country: 'Bangladesh',
    estimatedQuantity: '200',
    tupiType: 'Omani Zari Stitch Tupi',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Discount tier calculation
  const getTierDiscount = (qty: number) => {
    if (qty >= 2000) return 45;
    if (qty >= 500) return 35;
    if (qty >= 100) return 25;
    if (qty >= 50) return 15;
    return 0;
  };

  const discountPercent = getTierDiscount(estimateQty);
  const standardUnitPrice = 650; // BDT
  const wholesaleUnitPrice = standardUnitPrice * (1 - discountPercent / 100);
  const estimatedTotal = wholesaleUnitPrice * estimateQty;

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message);
        setFormData({
          name: '',
          companyName: '',
          phone: '',
          email: '',
          country: 'Bangladesh',
          estimatedQuantity: '200',
          tupiType: 'Omani Zari Stitch Tupi',
          notes: ''
        });
      }
    } catch (err) {
      console.error(err);
      setSuccessMsg(
        isBn
          ? 'আপনার ইনকোয়ারি সফলভাবে জমা হয়েছে। আমাদের সেলস টিম শীঘ্রই আপনার সাথে সরাসরি যোগাযোগ করবে।'
          : 'Inquiry submitted successfully! Our export manager will contact you shortly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Hero Wholesale Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white rounded-3xl p-8 md:p-12 shadow-xl border border-amber-400/30 relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <PackageCheck className="w-4 h-4" />
              <span>{isBn ? 'কারখানা সরাসরি পাইকারি ও রফতানি পোর্টাল' : 'Direct Factory Wholesale & Export Portal'}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-serif text-white">
              {isBn
                ? 'ডিলার, শোরুম ও আন্তর্জাতিক পাইকারি ক্রেতাদের জন্য বিশেষ রেট'
                : 'Bulk Wholesale & Overseas Export Solutions'}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed max-w-2xl">
              {isBn
                ? 'আল তাহের ক্যাপ গার্মেন্টসের নিজস্ব কেরানীগঞ্জ কারখানায় রয়েছে মাসে ৭৫,০০০+ টুপি প্রস্তুতের সক্ষমতা। পাইকারি ডিলার, মাদরাসা কমিটি, ঈদ ও হজ্ব এজেন্সি এবং আন্তর্জাতিক ইম্পোর্টারদের জন্য আমরা সবচেয়ে সাশ্রয়ী মূল্যে টুপি সরবরাহ করি।'
                : 'Al Taher Cap Garments produces over 75,000 prayer caps monthly. Partner with us for competitive factory pricing, custom branding, and reliable global shipping.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-amber-300 pt-2">
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                {isBn ? 'সর্বনিম্ন ৫০ পিস (MOQ 50 Pcs)' : 'MOQ 50 Pieces'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                {isBn ? 'কাস্টম ব্র্যান্ডিং ও পলি প্যাকিং' : 'Custom Branding & Poly Bagging'}
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                {isBn ? 'সৌদি, ইউএই ও ইউকে রফতানি সুবিধা' : 'Air/Sea Cargo Export Worldwide'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-900/80 backdrop-blur-xs p-6 rounded-2xl border border-amber-400/30 text-center space-y-3">
            <Building2 className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-bold font-serif text-amber-200 text-base">
              {isBn ? 'সরাসরি হেড অব সেলস:' : 'Direct Factory Sales Helpline:'}
            </h3>
            <p className="text-lg font-black text-white">{COMPANY_DETAILS.phone}</p>
            <p className="text-xs text-slate-300">{COMPANY_DETAILS.salesEmail}</p>
            <a
              href={`https://wa.me/${COMPANY_DETAILS.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{isBn ? 'হোয়াটসঅ্যাপে ক্যাটালগ ও মূল্যসূচি পান' : 'WhatsApp Wholesale Manager'}</span>
            </a>
          </div>

        </div>
      </div>

      {/* Tiered Discount Table & Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Instant Wholesale Calculator */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold font-serif text-slate-900 text-base flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              <span>{isBn ? 'ইনস্ট্যান্ট পাইকারি রেট ক্যলকুলেটর' : 'Wholesale Price Estimator'}</span>
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'টুপির ক্যাটালগ টাইপ:' : 'Select Cap Design Series:'}
              </label>
              <select
                value={selectedTupiType}
                onChange={(e) => setSelectedTupiType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800"
              >
                <option value="Omani Zari Stitch Tupi">Omani & Zari Stitch Series</option>
                <option value="Royal Velvet Imperial Cap">Royal Velvet Imperial Cap</option>
                <option value="100% Cotton Net Daily Cap">100% Organic Cotton Net Cap</option>
                <option value="Hand Embroidered Nakshi Tupi">Hand Embroidered Nakshi Series</option>
                <option value="Turkish Cut Crown Cap">Turkish Cut Crown Cap</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                <span>{isBn ? 'অর্ডারের মোট পিস (MOQ 50+):' : 'Estimated Quantity (Pcs):'}</span>
                <span className="text-slate-950 font-extrabold text-sm">{estimateQty} Pcs</span>
              </div>
              <input
                type="range"
                min={50}
                max={3000}
                step={50}
                value={estimateQty}
                onChange={(e) => setEstimateQty(Number(e.target.value))}
                className="w-full accent-slate-900 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-semibold text-slate-400 mt-1">
                <span>50 Pcs</span>
                <span>500 Pcs</span>
                <span>1500 Pcs</span>
                <span>3000+ Pcs</span>
              </div>
            </div>

            {/* Calculated Breakdown */}
            <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">{isBn ? 'পাইকারি ছাড় (Tier Discount):' : 'Wholesale Discount:'}</span>
                <span className="font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                  {discountPercent}% OFF
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">{isBn ? 'প্রতি পিস পাইকারি দাম:' : 'Wholesale Price / Pc:'}</span>
                <span className="font-bold text-slate-950">{formatPrice(wholesaleUnitPrice, currency)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black">
                <span className="text-slate-950">{isBn ? 'সর্বমোট আনুমানিক মূল্য:' : 'Estimated Total:'}</span>
                <span className="text-slate-950 font-serif">{formatPrice(estimatedTotal, currency)}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              {isBn
                ? '* সুনির্দিষ্ট প্যাকিং, রফতানি শিপিং ও কাস্টম লোগো প্রিন্টিং এর জন্য নিচে আপনার তথ্য লিখে ইনকোয়ারি পাঠাতেন।'
                : '* Final pricing may vary based on exact custom embroidery specifications and freight destinations.'}
            </p>
          </div>
        </div>

        {/* Wholesale Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold font-serif text-slate-900 text-lg flex items-center gap-2">
              <Send className="w-5 h-5 text-slate-900" />
              <span>{isBn ? 'পাইকারি ও রফতানি কোটেশন ফর্ম' : 'Official Wholesale & Export Request Form'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {isBn ? 'নিচের ফর্মটি পূরণ করুন, আমাদের সেলস অফিসার ২ ঘণ্টার মধ্যে সরাসরি যোগাযোগ করবেন।' : 'Submit your business inquiry for customized pricing quotes and free fabric sample swatches.'}
            </p>
          </div>

          {successMsg ? (
            <div className="bg-slate-100 border border-slate-300 text-slate-950 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-slate-800 mx-auto" />
              <h4 className="font-bold text-lg">{isBn ? 'ইনকোয়ারি গৃহীত হয়েছে!' : 'Inquiry Received Successfully!'}</h4>
              <p className="text-xs leading-relaxed max-w-md mx-auto">{successMsg}</p>
              <button
                onClick={() => setSuccessMsg('')}
                className="bg-slate-950 text-amber-300 font-bold text-xs px-4 py-2 rounded-lg"
              >
                {isBn ? 'নতুন ইনকোয়ারি পাঠান' : 'Submit Another Inquiry'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitInquiry} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'আপনার নাম *' : 'Your Name *'}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isBn ? 'মোঃ সাব্বির হোসেন' : 'e.g. John Smith'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'কোম্পানি / দোকানের নাম' : 'Company / Store Name'}</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder={isBn ? 'তাহের টুপি হাউজ / আল হুদা এন্টারপ্রাইজ' : 'e.g. Al Taher Traders'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল / হোয়াটসঅ্যাপ নম্বর *' : 'Mobile / WhatsApp Number *'}</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+880 1711000000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'দেশ / কান্ট্রি' : 'Country'}</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Saudi Arabia">Saudi Arabia (KSA)</option>
                    <option value="United Arab Emirates">UAE (Dubai)</option>
                    <option value="United Kingdom">United Kingdom (UK)</option>
                    <option value="United States">United States (USA)</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Other">Other Country</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'আনুমানিক পিস' : 'Estimated Quantity'}</label>
                  <input
                    type="number"
                    min="50"
                    value={formData.estimatedQuantity}
                    onChange={(e) => setFormData({ ...formData, estimatedQuantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'পছন্দের ক্যাটাগরি' : 'Cap Category'}</label>
                  <select
                    value={formData.tupiType}
                    onChange={(e) => setFormData({ ...formData, tupiType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  >
                    <option value="Omani Zari Stitch Tupi">Omani & Zari</option>
                    <option value="Royal Velvet Imperial Cap">Royal Velvet</option>
                    <option value="100% Cotton Net Cap">Cotton Net</option>
                    <option value="Nakshi Hand Embroidery">Nakshi Hand Stitch</option>
                    <option value="Turkish & Pakistani Cut">Turkish & Pakistani</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{isBn ? 'অতিরিক্ত বার্তা বা কাস্টম ব্র্যান্ডিং নোট' : 'Special Requirements & Branding Notes'}</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isBn ? 'যেমন: আমাদের শোরুমের লোগো পলি ব্যাগে প্রিন্ট করতে হবে...' : 'e.g. Need individual polybags with custom barcode tags...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-slate-900"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-950 hover:bg-black text-amber-300 font-bold py-3.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <span>{isBn ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-400" />
                    <span>{isBn ? 'পাইকারি কোটেশন পাঠান' : 'Submit Wholesale Inquiry'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>

    </section>
  );
};
