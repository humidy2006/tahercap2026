import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Download, ShoppingBag, Factory } from 'lucide-react';
import { Order, Language, Currency } from '../types';
import { COMPANY_DETAILS } from '../data/company';
import { formatPrice } from '../utils/currency';

interface InvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose, language }) => {
  if (!isOpen || !order) return null;

  const isBn = language === 'bn';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 relative my-8 print:shadow-none print:border-none print:w-full print:m-0 print:p-0">
        
        {/* Header Action Controls (Hidden on Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-slate-800" />
            <span>{isBn ? 'অর্ডার সফলভাবে সম্পন্ন হয়েছে!' : 'Order Placed Successfully!'}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-slate-950 hover:bg-black text-amber-300 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>{isBn ? 'প্রিন্ট ইনভয়েস' : 'Print Invoice'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Sheet */}
        <div className="space-y-6 p-4 border border-slate-200 rounded-xl bg-slate-50/50 print:bg-white print:border-none print:p-0">
          
          {/* Invoice Company Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-slate-950 rounded-lg flex items-center justify-center text-amber-400 font-black font-serif text-sm">
                  T
                </div>
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  {COMPANY_DETAILS.name}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                {COMPANY_DETAILS.address}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                TRAD: {COMPANY_DETAILS.tradeLicense} • Phone: {COMPANY_DETAILS.phone}
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="bg-slate-950 text-amber-300 font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                OFFICIAL INVOICE
              </span>
              <p className="text-sm font-black font-mono text-slate-800">{order.id}</p>
              <p className="text-xs text-slate-500">Date: {order.date}</p>
            </div>
          </div>

          {/* Customer & Order Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-white p-3 rounded-lg border border-slate-200">
            <div>
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1">Billed To (গ্রাহকের তথ্য):</span>
              <p className="font-bold text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 font-mono">{order.phone}</p>
              <p className="text-slate-600">{order.address}, {order.city}</p>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1">Payment & Shipping:</span>
              <p className="font-semibold text-slate-900">Method: {order.paymentMethod}</p>
              <p className="text-slate-600">Status: <span className="font-bold text-amber-700">{order.paymentStatus}</span></p>
              <p className="text-slate-500 text-[10px] font-mono mt-1">Txn ID: {order.transactionId}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Item Description</th>
                  <th className="p-2.5">Size / Color</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => {
                  const itemUnitPrice = item.isCustomItem && item.customDetails
                    ? item.customDetails.unitPrice
                    : item.product.price;
                  return (
                    <tr key={idx}>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {isBn ? item.product.titleBn : item.product.title}
                        {item.isCustomItem && (
                          <span className="block text-[10px] text-amber-700 font-normal">Custom Tailored Cap Specs</span>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px]">
                        {item.selectedSize} / {item.selectedColor.name}
                      </td>
                      <td className="p-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="p-2.5 text-right font-bold text-slate-950 font-serif">
                        {formatPrice(itemUnitPrice * item.quantity, order.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-between items-center pt-2 text-xs">
            <div className="text-[11px] text-slate-500 space-y-1">
              <p className="font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
                <span>Thank you for shopping at Al Taher Cap Garments!</span>
              </p>
              <p>For order queries or wholesale orders call: {COMPANY_DETAILS.phone}</p>
            </div>

            <div className="space-y-1 text-right min-w-[160px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery:</span>
                <span className="font-semibold">
                  {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee, order.currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-slate-200 text-slate-950">
                <span>Total Amount:</span>
                <span className="font-serif text-base text-slate-950">{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Close Button */}
        <div className="pt-2 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="bg-slate-950 hover:bg-black text-white font-bold text-xs px-6 py-2.5 rounded-xl transition"
          >
            {isBn ? 'বন্ধ করুন ও কেনাকাটা চালিয়ে যান' : 'Close & Continue Shopping'}
          </button>
        </div>

      </div>
    </div>
  );
};
