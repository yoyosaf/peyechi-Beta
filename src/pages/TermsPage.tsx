import React from 'react';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {language === 'bn' ? 'ব্যবহারের শর্তাবলী' : 'Terms of Service'}
      </h1>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
        <p>
          Welcome to Peyechi (পেয়েছি). By using our platform, you agree to comply with our community safety and transparency standards.
        </p>

        <h3 className="text-sm font-bold text-slate-900">1. Good Faith & Honesty</h3>
        <p>
          Peyechi is a public service dedicated to helping reconnect citizens with lost possessions. Fraudulent claims, fake lost reports, or attempting to extort rewards is strictly prohibited.
        </p>

        <h3 className="text-sm font-bold text-slate-900">2. No Courier Advance Payment</h3>
        <p>
          We strongly advise users to NEVER transfer courier fees, delivery charges, or advance gifts via mobile financial services (bKash, Nagad, Rocket) prior to in-person physical inspection of the item. Peyechi does not facilitate financial escrow or courier logistics.
        </p>

        <h3 className="text-sm font-bold text-slate-900">3. Safe Public Handover</h3>
        <p>
          All item handovers should occur in daylight in secure public places—preferably your local Thana (Police Station), a university campus gate, or a busy market.
        </p>

        <h3 className="text-sm font-bold text-slate-900">4. Legal Documents & Law Enforcement</h3>
        <p>
          Found passports, arms licenses, or National ID cards may be turned over to the nearest Bangladesh Police Thana if the rightful owner cannot be reached promptly.
        </p>
      </div>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">
        {language === 'bn' ? 'গোপনীয়তা নীতি' : 'Privacy Policy'}
      </h1>

      <div className="prose prose-slate text-xs sm:text-sm text-slate-700 space-y-4 leading-relaxed">
        <p>
          Your privacy and safety are paramount at Peyechi. Here is how we handle and protect user information:
        </p>

        <h3 className="text-sm font-bold text-slate-900">1. Sensitive Document Masking</h3>
        <p>
          When posting lost or found National ID cards, passports, or bank cards, full identification numbers must be masked. We strictly prohibit publishing unredacted NID numbers or credit card CVVs.
        </p>

        <h3 className="text-sm font-bold text-slate-900">2. Phone Number Protection</h3>
        <p>
          Finders can choose to conceal their personal phone number publicly. In this mode, claimants must submit an ownership verification claim through our secure form. Contact information is only unlocked once the finder verifies the claimant’s answer.
        </p>

        <h3 className="text-sm font-bold text-slate-900">3. Data Storage & Usage</h3>
        <p>
          We do not sell or monetize personal contact numbers. All listing data is used solely to facilitate the reconnection of lost belongings.
        </p>
      </div>
    </div>
  );
};
