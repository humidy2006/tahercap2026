import React from 'react';
import { X, Ruler, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const isBn = language === 'bn';

  const sizeTable = [
    { size: '21.0 Inches', cm: '53.3 cm', label: 'Small (S) / Young Boy', labelBn: 'স্মল / উঠতি বয়সী' },
    { size: '21.5 Inches', cm: '54.6 cm', label: 'Medium (M) - Standard', labelBn: 'মিডিয়াম - সাধারণ' },
    { size: '22.0 Inches', cm: '55.8 cm', label: 'Medium Plus (M+)', labelBn: 'মিডিয়াম প্লাস (সর্বাধিক বিক্রীত)' },
    { size: '22.5 Inches', cm: '57.1 cm', label: 'Large (L) - Popular', labelBn: 'লার্জ - সাধারণ প্রাপ্তবয়স্ক' },
    { size: '23.0 Inches', cm: '58.4 cm', label: 'Extra Large (XL)', labelBn: 'এক্সট্রা লার্জ' },
    { size: '23.5 Inches', cm: '59.7 cm', label: 'Double XL (XXL)', labelBn: 'ডাবল এক্সএল' },
    { size: '24.0 Inches', cm: '61.0 cm', label: 'Triple XL (3XL) Custom', labelBn: 'ট্রিপল এক্সএল কাস্টম' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold font-serif text-slate-900 text-lg">
              {isBn ? 'টুপির সঠিক মাপ বা সাইজ মাপার নির্দেশিকা' : 'Prayer Cap Head Measurement & Size Chart'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-xs">
          <p className="font-bold text-amber-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>{isBn ? 'কিভাবে মাথার মাপ নিবেন?' : 'How to measure your head correctly?'}</span>
          </p>
          <p className="text-amber-900/80 leading-relaxed">
            {isBn
              ? 'একটি ফিতা (Measuring Tape) দিয়ে কপালের ঠিক ১ ইঞ্চি উপরে ও কানের উপর দিয়ে মাথার চারপাশে ঘুরিয়ে ইঞ্চিতে মেপে নিন। আপনার মাথার মাপ যদি ২২.২ ইঞ্চি হয়, তবে ২২.৫ ইঞ্চি সাইজ বেছে নেওয়া সবচেয়ে আরামদায়ক হবে।'
              : 'Wrap a soft measuring tape around your head, positioning it about 1 inch above your eyebrows and ears. If your head measures 22.2 inches, choose size 22.5" for the most comfortable fit.'}
          </p>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-amber-300 font-bold uppercase">
              <tr>
                <th className="p-3">{isBn ? 'সাইজ (ইঞ্চি)' : 'Size (Inches)'}</th>
                <th className="p-3">{isBn ? 'সেন্টিমিটার' : 'Centimeters'}</th>
                <th className="p-3">{isBn ? 'ফিটিং ক্যাটাগরি' : 'Fit Category'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sizeTable.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-950 font-mono">{st.size}</td>
                  <td className="p-3 text-slate-600">{st.cm}</td>
                  <td className="p-3 text-slate-800">{isBn ? st.labelBn : st.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-950 text-white font-bold text-xs py-3 rounded-xl hover:bg-black transition"
        >
          {isBn ? 'বুঝেছি, কেনাকাটায় ফিরে যান' : 'Got it, return to shopping'}
        </button>

      </div>
    </div>
  );
};
