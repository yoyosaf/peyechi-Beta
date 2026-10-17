import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { apiClient, LostFoundItem } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface MyClaimsPageProps {
  onSelectItem: (item: LostFoundItem) => void;
  onNavigate: (tab: string) => void;
}

export const MyClaimsPage: React.FC<MyClaimsPageProps> = ({
  onSelectItem,
  onNavigate
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const allClaims = apiClient.getClaims();
  const myClaims = allClaims.filter((c) => c.claimantId === user?.uid || (user?.email && c.claimantEmail === user.email));
  const allItems = apiClient.getItems();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {t('myClaimsTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Track the status of ownership claims you submitted for lost items.
        </p>
      </div>

      {myClaims.length > 0 ? (
        <div className="space-y-4">
          {myClaims.map((claim) => {
            const item = allItems.find((i) => i.id === claim.itemId);
            const isApproved = claim.status === 'approved';
            const isRejected = claim.status === 'rejected';

            return (
              <div
                key={claim.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] text-slate-400">Claim submitted on {claim.createdAt.split('T')[0]}</span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {claim.itemTitle}
                    </h3>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('claimStatusApproved')}</span>
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('claimStatusRejected')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('claimStatusPending')}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <p className="font-medium text-slate-500">Your verification answer:</p>
                    <p className="text-slate-800 italic">"{claim.answer}"</p>
                  </div>

                  {isApproved && item && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2 text-emerald-950">
                      <p className="font-bold">Contact Finder to arrange safe handover:</p>
                      <div className="space-y-1 font-mono text-xs">
                        <p>Name: <strong>{item.contactName}</strong></p>
                        <p>Phone: <strong>{item.contactPhone}</strong></p>
                        {item.contactEmail && <p>Email: <strong>{item.contactEmail}</strong></p>}
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Reminder: Meet only at a local Police Station (Thana) or public venue.
                      </p>
                    </div>
                  )}
                </div>

                {item && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                    >
                      <span>View Original Listing</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Claims Submitted Yet
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            If someone found your lost item, submit an ownership claim to connect with them safely.
          </p>
          <button
            onClick={() => onNavigate('explore')}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            Browse Found Items
          </button>
        </div>
      )}

    </div>
  );
};
