import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { LostFoundItem, apiClient } from '../lib/apiClient';
import { firebaseService } from '../lib/firebaseService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface ClaimModalProps {
  item: LostFoundItem;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSuccess
}) => {
  const { t } = useLanguage();
  const { user, isSuspended } = useAuth();

  const [answer, setAnswer] = useState('');
  const [proofNotes, setProofNotes] = useState('');
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) {
      setError('Your account is currently suspended and cannot submit claims.');
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError('Please provide your name and phone number.');
      return;
    }
    if (item.secretQuestion && !answer.trim()) {
      setError('Please answer the verification question.');
      return;
    }

    setSubmitting(true);
    try {
      await firebaseService.createClaim({
        postId: item.id,
        postTitle: item.title,
        claimantUserId: user?.uid || 'usr_guest_' + Date.now(),
        claimantName: name.trim(),
        verificationDetails: answer.trim() + (proofNotes ? ` | Notes: ${proofNotes.trim()}` : ''),
        contactMethod: 'PHONE',
        contactInfo: `${phone.trim()}${email ? ` (${email.trim()})` : ''}`
      });

      apiClient.createClaim({
        itemId: item.id,
        itemTitle: item.title,
        claimantId: user?.uid || 'usr_guest_' + Date.now(),
        claimantName: name.trim(),
        claimantPhone: phone.trim(),
        claimantEmail: email.trim(),
        answer: answer.trim(),
        proofNotes: proofNotes.trim()
      });

      setSubmitting(false);
      onClaimSuccess();
      onClose();
    } catch {
      setSubmitting(false);
      setError('Failed to submit claim. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{t('claimModalTitle')}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{item.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Question if present */}
          {item.secretQuestion ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                <HelpCircle className="w-4 h-4 text-emerald-700" />
                <span>{t('verificationQuestion')}</span>
              </div>
              <p className="text-xs text-emerald-950 font-medium italic">
                "{item.secretQuestion}"
              </p>
              <div className="pt-1">
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('claimAnswer')} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={t('claimAnswerPlaceholder')}
                  className="w-full text-xs p-2.5 rounded-lg border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('claimAnswer')} *
              </label>
              <textarea
                required
                rows={3}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Describe how you can prove ownership (e.g. what was inside, special marks, passwords, etc.)"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Proof notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('claimProofNotes')} (Optional)
            </label>
            <textarea
              rows={2}
              value={proofNotes}
              onChange={(e) => setProofNotes(e.target.value)}
              placeholder={t('claimProofNotesPlaceholder')}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('contactName')} *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('contactPhone')} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1XXXXXXXXX"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {t('contactEmail')} (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
            <strong>Privacy Note:</strong> Your contact details and answer will only be visible to the person who posted this item for identity verification.
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : t('submitClaim')}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
