import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Sparkles, 
  Phone, 
  Ruler, 
  Factory, 
  Bot, 
  Menu, 
  X, 
  Search, 
  Globe, 
  ShieldCheck, 
  PackageCheck,
  Settings,
  Scissors,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { Language, Currency, User } from '../types';
import { COMPANY_DETAILS } from '../data/company';
import { CompanyLogo } from './CompanyLogo';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSizeGuide: () => void;
  onOpenAdmin: () => void;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  currency,
  setCurrency,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenSizeGuide,
  onOpenAdmin,
  currentUser,
  onOpenAuthModal,
  searchQuery,
  setSearchQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isBn = language === 'bn';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      {/* Top Banner */}
      <div className="bg-slate-950 text-slate-100 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1 text-amber-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {isBn ? 'এক্সপোর্ট কোয়ালিটি নামাজ ক্যাপ' : 'Export Quality Namaz Cap'}
            </span>
            <span className="hidden md:inline text-slate-600">|</span>
            <a href={`tel:${COMPANY_DETAILS.phone}`} className="hidden md:flex items-center gap-1 hover:text-white transition">
              <Phone className="w-3 h-3 text-amber-300" />
              <span>{isBn ? 'হটলাইন / হোয়াটসঅ্যাপ:' : 'Hotline & Wholesale:'} {COMPANY_DETAILS.phone}</span>
            </a>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            {/* Language Toggle */}
            <div className="flex items-center space-x-1 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
              <Globe className="w-3 h-3 text-slate-400" />
              <button 
                onClick={() => setLanguage('bn')} 
                className={`px-1 rounded ${language === 'bn' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:text-white'}`}
              >
                বাংলা
              </button>
              <span>/</span>
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-1 rounded ${language === 'en' ? 'bg-amber-400 text-slate-950 font-bold' : 'hover:text-white'}`}
              >
                ENG
              </button>
            </div>

            {/* Currency Switcher */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-slate-900 text-amber-200 border border-slate-800 rounded px-1.5 py-0.5 focus:outline-none text-xs font-semibold"
            >
              <option value="BDT">৳ BDT</option>
              <option value="USD">$ USD</option>
              <option value="SAR">﷼ SAR</option>
              <option value="AED">AED</option>
            </select>

            {/* Admin Panel Toggle */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-2.5 py-1 rounded transition text-[11px] shadow-xs"
              title="Factory Admin & Price Manager"
            >
              <Settings className="w-3.5 h-3.5 text-slate-950" />
              <span>{isBn ? 'প্রোডাক্ট ও দাম আপডেট' : 'Price & Product Update'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('shop')} 
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="group-hover:scale-105 transition-transform">
            <CompanyLogo className="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight font-serif flex items-center gap-1.5">
              <span>{isBn ? COMPANY_DETAILS.nameBn : COMPANY_DETAILS.name}</span>
            </h1>
            <p className="text-xs text-slate-600 font-medium hidden sm:block">
              {isBn ? COMPANY_DETAILS.taglineBn : COMPANY_DETAILS.tagline}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'নামাজের টুপি, ওমানি, ভেলভেট বা ক্যালিগ্রাফি খুঁজুন...' : 'Search Omani, Velvet, Cotton or Custom Tupi...'}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* User Profile / Login Button */}
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full font-bold text-xs shadow-xs transition ${
              currentUser
                ? currentUser.role === 'admin'
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-slate-900 text-amber-300 hover:bg-black'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
            title={currentUser ? currentUser.emailOrPhone : 'Login / Register'}
          >
            <UserIcon className="w-4 h-4" />
            <span className="hidden sm:inline truncate max-w-[110px]">
              {currentUser ? currentUser.name : (isBn ? 'লগইন' : 'Login')}
            </span>
            {currentUser && currentUser.role === 'admin' && (
              <span className="bg-slate-950 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                Admin
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 text-slate-700 hover:text-black bg-slate-100 hover:bg-slate-200 rounded-full transition"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-slate-900" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 md:hidden text-slate-700 hover:text-slate-950"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-slate-50 border-t border-slate-200/80 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center space-x-1 font-medium text-sm">
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'shop'
                  ? 'border-slate-900 text-slate-950 font-bold bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'তুপি কালেকশন' : 'Tupi Collection'}</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'customizer'
                  ? 'border-slate-900 text-slate-950 font-bold bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              <Scissors className="w-4 h-4 text-amber-600" />
              <span className="relative">
                {isBn ? 'কাস্টম টুপি ডিজাইন' : 'Custom Tupi Designer'}
                <span className="ml-1 bg-amber-500 text-slate-950 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">NEW</span>
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wholesale')}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'wholesale'
                  ? 'border-slate-900 text-slate-950 font-bold bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              <PackageCheck className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'পাইকারি ও রফতানি' : 'Wholesale & B2B Export'}</span>
            </button>

            <button
              onClick={() => setActiveTab('company')}
              className={`px-4 py-3 border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'company'
                  ? 'border-slate-900 text-slate-950 font-bold bg-white shadow-xs'
                  : 'border-transparent text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
              }`}
            >
              <Factory className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'কোম্পানি ও কারখানা' : 'Company & Factory'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
            <button
              onClick={onOpenSizeGuide}
              className="flex items-center gap-1 text-slate-700 hover:text-slate-950 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs hover:border-slate-400 transition"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'সাইজ নির্দেশিকা (Size Guide)' : 'Size & Fit Guide'}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isBn ? 'টুপি খুঁজুন...' : 'Search Tupi...'}
              className="w-full bg-slate-100 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'shop' ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-700'}`}
            >
              <ShoppingBag className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'তুপি কালেকশন' : 'Tupi Collection'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('customizer'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'customizer' ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-700'}`}
            >
              <Scissors className="w-4 h-4 text-amber-600" />
              <span>{isBn ? 'কাস্টম টুপি ডিজাইন' : 'Custom Tupi Designer'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('wholesale'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'wholesale' ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-700'}`}
            >
              <PackageCheck className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'পাইকারি ও রফতানি' : 'Wholesale & B2B'}</span>
            </button>

            <button
              onClick={() => { setActiveTab('company'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${activeTab === 'company' ? 'bg-slate-100 text-slate-950 font-bold' : 'text-slate-700'}`}
            >
              <Factory className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'কোম্পানি ও কারখানা' : 'Company & Factory'}</span>
            </button>

            <button
              onClick={() => { onOpenSizeGuide(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700"
            >
              <Ruler className="w-4 h-4 text-amber-600" />
              <span>{isBn ? 'সাইজ গাইড' : 'Size Guide'}</span>
            </button>

            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100"
            >
              <Settings className="w-4 h-4 text-slate-800" />
              <span>{isBn ? 'এডমিন ড্যাশবোর্ড' : 'Admin Panel'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
