import React, { useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Shield,
  Flag,
  Gift,
  HelpCircle,
  CheckCircle,
  Phone,
  Mail,
  User,
  AlertTriangle
} from 'lucide-react';
import { LostFoundItem } from '../lib/apiClient';
import { ITEM_CATEGORIES } from '../data/bangladeshData';
import { CategoryIcon } from '../components/CategoryIcon';
import { ClaimModal } from '../components/ClaimModal';
import { ReportPostModal } from '../components/ReportPostModal';
import { AntiScamNotice } from '../components/AntiScamNotice';
import { useLanguage } from '../context/LanguageContext';

interface ItemDetailPageProps {
  item: LostFoundItem;
  onBack: () => void;
  onItemUpdated: () => void;
}

export const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  onBack,
  onItemUpdated
}) => {
  const { language, t } = useLanguage();

  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claimSuccessBanner, setClaimSuccessBanner] = useState(false);

  const categoryObj = ITEM_CATEGORIES.find((c) => c.id === item.category);
  const categoryName = categoryObj
    ? language === 'bn' ? categoryObj.nameBn : categoryObj.nameEn
    : item.category;

  const isLost = item.type === 'lost';
  const isResolved = item.status === 'resolved';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top back bar & share */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('backToList')}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? t('linkCopied') : t('shareItem')}</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            title={t('reportPost')}
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('reportPost')}</span>
          </button>
        </div>
      </div>

      {claimSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          <span>
            Your ownership claim has been submitted to the finder. You can track this under <strong>My Claims</strong>.
          </span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Image / Banner */}
        <div className="relative aspect-video sm:aspect-21/9 w-full bg-slate-900 overflow-hidden flex items-center justify-center">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : null}

          {/* Fallback pattern */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 p-6 -z-0">
            <CategoryIcon categoryId={item.category} className="w-16 h-16 text-emerald-500/60 mb-2" />
            <span className="text-sm font-semibold text-slate-300">
              {categoryName}
            </span>
          </div>

          {/* Badges on banner */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span
              className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-xl shadow-md ${
                isLost
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {isLost
                ? (language === 'bn' ? 'হারানো (LOST)' : 'LOST ITEM')
                : (language === 'bn' ? 'পাওয়া (FOUND)' : 'FOUND ITEM')}
            </span>

            {isResolved && (
              <span className="px-3 py-1 text-xs font-semibold bg-slate-900/90 text-white rounded-xl backdrop-blur-xs">
                {language === 'bn' ? 'ফেরত দেওয়া হয়েছে' : 'Resolved / Returned'}
              </span>
            )}
          </div>

          {/* Reward pill */}
          {item.reward && item.reward > 0 && !isResolved && (
            <div className="absolute top-4 right-4 z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-amber-500 text-slate-950 rounded-xl shadow-md">
                <Gift className="w-4 h-4" />
                <span>৳{item.reward.toLocaleString()} Reward</span>
              </span>
            </div>
          )}
        </div>

        {/* Details section */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Metadata header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-emerald-800">{categoryName}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {isLost ? t('lostDate') : t('foundDate')}: <strong>{item.date}</strong>
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span>{item.views || 1} views</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {item.title}
            </h1>
          </div>

          {/* Location box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 shrink-0">
                <MapPin className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {item.thana ? `${item.thana}, ` : ''}{item.district}, {item.division}
                </p>
                {item.areaDetails && (
                  <p className="text-slate-600 mt-0.5">{item.areaDetails}</p>
                )}
              </div>
            </div>

            <div className="shrink-0 text-slate-500 text-[11px]">
              Bangladesh Geographic Zone
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {t('descriptionLabel')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Secret Verification Question */}
          {item.secretQuestion && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                <HelpCircle className="w-5 h-5 text-emerald-700" />
                <span>{t('verificationQuestion')}</span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium italic pl-7">
                "{item.secretQuestion}"
              </p>
              <div className="pl-7 pt-1">
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs cursor-pointer transition-colors"
                >
                  {t('claimItem')}
                </button>
              </div>
            </div>
          )}

          {/* Contact & Handover Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isLost ? t('contactOwner') : t('contactFinder')}
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{item.contactName}</span>
                </div>

                {item.hidePhonePublicly ? (
                  <div className="text-xs text-amber-900 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                    <p className="font-semibold">Phone hidden for privacy & anti-scam security.</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Submit an ownership claim above. Once approved by {item.contactName}, direct contact info will be unlocked.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-700">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.contactPhone}</span>
                    </div>
                    {item.contactEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.contactEmail}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!item.secretQuestion && !isResolved && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-colors shrink-0"
                >
                  {t('claimItem')}
                </button>
              )}
            </div>
          </div>

          {/* Anti-Scam Reminder */}
          <AntiScamNotice compact={true} onLearnMore={() => {}} />

        </div>
      </div>

      {/* Claim Modal */}
      <ClaimModal
        item={item}
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        onClaimSuccess={() => {
          setClaimSuccessBanner(true);
          onItemUpdated();
        }}
      />

      {/* Report Modal */}
      <ReportPostModal
        item={item}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSuccess={() => {
          onItemUpdated();
        }}
      />

    </div>
  );
};
