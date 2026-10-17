import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, PlusCircle, MapPin } from 'lucide-react';
import { LostFoundItem, ItemType } from '../lib/apiClient';
import { BANGLADESH_DIVISIONS, ITEM_CATEGORIES } from '../data/bangladeshData';
import { ItemCard } from '../components/ItemCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { useLanguage } from '../context/LanguageContext';

interface ExplorePageProps {
  items: LostFoundItem[];
  initialFilters?: {
    type?: ItemType | 'all';
    division?: string;
    category?: string;
    query?: string;
  };
  onSelectItem: (item: LostFoundItem) => void;
  onOpenReport: () => void;
}

export const ExplorePage: React.FC<ExplorePageProps> = ({
  items,
  initialFilters,
  onSelectItem,
  onOpenReport
}) => {
  const { language, t } = useLanguage();

  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>(
    (initialFilters?.type as 'all' | 'lost' | 'found') || 'all'
  );
  const [selectedDivision, setSelectedDivision] = useState(initialFilters?.division || '');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialFilters?.category || 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState(initialFilters?.query || '');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'reward'>('newest');

  // Districts for selected division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === selectedDivision);
  const availableDistricts = currentDivisionObj?.districts || [];

  const handleDivisionChange = (divName: string) => {
    setSelectedDivision(divName);
    setSelectedDistrict('');
  };

  const resetFilters = () => {
    setTypeFilter('all');
    setSelectedDivision('');
    setSelectedDistrict('');
    setSelectedCategory('all');
    setStatusFilter('all');
    setSearchQuery('');
    setSortBy('newest');
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      // Division
      if (selectedDivision && item.division !== selectedDivision) return false;
      // District
      if (selectedDistrict && item.district !== selectedDistrict) return false;
      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      // Status
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      // Keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inThana = item.thana.toLowerCase().includes(q);
        const inDistrict = item.district.toLowerCase().includes(q);
        const inArea = item.areaDetails.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inThana && !inDistrict && !inArea) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'reward') {
        return (b.reward || 0) - (a.reward || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      // default newest
      return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
    });
  }, [items, typeFilter, selectedDivision, selectedDistrict, selectedCategory, statusFilter, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('browseItems')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {filteredItems.length} {language === 'bn' ? 'টি আইটেম প্রদর্শিত হচ্ছে' : 'items found in current view'}
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('reportItem')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4 shadow-2xs">
        
        {/* Row 1: Search + Lost/Found Type Buttons + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          
          {/* Keyword search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900"
            />
          </div>

          {/* Type Segmented buttons */}
          <div className="md:col-span-4 flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('filterAll')}
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                typeFilter === 'lost'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              {t('filterLost')}
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center ${
                typeFilter === 'found'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              {t('filterFound')}
            </button>
          </div>

          {/* Sort selector */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'reward')}
              className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="oldest">{t('sortOldest')}</option>
              <option value="reward">{t('sortReward')}</option>
            </select>
          </div>

        </div>

        {/* Row 2: Location Selectors (Division & District) & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          
          {/* Division */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedDivision}
              onChange={(e) => handleDivisionChange(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
            >
              <option value="">{t('allDivisions')}</option>
              {BANGLADESH_DIVISIONS.map((div) => (
                <option key={div.name} value={div.name}>
                  {language === 'bn' ? div.nameBn : div.name}
                </option>
              ))}
            </select>
          </div>

          {/* District (conditional) */}
          <div>
            <select
              disabled={!selectedDivision}
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <option value="">
                {selectedDivision
                  ? (language === 'bn' ? 'সকল জেলা' : 'All Districts')
                  : (language === 'bn' ? 'আগে বিভাগ নির্বাচন করুন' : 'Select Division First')}
              </option>
              {availableDistricts.map((dist) => (
                <option key={dist.name} value={dist.name}>
                  {language === 'bn' ? dist.nameBn : dist.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'resolved')}
              className="w-full text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">{t('statusActive')}</option>
              <option value="resolved">{t('statusResolved')}</option>
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium py-2 px-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('clearFilters')}</span>
            </button>
          </div>

        </div>

        {/* Row 3: Category filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t('allCategories')}
          </button>
          {ITEM_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <CategoryIcon categoryId={cat.id} className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Grid of items */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onClick={onSelectItem} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {t('noItemsFound')}
          </h3>
          <p className="text-xs text-slate-500">
            Try removing some filter conditions or posting a new report for this item.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              {t('clearFilters')}
            </button>
            <button
              onClick={onOpenReport}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              {t('reportItem')}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
