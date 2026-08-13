import React from 'react';
import { Factory, Award, ShieldCheck, MapPin, Phone, Mail, Globe, Users, CheckCircle, Cpu, Truck, Clock } from 'lucide-react';
import { Language } from '../types';
import { COMPANY_DETAILS } from '../data/company';

interface CompanyShowcaseProps {
  language: Language;
}

export const CompanyShowcase: React.FC<CompanyShowcaseProps> = ({ language }) => {
  const isBn = language === 'bn';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-black text-white rounded-3xl p-8 md:p-12 shadow-xl border border-amber-400/30 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Factory className="w-4 h-4" />
            <span>{isBn ? 'কোম্পানি পরিচিতি ও কারখানা প্রোফাইল' : 'Official Factory & Company Profile'}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-serif text-white leading-tight">
            {isBn ? COMPANY_DETAILS.nameBn : COMPANY_DETAILS.name}
          </h2>

          <p className="text-amber-200 font-medium text-sm md:text-base">
            {isBn ? COMPANY_DETAILS.taglineBn : COMPANY_DETAILS.tagline}
          </p>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {isBn
              ? '২০১২ সালে প্রতিষ্ঠিত আল তাহের ক্যাপ গার্মেন্টস বাংলাদেশে ইসলামিক নামাজের টুপি প্রস্তুত ও রফতানিশিল্পে একটি পথিকৃৎ প্রতিষ্ঠান। সুতি কাপড়ের আরামদায়ক জালি টুপি থেকে শুরু করে ওমানি ও রাজকীয় ভেলভেট বর্ডারের টুপি প্রস্তুত আমাদের বিশেষত্ব।'
              : 'Established in 2012, Al Taher Cap Garments is a pioneering manufacturer and exporter of traditional Islamic prayer caps in Bangladesh. We combine traditional needlework with state-of-the-art Japanese machinery.'}
          </p>
        </div>
      </div>

      {/* Main Factory Visual & About Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Factory Photo Card */}
        <div className="lg:col-span-6 relative">
          <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-900/20 group">
            <img
              src={COMPANY_DETAILS.factoryImage}
              alt="Al Taher Cap Garments Factory Floor"
              className="w-full h-[380px] object-cover group-hover:scale-105 transition duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
              <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                {isBn ? 'ঢাকা কারখানা ভিজিট' : 'DHAKA FACTORY FLOOR'}
              </span>
              <h3 className="text-xl font-bold font-serif text-amber-100">
                {isBn ? 'আধুনিক সেলাই ও কাটিং ওয়ার্কশপ' : 'Modern Tailoring & Embroidery Floor'}
              </h3>
              <p className="text-xs text-slate-300">
                {isBn ? `মাসিক উৎপাদন ক্ষমতা: ${COMPANY_DETAILS.factoryCapacity}` : `Monthly Production: ${COMPANY_DETAILS.factoryCapacity}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Key Stats & Story */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{isBn ? 'আমাদের ইতিহাস' : 'Our Legacy'}</span>
            <h3 className="text-2xl font-bold font-serif text-slate-900">
              {isBn ? '১২ বছরের অভিজ্ঞতা ও কারিগরী উৎকর্ষ' : '12+ Years of Artisanal Quality'}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {isBn
                ? 'প্রতিষ্ঠাতা আলহাজ্ব মোহাম্মদ তাহের উদ্দীনের দূরদর্শী নেতৃত্বে ছোট একটি ওয়ার্কশপ থেকে আজ আল তাহের ক্যাপ গার্মেন্টস কেরানীগঞ্জের অন্যতম বৃহৎ টুপি উৎপাদনকারী কারখানায় রূপ নিয়েছে। ১২০+ এরও বেশি দক্ষ দর্জি ও কারিগরের নিরলস পরিশ্রমে তৈরি প্রতিটি টুপি বহন করে সুন্নাহর মর্যাদা ও আরামদায়ক অভিজ্ঞতা।'
                : 'Under the leadership of Alhajj Mohammad Taher Uddin, Al Taher Cap Garments grew from a modest workshop to an industrial leader employing 120+ skilled artisans and tailors in Keraniganj Industrial Area.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
              <Users className="w-5 h-5 text-slate-800 mb-1" />
              <p className="text-lg font-black text-slate-950">{COMPANY_DETAILS.artisansCount.split(' ')[0]}</p>
              <p className="text-xs text-slate-600">{isBn ? 'অভিজ্ঞ দর্জি ও কারিগর' : 'Skilled Tailors & Artisans'}</p>
            </div>

            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl">
              <Globe className="w-5 h-5 text-slate-800 mb-1" />
              <p className="text-lg font-black text-slate-950">{COMPANY_DETAILS.exportCountries.length}+ {isBn ? 'টি দেশ' : 'Countries'}</p>
              <p className="text-xs text-slate-600">{isBn ? 'রফতানি নেটওয়ার্ক' : 'Global Export Reach'}</p>
            </div>
          </div>
        </div>

      </div>

      {/* 6-Step Manufacturing Process */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">{isBn ? 'প্রোডাকশন ফ্লো' : 'Production Workflow'}</span>
          <h3 className="text-2xl font-bold font-serif text-slate-900">
            {isBn ? '৬ ধাপে টুপি প্রস্তুত করার বৈজ্ঞানিক প্রক্রিয়া' : '6-Step Precision Manufacturing Process'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { step: '01', title: isBn ? 'কাপড় যাচাই' : 'Fabric QC', desc: isBn ? '১০০% সুতি ও মাইক্রো ভেলভেট কাপড়ের টক্সিনমুক্ত পরীক্ষা' : 'Non-toxic, high-density cotton & velvet selection' },
            { step: '02', title: isBn ? 'ক্রাউন কাটিং' : 'Precision Cutting', desc: isBn ? 'লেজার ও কাটিং মেশিনের মাধ্যমে সুনির্দিষ্ট মাপে বডি তৈরি' : 'Accurate inch-wise crown and rim cuts' },
            { step: '03', title: isBn ? 'এমব্রয়ডারি ওয়ার্ক' : 'Embroidery', desc: isBn ? 'জাপানি তাজিমা মেশিনে সোনালী জারি ও সিলভার সূচিকর্ম' : 'Computerized Tajima embroidery & hand stitching' },
            { step: '04', title: isBn ? 'বডি অ্যাসেম্বলি' : 'Assembly', desc: isBn ? 'দ্বিগুণ স্থায়িত্বের জন্য মজবুত ডাবল সেলাই' : 'Reinforced double-stitch rim joining' },
            { step: '05', title: isBn ? 'স্টিম আয়রনিং' : 'Steam Pressing', desc: isBn ? 'উচ্চ তাপমাত্রার স্টিম প্রেসারে শেপ স্থায়ী করা' : 'High-temperature shape molding' },
            { step: '06', title: isBn ? 'পলি প্যাকিং' : 'Export Packing', desc: isBn ? 'বারকোড ও ডাস্টপ্রুফ প্রিমিয়াম পলি প্যাকেজিং' : 'Dustproof polybagging & barcode tagging' }
          ].map((proc, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-2 relative overflow-hidden">
              <span className="text-2xl font-black text-slate-900/20 font-serif absolute top-3 right-4">{proc.step}</span>
              <h4 className="font-bold text-slate-900 text-sm">{proc.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{proc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Company Legal Details & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Certifications */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-serif font-bold text-lg border-b border-slate-800 pb-3">
            <Award className="w-5 h-5" />
            <span>{isBn ? 'কোয়ালিটি সার্টিফিকেট ও স্বীকৃতি' : 'Certifications & Credentials'}</span>
          </div>
          <ul className="space-y-3 text-xs text-slate-300">
            {COMPANY_DETAILS.certifications.map((cert, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Company Legal Registry */}
        <div className="bg-slate-950 text-white rounded-2xl p-6 md:p-8 space-y-4 border border-amber-400/30">
          <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-lg border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5" />
            <span>{isBn ? 'সরকারি রেজিস্ট্রেশন ও লাইসেন্স' : 'Legal & Regulatory Identifiers'}</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-200">
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">{isBn ? 'ট্রেড লাইসেন্স নম্বর:' : 'Trade License No:'}</span>
              <span className="font-bold font-mono text-amber-300">{COMPANY_DETAILS.tradeLicense}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">{isBn ? 'ই-টিআইএন (e-TIN):' : 'e-TIN Number:'}</span>
              <span className="font-bold font-mono text-slate-200">{COMPANY_DETAILS.tinNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-1.5">
              <span className="text-slate-400">{isBn ? 'ভ্যাট বিআইএন (VAT BIN):' : 'VAT BIN Number:'}</span>
              <span className="font-bold font-mono text-slate-200">{COMPANY_DETAILS.binNumber}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-400">{isBn ? 'কারখানা লোকেশন:' : 'Factory Address:'}</span>
              <span className="font-semibold text-slate-300 text-right max-w-[200px]">{isBn ? COMPANY_DETAILS.addressBn : COMPANY_DETAILS.address}</span>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
