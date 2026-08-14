import React, { useState } from 'react';
import { SlidersHorizontal, Search, Sparkles, RefreshCw } from 'lucide-react';
import { Product, Language, Currency } from '../types';
import { ProductCard } from './ProductCard';

interface ProductCatalogProps {
  products: Product[];
  language: Language;
  currency: Currency;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  onCustomize: (product: Product) => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  language,
  currency,
  searchQuery,
  setSearchQuery,
  onQuickView,
  onAddToCart,
  onCustomize
}) => {
  const isBn = language === 'bn';

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('featured');

  // Categories list
  const categories = [
    { id: 'All', name: 'সব টুপি', nameEn: 'All Tupi' },
    { id: 'Omani & Zari Series', name: 'ওমানি ও জারি সিরিজ', nameEn: 'Omani & Zari' },
    { id: 'Royal Velvet', name: 'রয়েল ভেলভেট', nameEn: 'Royal Velvet' },
    { id: 'Daily Comfort', name: 'দৈনন্দিন সুতি জালি', nameEn: 'Daily Cotton' },
    { id: 'Handcrafted Heritage', name: 'হস্তশিল্প নকশী', nameEn: 'Handmade Nakshi' },
    { id: 'Turkish Cut', name: 'তুর্কি কাটিং', nameEn: 'Turkish Cut' },
    { id: "Kid's Collection", name: 'শিশুদের টুপি', nameEn: 'Kid Collection' },
    { id: 'Hajj & Umrah Package', name: 'হজ্ব ও ওমরাহ সেট', nameEn: 'Hajj/Umrah Sets' }
  ];

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // Category match
    const matchCategory = selectedCategory === 'All' || product.category === selectedCategory;

    // Search query match
    const queryLower = searchQuery.toLowerCase().trim();
    const isGeneralCapQuery = 
      queryLower === 'taher' || 
      queryLower === 'taher cap' || 
      queryLower === 'al taher' || 
      queryLower === 'al taher cap' || 
      queryLower === 'namaz topi' || 
      queryLower === 'namaz cap' || 
      queryLower === 'namaz tupi' ||
      queryLower === 'topi' ||
      queryLower === 'tupi' ||
      queryLower === 'cap' ||
      queryLower === 'টুপি' ||
      queryLower === 'নামাজ টুপি' ||
      queryLower === 'তাহের ক্যাপ' ||
      queryLower === 'আল তাহের ক্যাপ';

    const matchSearch =
      !queryLower ||
      isGeneralCapQuery ||
      (product.designNumber && product.designNumber.toLowerCase().includes(queryLower)) ||
      (product.category && product.category.toLowerCase().includes(queryLower)) ||
      (product.categoryBn && product.categoryBn.includes(searchQuery)) ||
      (product.quantity && product.quantity.toLowerCase().includes(queryLower)) ||
      (product.sizes && product.sizes.some(s => s.toLowerCase().includes(queryLower)));

    return matchCategory && matchSearch;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Section Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-md mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isBn ? 'আল তাহের প্রিমিয়াম কালেকশন' : 'Al Taher Signature Collection'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            {isBn ? 'নামাজের টুপি কালেকশন' : 'Explore Namaz Tupi Catalogue'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            {isBn
              ? 'সুনির্দিষ্ট মাপের ওমানি, ভেলভেট, কটন জালি, তুর্কি ও হাতের সেলাই এর নকশী টুপি'
              : 'Precision handcrafted Islamic prayer caps crafted for comfort, aesthetics and durability'}
          </p>
        </div>

        {/* Sorting & Result Counter */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500">
            {isBn ? `মোট ${sortedProducts.length} টি প্রোডাক্ট` : `Showing ${sortedProducts.length} items`}
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-xs"
          >
            <option value="featured">{isBn ? 'জনপ্রিয়তা অনুযায়ী' : 'Featured First'}</option>
            <option value="price-low">{isBn ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
            <option value="price-high">{isBn ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
            <option value="rating">{isBn ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}</option>
          </select>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs flex items-center gap-1.5 ${
                isActive
                  ? 'bg-slate-950 text-amber-300 shadow-md ring-1 ring-amber-400/50'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{isBn ? cat.name : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Search Filter Active Bar */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="font-bold">{isBn ? 'অনুসন্ধান ফিল্টার:' : 'Search Filter:'}</span>
            <span className="bg-amber-200 px-2 py-0.5 rounded font-medium">
              "{searchQuery}"
            </span>
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="flex items-center gap-1 text-rose-700 hover:text-rose-900 font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিসেট' : 'Clear'}</span>
          </button>
        </div>
      )}

      {/* Product Grid */}
      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              language={language}
              currency={currency}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
              onCustomize={onCustomize}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 space-y-4">
          <Search className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">
            {isBn ? 'কোনো টুপি পাওয়া যায়নি' : 'No matching prayer caps found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {isBn
              ? 'আপনার অনুসন্ধান পরিবর্তন করে দেখুন অথবা আমাদের কাস্টম টুপি ডিজাইনারে নিজের পছন্দের নকশায় অর্ডার দিন।'
              : 'Try adjusting your search criteria or create a custom tupi design using our online customizer.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="bg-slate-900 hover:bg-black text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
          >
            {isBn ? 'সকল টুপি পুনরায় দেখুন' : 'Reset Search'}
          </button>
        </div>
      )}

    </section>
  );
};
