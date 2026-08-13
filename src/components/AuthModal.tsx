import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, ShieldCheck, LogOut, CheckCircle, AlertCircle, X, KeyRound, Sparkles } from 'lucide-react';
import { User, Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
  language: Language;
  initialMode?: 'login' | 'signup' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  language,
  initialMode = 'login'
}) => {
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(initialMode === 'admin' ? 'admin' : 'customer');
  const [isRegistering, setIsRegistering] = useState(initialMode === 'signup');
  
  // Form fields
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const ADMIN_EMAIL = 'abdullahhumidy@gmail.com';

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const input = emailOrPhone.trim();
    if (!input) {
      setErrorMessage(isBn ? 'দয়া করে আপনার ইমেইল বা মোবাইল নম্বর দিন' : 'Please enter your email or phone number');
      return;
    }

    if (password.length < 4) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড অথবা পিন কমপক্ষে ৪ অক্ষরের হতে হবে' : 'Password or PIN must be at least 4 characters');
      return;
    }

    // Check if user is trying to log in as admin from customer tab
    const isAdminEmail = input.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const loggedUser: User = {
      id: 'usr_' + Date.now(),
      name: name.trim() || (input.includes('@') ? input.split('@')[0] : 'Customer'),
      emailOrPhone: input,
      role: isAdminEmail ? 'admin' : 'customer',
      loginMethod: input.includes('@') ? 'email' : 'phone'
    };

    onLogin(loggedUser);
    setSuccessMessage(
      isAdminEmail
        ? (isBn ? 'অ্যাডমিন হিসেবে সফলভাবে লগইন হয়েছেন!' : 'Logged in as Admin successfully!')
        : (isBn ? 'সফলভাবে লগইন হয়েছে!' : 'Logged in successfully!')
    );

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const input = emailOrPhone.trim().toLowerCase();

    if (input !== ADMIN_EMAIL.toLowerCase()) {
      setErrorMessage(
        isBn
          ? `অ্যাক্সেস সংরক্ষিত! শুধুমাত্র '${ADMIN_EMAIL}' ইমেইল এডমিন হিসেবে লগইন করতে পারবে।`
          : `Access Restricted! Only '${ADMIN_EMAIL}' is authorized for Admin login.`
      );
      return;
    }

    if (!adminPassword || adminPassword.length < 4) {
      setErrorMessage(isBn ? 'সঠিক এডমিন পাসওয়ার্ড প্রদান করুন' : 'Please enter valid admin password');
      return;
    }

    const adminUser: User = {
      id: 'admin_' + Date.now(),
      name: 'Abdullah (Admin)',
      emailOrPhone: ADMIN_EMAIL,
      role: 'admin',
      loginMethod: 'email'
    };

    onLogin(adminUser);
    setSuccessMessage(isBn ? 'অ্যাডমিন এক্সেস অনুমোদিত!' : 'Admin Access Granted!');

    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 relative overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400 text-slate-950 rounded-xl flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold font-serif text-amber-200 text-base">
                {currentUser ? (isBn ? 'মাই একাউন্ট প্রোফাইল' : 'My Account Profile') : (isBn ? 'লগইন এবং একাউন্ট' : 'User Account & Portal')}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentUser
                  ? (currentUser.role === 'admin' ? (isBn ? 'অ্যাডমিন স্ট্যাটাস সক্রিয়' : 'System Administrator') : (isBn ? 'গ্রাহক অ্যাকাউন্ট' : 'Verified Customer'))
                  : (isBn ? 'গ্রাহক বা অ্যাডমিন অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in as Customer or System Admin')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LOGGED IN USER VIEW */}
        {currentUser ? (
          <div className="p-6 space-y-5 bg-slate-50">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 text-amber-400 rounded-full flex items-center justify-center font-bold text-lg font-serif">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-950 text-sm truncate">{currentUser.name}</h4>
                  {currentUser.role === 'admin' && (
                    <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 truncate font-mono mt-0.5">{currentUser.emailOrPhone}</p>
              </div>
            </div>

            {currentUser.role === 'admin' ? (
              <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-xs space-y-1">
                <p className="font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{isBn ? 'এডমিন প্রিভিলেজ সক্রিয়' : 'Admin Privileges Active'}</span>
                </p>
                <p className="text-amber-900 text-[11px]">
                  {isBn 
                    ? `আপনি একমাত্র অফিশিয়াল অ্যাডমিন '${ADMIN_EMAIL}' হিসেবে লগইন করা আছেন। পণ্য যোগ ও দাম আপডেট করতে পারবেন।`
                    : `You are logged in as official admin '${ADMIN_EMAIL}'. You have full catalog & price editing authorization.`}
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900">
                <p className="font-bold">{isBn ? 'গ্রাহক প্যানেলে স্বাগতম' : 'Welcome to Customer Portal'}</p>
                <p className="text-[11px] mt-0.5 text-blue-800">
                  {isBn ? 'আপনার অর্ডারের হিস্ট্রি এবং এড্রেস অটো-ফিল সুবিধা এখন সক্রিয়।' : 'Your email/phone will automatically populate during checkout and inquiries.'}
                </p>
              </div>
            )}

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>{isBn ? 'লগআউট করুন' : 'Log Out Account'}</span>
            </button>
          </div>
        ) : (
          /* NOT LOGGED IN - FORM VIEW */
          <div className="p-5 space-y-4">

            {/* Role Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('customer');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'customer' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-amber-600" />
                <span>{isBn ? 'গ্রাহক প্রবেশ (Customer)' : 'Customer Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('admin');
                  setEmailOrPhone(ADMIN_EMAIL);
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin' ? 'bg-slate-950 text-amber-300 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>{isBn ? 'অ্যাডমিন লগইন' : 'Admin Login'}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs p-3 rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* TAB 1: CUSTOMER LOGIN / SIGNUP */}
            {activeTab === 'customer' && (
              <form onSubmit={handleCustomerSubmit} className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">
                      {isBn ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email Address or Mobile Number'} *
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={isBn ? 'যেমন: 01700000000 অথবা user@gmail.com' : 'e.g. 01700000000 or customer@gmail.com'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                {isRegistering && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {isBn ? 'আপনার পূর্ণ নাম' : 'Your Full Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Al-Amin Hossain"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                      />
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isBn ? 'পাসওয়ার্ড বা পিন কোড' : 'Password or PIN Code'} *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-950 hover:bg-black text-amber-300 font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {isRegistering
                      ? (isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Customer Account')
                      : (isBn ? 'লগইন করুন' : 'Sign In')}
                  </span>
                </button>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-xs text-slate-600 hover:text-slate-950 font-semibold underline"
                  >
                    {isRegistering
                      ? (isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign In')
                      : (isBn ? 'নতুন অ্যাকাউন্ট তৈরি করতে চান? সাইনআপ করুন' : 'New here? Create an Account')}
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: ADMIN LOGIN (STRICTLY FOR ABDULLAHHUMIDY@GMAIL.COM) */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-3.5 text-xs bg-slate-900 text-white p-4 rounded-xl border border-slate-800">
                <div className="bg-amber-400/10 border border-amber-400/30 p-2.5 rounded-lg text-amber-300 text-[11px] leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">{isBn ? 'সংরক্ষিত অ্যাডমিন এক্সেস' : 'Protected Administrator Access'}</p>
                    <p className="text-slate-300 mt-0.5">
                      {isBn
                        ? `শুধুমাত্র '${ADMIN_EMAIL}' ইমেইল এডমিন প্যানেলে প্রবেশের অনুমতি পাবে।`
                        : `Admin controls are locked exclusively for '${ADMIN_EMAIL}'.`}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-200 mb-1">
                    {isBn ? 'অ্যাডমিন ইমেইল এড্রেস' : 'Authorized Admin Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder={ADMIN_EMAIL}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 font-mono text-amber-300 focus:border-amber-400 focus:outline-none"
                    />
                    <Mail className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-200 mb-1">
                    {isBn ? 'অ্যাডমিন সিকিউরিটি পাসওয়ার্ড' : 'Admin Security Password'}
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 font-medium text-white focus:border-amber-400 focus:outline-none"
                    />
                    <Lock className="w-4 h-4 text-amber-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isBn ? 'অ্যাডমিন প্যানেলে প্রবেশ করুন' : 'Authenticate Admin Access'}</span>
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
