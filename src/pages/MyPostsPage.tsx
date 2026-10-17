import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Trash2,
  PlusCircle,
  HelpCircle,
  Phone,
  Mail,
  UserCheck,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { LostFoundItem, ClaimRequest, apiClient } from '../lib/apiClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface MyPostsPageProps {
  onSelectItem: (item: LostFoundItem) => void;
  onOpenReport: () => void;
}

export const MyPostsPage: React.FC<MyPostsPageProps> = ({
  onSelectItem,
  onOpenReport
}) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [items, setItems] = useState<LostFoundItem[]>(() => apiClient.getItems());
  const [claims, setClaims] = useState<ClaimRequest[]>(() => apiClient.getClaims());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Filter items belonging to current user (or demo items if matching)
  const myItems = items.filter((i) => i.userId === user?.uid || (user?.email && i.contactEmail === user.email));

  const toggleItemStatus = (itemId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'resolved' : 'active';
    apiClient.updateItemStatus(itemId, nextStatus);
    setItems(apiClient.getItems());
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      apiClient.deleteItem(itemId);
      setItems(apiClient.getItems());
    }
  };

  const handleClaimStatus = (claimId: string, status: 'approved' | 'rejected') => {
    apiClient.updateClaimStatus(claimId, status);
    setClaims(apiClient.getClaims());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t('myPostsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('myPostsSubtitle')}
          </p>
        </div>

        <button
          onClick={onOpenReport}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('reportItem')}</span>
        </button>
      </div>

      {myItems.length > 0 ? (
        <div className="space-y-4">
          {myItems.map((item) => {
            const itemClaims = claims.filter((c) => c.itemId === item.id);
            const isExpanded = expandedItemId === item.id;
            const isResolved = item.status === 'resolved';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs"
              >
                {/* Main Item Row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => onSelectItem(item)}>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold uppercase rounded-md ${
                          item.type === 'lost'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.type.toUpperCase()}
                      </span>
                      <span className="text-slate-500">{item.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500">{item.thana}, {item.district}</span>
                    </div>

                    <h3 className="font-semibold text-slate-900 hover:text-emerald-700 text-sm sm:text-base">
                      {item.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleItemStatus(item.id, item.status)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                        isResolved
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {isResolved ? 'Mark as Active' : t('markAsResolved')}
                    </button>

                    <button
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>{t('claimsReceived')}</span>
                      <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[11px] font-bold">
                        {itemClaims.length}
                      </span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      title={t('deletePost')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Claims accordion */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ownership Claims Submitted for this Item ({itemClaims.length})
                    </h4>

                    {itemClaims.length > 0 ? (
                      <div className="space-y-3">
                        {itemClaims.map((claim) => (
                          <div
                            key={claim.id}
                            className="p-4 rounded-xl bg-white border border-slate-200 space-y-2.5 text-xs"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{claim.claimantName}</span>
                                <span className="text-slate-400">·</span>
                                <span className="font-mono text-slate-600">{claim.claimantPhone}</span>
                                {claim.claimantEmail && (
                                  <span className="text-slate-500">({claim.claimantEmail})</span>
                                )}
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider self-start sm:self-auto ${
                                  claim.status === 'approved'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : claim.status === 'rejected'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {claim.status}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <p className="text-slate-500 font-medium">Answer to verification:</p>
                              <p className="text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-medium italic">
                                "{claim.answer}"
                              </p>
                            </div>

                            {claim.proofNotes && (
                              <div className="space-y-1">
                                <p className="text-slate-500 font-medium">Additional proof notes:</p>
                                <p className="text-slate-700">{claim.proofNotes}</p>
                              </div>
                            )}

                            {claim.status === 'pending' && (
                              <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleClaimStatus(claim.id, 'rejected')}
                                  className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  {t('rejectClaim')}
                                </button>
                                <button
                                  onClick={() => handleClaimStatus(claim.id, 'approved')}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                                >
                                  {t('approveClaim')}
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-2">
                        No ownership claims have been submitted for this item yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {t('noPostsYet')}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Have you lost something in Dhaka, Chittagong, or anywhere in Bangladesh? Post a report to alert the community.
          </p>
          <button
            onClick={onOpenReport}
            className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            {t('createNewPost')}
          </button>
        </div>
      )}

    </div>
  );
};
