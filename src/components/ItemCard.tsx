import React from 'react';
import { MapPin, Calendar, Eye, Gift } from 'lucide-react';
import { LostFoundItem } from '../lib/apiClient';
import { CategoryIcon } from './CategoryIcon';
import { ITEM_CATEGORIES } from '../data/bangladeshData';
import { useLanguage } from '../context/LanguageContext';

interface ItemCardProps {
  item: LostFoundItem;
  onClick: (item: LostFoundItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  const { language } = useLanguage();

  const categoryObj = ITEM_CATEGORIES.find((c) => c.id === item.category);
  const categoryName = categoryObj
    ? language === 'bn' ? categoryObj.nameBn : categoryObj.nameEn
    : item.category;

  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';

  return (
    <div
      onClick={() => onClick(item)}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Media or Fallback Container */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Hide image on error to display fallback cleanly
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : null}

        {/* Fallback Icon Container (always underneath in case img fails or is absent) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 p-4 -z-0">
          <CategoryIcon categoryId={item.category} className="w-10 h-10 mb-1 text-slate-400/80" />
          <span className="text-xs text-slate-400 font-medium text-center truncate max-w-[180px]">
            {categoryName}
          </span>
        </div>

        {/* Type Ribbon */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
          <span
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg shadow-xs ${
              isLost
                ? 'bg-rose-600 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isLost
              ? (language === 'bn' ? 'হারানো (LOST)' : 'LOST')
              : (language === 'bn' ? 'পাওয়া (FOUND)' : 'FOUND')}
          </span>

          {isResolved && (
            <span className="px-2 py-1 text-[11px] font-semibold bg-slate-900/90 text-white rounded-lg backdrop-blur-xs">
              {language === 'bn' ? 'ফেরত দেওয়া হয়েছে' : 'Resolved'}
            </span>
          )}
        </div>

        {/* Reward Tag */}
        {item.reward && item.reward > 0 && !isResolved && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-lg shadow-xs">
              <Gift className="w-3.5 h-3.5" />
              <span>৳{item.reward.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Metadata line without pills (Frontend Constitution) */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-emerald-800">{categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{item.date}</span>
            </span>
          </div>

          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700 transition-colors text-sm sm:text-base leading-snug">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Footer info: Location & Views */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[200px]" title={`${item.thana}, ${item.district}`}>
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              {item.thana ? `${item.thana}, ` : ''}{item.district}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0 font-mono text-[11px] tabular-nums text-slate-400">
            <Eye className="w-3 h-3" />
            <span>{item.views || 1}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
