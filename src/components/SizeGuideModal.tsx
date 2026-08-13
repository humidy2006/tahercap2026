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
    { size: '44 cm', code: 'Size 44', inches: '17.3"', label: 'Kids (2-5 Yrs)', labelBn: 'শিশু (২-৫ বছর)' },
    { size: '46 cm', code: 'Size 46', inches: '18.1"', label: 'Kids (6-10 Yrs)', labelBn: 'শিশু (৬-১০ বছর)' },
    { size: '48 cm', code: 'Size 48', inches: '18.9"', label: 'Small (S) / Young Boy', labelBn: 'সাইজ ৪৮ (উঠতি বয়সি / স্মল)' },
    { size: '50 cm', code: 'Size 50', inches: '19.7"', label: 'Medium (M)', labelBn: 'সাইজ ৫০ (মিডিয়াম)' },
    { size: '52 cm', code: 'Size 52', inches: '20.5"', label: 'Standard (M+)', labelBn: 'সাইজ ৫২ (মিডিয়াম প্লাস - জনপ্রিয়)' },
    { size: '54 cm', code: 'Size 54', inches: '21.3"', label: 'Large (L)', labelBn: 'সাইজ ৫৪ (লার্জ)' },
    { size: '56 cm', code: 'Size 56', inches: '22.0"', label: 'Extra Large (XL)', labelBn: 'সাইজ ৫৬ (এক্সট্রা লার্জ)' },
    { size: '58 cm', code: 'Size 58', inches: '22.8"', label: 'Double XL (2XL)', labelBn: 'সাইজ ৫৮ (ডাবল এক্সএল)' },
    { size: '60 cm', code: 'Size 60', inches: '23.6"', label: 'Triple XL (3XL)', labelBn: 'সাইজ ৬০ (ট্রিপল এক্সএল)' }
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
            <span>{isBn ? 'সেমি (CM) অনুযায়ী টুপি সাইজ চেনার সহজ উপায়' : 'How CM sizing works for caps?'}</span>
          </p>
          <p className="text-amber-900/80 leading-relaxed">
            {isBn
              ? 'আল তাহের গার্মেন্টসে সেন্টিমিটার (cm) হিসেবে টুপির সাইজ নির্ধারিত হয়। যেমন: ৪৮ সেমি (48 cm) মাপ মানে সাইজ ৪৮। একটি ফিতা দিয়ে কপালের ওপর মাথার পরিধি সেমিতে মেপে সঠিক সাইজ অর্ডার করুন।'
              : 'At Al Taher Garments, sizes are measured in centimeters (cm). For instance, a 48 cm head circumference corresponds to Size 48. Measure your head circumference in cm using a soft tape.'}
          </p>
        </div>

        {/* Size Chart Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-amber-300 font-bold uppercase">
              <tr>
                <th className="p-3">{isBn ? 'সাইজ (cm / সেমি)' : 'Size (cm)'}</th>
                <th className="p-3">{isBn ? 'ইঞ্চি সমমান' : 'Inches Equivalent'}</th>
                <th className="p-3">{isBn ? 'ফিটিং ক্যাটাগরি' : 'Fit Category'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {sizeTable.map((st, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-950 font-mono">
                    <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                      {st.size} ({st.code})
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{st.inches}</td>
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
