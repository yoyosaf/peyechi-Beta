import React, { useState } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, HeartHandshake, Eye, CheckCircle2 } from 'lucide-react';
import { LostFoundItem } from '../lib/apiClient';
import { BANGLADESH_DIVISIONS, ITEM_CATEGORIES } from '../data/bangladeshData';
import { ItemCard } from '../components/ItemCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { AntiScamNotice } from '../components/AntiScamNotice';
import { useLanguage } from '../context/LanguageContext';

interface HomePageProps {
  items: LostFoundItem[];
  onSelectItem: (item: LostFoundItem) => void;
  onNavigate: (tab: string, filterParams?: Record<string, string>) => void;
  onOpenReport: (type?: 'lost' | 'found') => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  items,
  onSelectItem,
  onNavigate,
  onOpenReport
}) => {
  const { language, t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('explore', {
      query: searchQuery,
      division: selectedDivision,
      category: selectedCategory
    });
  };

  const recentLost = items.filter((i) => i.type === 'lost' && i.status === 'active').slice(0, 4);
  const recentFound = items.filter((i) => i.type === 'found' && i.status === 'active').slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-900 text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 rounded-b-3xl shadow-lg">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>{t('tagline')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white text-balance leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto text-balance leading-relaxed">
            {t('heroSubtitle')}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenReport('lost')}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all cursor-pointer"
            >
              {t('iLostSomething')}
            </button>
            <button
              onClick={() => onOpenReport('found')}
              className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
            >
              {t('iFoundSomething')}
            </button>
          </div>

          {/* Unified Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 p-2 bg-white rounded-2xl shadow-xl flex flex-col md:flex-row items-stretch gap-2 text-slate-800"
          >
            {/* Keyword Input */}
            <div className="flex-1 flex items-center gap-2 px-3 py-2">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full text-xs sm:text-sm focus:outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Division dropdown */}
            <div className="w-full md:w-44 flex items-center gap-1.5 px-3 py-2 border-t md:border-t-0 md:border-l border-slate-200">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-700 cursor-pointer"
              >
                <option value="">{t('allDivisions')}</option>
                {BANGLADESH_DIVISIONS.map((div) => (
                  <option key={div.name} value={div.name}>
                    {language === 'bn' ? div.nameBn : div.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category dropdown */}
            <div className="w-full md:w-48 flex items-center gap-1.5 px-3 py-2 border-t md:border-t-0 md:border-l border-slate-200">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-700 cursor-pointer"
              >
                <option value="">{t('allCategories')}</option>
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <span>{t('searchButton')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Anti-Scam Banner */}
        <AntiScamNotice onLearnMore={() => onNavigate('safety')} />

        {/* Quick Categories Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {t('quickCategories')}
              </h2>
              <p className="text-xs text-slate-500">
                Select a category to view matched lost and found listings across Bangladesh
              </p>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {ITEM_CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat.id && i.status === 'active').length;
              return (
                <button
                  key={cat.id}
                  onClick={() => onNavigate('explore', { category: cat.id })}
                  className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all text-center group cursor-pointer"
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors mb-2">
                    <CategoryIcon categoryId={cat.id} className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-slate-900 line-clamp-1 group-hover:text-emerald-700">
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 tabular-nums">
                    {count} {language === 'bn' ? 'টি' : 'items'}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent Found Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {language === 'bn' ? 'সম্প্রতি প্রাপ্ত জিনিসপত্র' : 'Recently Found Belongings'}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('explore', { type: 'found' })}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'Explore All Found'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentFound.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onSelectItem} />
            ))}
          </div>
        </section>

        {/* Recent Lost Items */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {language === 'bn' ? 'সম্প্রতি হারানো জিনিসপত্র' : 'Recently Lost Items (Help Find)'}
              </h2>
            </div>
            <button
              onClick={() => onNavigate('explore', { type: 'lost' })}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'bn' ? 'সবগুলো দেখুন' : 'Explore All Lost'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentLost.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onSelectItem} />
            ))}
          </div>
        </section>

        {/* How It Works Safely (Mechanism to Outcome) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('howItWorksTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Engineered with verification safeguards to stop fraud, extortion, and fake claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {t('step1Title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step1Desc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {t('step2Title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step2Desc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {t('step3Title')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('step3Desc')}
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
