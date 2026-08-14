import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, CreditCard, Banknote, Smartphone, Truck, FileText } from 'lucide-react';
import { CartItem, Language, Currency, Order, User } from '../types';
import { formatPrice } from '../utils/currency';
import { db, doc, setDoc } from '../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  language: Language;
  currency: Currency;
  onOrderCompleted: (order: Order) => void;
  currentUser?: User | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  language,
  currency,
  onOrderCompleted,
  currentUser
}) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Cash on Delivery (COD)');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && currentUser.name !== 'Customer') {
        setCustomerName(currentUser.name);
      }
      if (currentUser.emailOrPhone.includes('@')) {
        setEmail(currentUser.emailOrPhone);
      } else {
        setPhone(currentUser.emailOrPhone);
      }
    }
  }, [currentUser]);

  const subtotal = cartItems.reduce((sum, item) => {
    const itemUnitPrice = item.isCustomItem && item.customDetails
      ? item.customDetails.unitPrice
      : item.product.price;
    return sum + itemUnitPrice * item.quantity;
  }, 0);

  const shippingFee = subtotal >= 1500 ? 0 : city.toLowerCase() === 'dhaka' ? 80 : 130;
  const grandTotal = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone || !address) return;

    setLoading(true);

    try {
      const orderId = 'ATG-ORD-' + Math.floor(100000 + Math.random() * 900000);
      const orderPayload: Order = {
        id: orderId,
        date: new Date().toLocaleDateString('en-GB'),
        customerName,
        phone,
        email,
        address,
        city,
        district,
        country: 'Bangladesh',
        items: cartItems,
        subtotal,
        shippingFee,
        total: grandTotal,
        currency,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
        orderStatus: 'Processing',
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
      };

      // 1) Write directly to Cloud Firestore
      await setDoc(doc(db, 'orders', orderId), orderPayload)
        .catch(err => console.error('Firestore order save error:', err));

      // 2) Write to Express backend
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (data.success && data.order) {
        onOrderCompleted(data.order);
      } else {
        onOrderCompleted(orderPayload);
      }
    } catch (err) {
      console.error(err);
      const localOrder: Order = {
        id: 'ATG-ORD-' + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString('en-GB'),
        customerName,
        phone,
        email,
        address,
        city,
        district,
        country: 'Bangladesh',
        items: cartItems,
        subtotal,
        shippingFee,
        total: grandTotal,
        currency,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery (COD)' ? 'Pending' : 'Paid',
        orderStatus: 'Processing',
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
      };
      onOrderCompleted(localOrder);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
            <div>
              <h3 className="font-bold font-serif text-slate-900 text-lg">
                {isBn ? 'নিরাপদ চেকআউট ও অর্ডার কনফার্মেশন' : 'Secure Checkout & Delivery Address'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isBn ? 'আল তাহের ক্যাপ গার্মেন্টস ডাইরেক্ট হোম ডেলিভারি' : 'Direct factory dispatch from Dhaka Keraniganj'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="space-y-6">
          
          {/* Section 1: Customer Contact & Delivery Address */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Truck className="w-4 h-4 text-amber-600" />
              <span>১. ডেলিভারির তথ্য (Shipping Info)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isBn ? 'মোঃ সাব্বির আহমেদ' : 'e.g. Mohammad Rahim'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'মোবাইল নম্বর *' : 'Mobile Number *'}</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1711000000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'সম্পূর্ণ ঠিকানা (বাসা/রোড/থানা) *' : 'Full Delivery Address *'}</label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isBn ? 'হাউজ #১২, রোড #০৫, ব্লক-বি, মিরপুর, ঢাকা' : 'House #12, Road #05, Dhanmondi, Dhaka'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'জেলা/সিটি' : 'City'}</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  <option value="Dhaka">Dhaka (ঢাকা)</option>
                  <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                  <option value="Sylhet">Sylhet (সিলেট)</option>
                  <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                  <option value="Khulna">Khulna (খুলনা)</option>
                  <option value="Barisal">Barisal (বরিশাল)</option>
                  <option value="Rangpur">Rangpur (রংপুর)</option>
                  <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">{isBn ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <CreditCard className="w-4 h-4 text-slate-900" />
              <span>২. পেমেন্ট পদ্ধতি (Payment Method)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery (COD)')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'Cash on Delivery (COD)'
                    ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-slate-900" />
                <div>
                  <p className="text-xs text-slate-900">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</p>
                  <p className="text-[10px] text-slate-500">{isBn ? 'পণ্য বুঝে পেয়ে টাকা দিন' : 'Pay when received'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bKash / Nagad / Rocket')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'bKash / Nagad / Rocket'
                    ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-5 h-5 text-rose-600" />
                <div>
                  <p className="text-xs text-slate-900">bKash / Nagad</p>
                  <p className="text-[10px] text-slate-500">{isBn ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking'}</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Credit / Debit Card')}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                  paymentMethod === 'Credit / Debit Card'
                    ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/20 font-bold'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs text-slate-900">Card Payment</p>
                  <p className="text-[10px] text-slate-500">{isBn ? 'কার্ড ও অনলাইন' : 'Visa / MasterCard'}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Summary & Order Submit */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
              <span className="font-bold text-slate-900">{formatPrice(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
              <span className="font-bold text-slate-900">
                {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, currency)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 text-slate-950">
              <span>{isBn ? 'সর্বমোট মূল্য:' : 'Grand Total:'}</span>
              <span className="font-serif text-lg text-slate-950">{formatPrice(grandTotal, currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-950 hover:bg-black text-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>{isBn ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...'}</span>
            ) : (
              <>
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{isBn ? 'অর্ডার সম্পূর্ণ করুন (Confirm Order)' : 'Complete & Generate Order Invoice'}</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
