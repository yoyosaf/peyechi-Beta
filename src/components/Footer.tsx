import React from 'react';
import { PeyechiLogo } from './PeyechiLogo';
import { PhoneCall, ShieldCheck, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="brightness-125 contrast-125">
              <PeyechiLogo showTagline={true} />
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Anti-Fraud System with Ownership Verification Questions</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('explore')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('safety')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('safetyGuidelines')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('termsOfService')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  {t('privacyPolicy')}
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Emergency Services
            </h4>
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <PhoneCall className="w-4 h-4" />
                <span>Call 999</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                National Emergency Service (Bangladesh Police, Fire Service, Ambulance). File a General Diary (GD) for lost NID, passport or vehicle.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>{t('copyright')}</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Community initiative built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for Bangladesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
