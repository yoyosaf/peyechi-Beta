import React from 'react';
import { ShieldAlert, AlertTriangle, ChevronRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface AntiScamNoticeProps {
  onLearnMore?: () => void;
  compact?: boolean;
}

export const AntiScamNotice: React.FC<AntiScamNoticeProps> = ({ onLearnMore, compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 text-xs bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-950">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>{t('antiScamTitle')}:</strong> Never send bKash/Nagad advance courier fees.
          </span>
        </div>
        {onLearnMore && (
          <button
            onClick={onLearnMore}
            className="text-amber-800 hover:text-amber-950 font-medium underline underline-offset-2 shrink-0 cursor-pointer"
          >
            {t('learnMore')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-50/90 to-orange-50/70 border border-amber-200/90 rounded-2xl">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-amber-950">
            {t('antiScamTitle')}
          </h4>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
            {t('antiScamWarning')}
          </p>
          {onLearnMore && (
            <div className="pt-2">
              <button
                onClick={onLearnMore}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:text-amber-950 underline underline-offset-2 cursor-pointer transition-colors"
              >
                <span>{t('learnMore')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
