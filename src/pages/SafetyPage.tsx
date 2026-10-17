import React from 'react';
import { ShieldAlert, AlertTriangle, PhoneCall, CheckCircle2, XCircle, MapPin, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SafetyPage: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
          <ShieldAlert className="w-4 h-4" />
          <span>Bangladesh Citizen Safety Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {language === 'bn' ? 'নিরাপত্তা ও প্রতারণা রোধ নির্দেশিকা' : 'Community Safety & Anti-Scam Guide'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'bn'
            ? 'হারানো জিনিসপত্র ফেরত নেওয়ার সময় প্রতারকদের ফাঁদ থেকে বাঁচতে নিচের নিয়মগুলো কঠোরভাবে মেনে চলুন।'
            : 'Protect yourself against courier extortion, fake callers, and advance payment fraud when recovering lost belongings across Bangladesh.'}
        </p>
      </div>

      {/* Top Warning Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200/90 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-rose-600 text-white shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-base sm:text-lg font-bold text-rose-950">
              {language === 'bn' ? 'কখনোই বিকাশ বা নগদে অগ্রিম টাকা পাঠাবেন না!' : 'Never Send bKash or Nagad Advance Payments!'}
            </h2>
            <p className="text-xs sm:text-sm text-rose-900/90 leading-relaxed">
              {language === 'bn'
                ? 'একটি প্রচলিত প্রতারণা হলো—ফোন করে বলা হয় "আপনার জিনিসটি পাওয়া গেছে, সুন্দরবন বা পাঠাও কুরিয়ারে পাঠাতে ৪০০/৫০০ টাকা বিকাশ করুন।" একবার টাকা পাঠালে প্রতারক নম্বর বন্ধ করে দেয়। কোনো অবস্থাতেই জিনিস সরাসরি হাতে না পাওয়া পর্যন্ত ১ টাকাও পাঠাবেন না।'
                : 'The most common scam in Bangladesh involves a caller claiming to have your lost phone or wallet, then asking for ৳300–৳1,000 via bKash/Nagad for "courier parcel fees" or "petrol cost". Once the money is sent, the caller disconnects their SIM. Never send advance money.'}
            </p>
          </div>
        </div>
      </div>

      {/* Do's and Don'ts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* DO's */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{language === 'bn' ? 'কী করবেন (করণীয়)' : 'What to Do (Safe Handover)'}</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>{language === 'bn' ? 'জনবহুল স্থানে দেখা করুন:' : 'Meet in public daytime places:'}</strong>{' '}
                {language === 'bn'
                  ? 'নিকটস্থ থানা (Police Station), মেট্রো স্টেশন বা ব্যস্ত শপিং মলের ভেতরে দেখা করুন।'
                  : 'Always meet at a local Thana (Police Station), Metro station, or busy shopping center.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>{language === 'bn' ? 'গোপন প্রমাণ জিজ্ঞাসা করুন:' : 'Verify with secret details:'}</strong>{' '}
                {language === 'bn'
                  ? 'ফোনের লক স্ক্রিন পাসকোড, ব্যাগের ভেতরের কোনো বিশেষ চিহ্ন বা চাবির রঙের উত্তর চান।'
                  : 'Ask for specific proof (e.g. phone wallpaper, inner pocket cards, or unlock code) before meeting.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                <strong>{language === 'bn' ? 'সাথে বন্ধু বা আত্মীয় রাখুন:' : 'Bring a companion:'}</strong>{' '}
                {language === 'bn'
                  ? 'একা কোনো অপরিচিত জায়গায় জিনিস আনতে যাবেন না।'
                  : 'Never go alone to an unfamiliar handover spot.'}
              </span>
            </li>
          </ul>
        </div>

        {/* DON'Ts */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-base">
            <XCircle className="w-5 h-5 text-rose-600" />
            <span>{language === 'bn' ? 'যা করবেন না (বর্জনীয়)' : 'What NOT to Do (Red Flags)'}</span>
          </div>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>{language === 'bn' ? 'অগ্রিম ডেলিভারি ফি দেবেন না:' : 'Zero advance fees:'}</strong>{' '}
                {language === 'bn'
                  ? 'কুরিয়ার, রিকশা ভাড়া বা কোনো অজুহাতেই টাকা ট্রান্সফার করবেন না।'
                  : 'Do not transfer money via bKash, Nagad, Rocket or bank transfer before inspecting the item.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>{language === 'bn' ? 'নির্জনে যাবেন না:' : 'Avoid secluded areas:'}</strong>{' '}
                {language === 'bn'
                  ? 'রাতের বেলা বা নির্জন গলি, ছাদ বা শুনশান পার্কিং লটে দেখা করবেন না।'
                  : 'Never agree to meet late at night or in isolated alleyways/construction sites.'}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-rose-600 font-bold">✕</span>
              <span>
                <strong>{language === 'bn' ? 'ওটিপি বা পিন শেয়ার করবেন না:' : 'Never share OTPs or PINs:'}</strong>{' '}
                {language === 'bn'
                  ? 'কোনো তথাকথিত ভেরিফিকেশনের জন্য ওটিপি চাওয়া হলে দেবেন না।'
                  : 'Never share SMS codes, OTPs, or financial account credentials.'}
              </span>
            </li>
          </ul>
        </div>

      </div>

      {/* GD Guide */}
      <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
          <FileText className="w-5 h-5 text-emerald-600" />
          <span>{language === 'bn' ? 'কীভাবে পুলিশ জিডি (GD) করবেন?' : 'How to File a Police General Diary (GD)'}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {language === 'bn'
            ? 'জাতীয় পরিচয়পত্র (NID), পাসপোর্ট, ড্রাইভিং লাইসেন্স বা মোবাইল ফোন হারালে তাৎক্ষণিক আপনার নিকটস্থ থানায় গিয়ে সাধারণ ডায়েরি (জিডি) করা বাধ্যতামূলক। নতুন কার্ড বা সিম রিপ্লেসমেন্টের জন্য জিডি কপি আবশ্যক।'
            : 'If you lost an NID card, passport, vehicle registration, or phone, you should file a General Diary (GD) immediately at your local police station or online via the Bangladesh Police Online GD portal (onlinegd.police.gov.bd). A GD copy is legally required for issuing replacement documents.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900">Step 1</span>
            <p className="text-slate-600">Note down exact time, location and approximate serial/NID numbers.</p>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900">Step 2</span>
            <p className="text-slate-600">Visit Duty Officer at your local Thana or use Online GD app.</p>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-slate-900">Step 3</span>
            <p className="text-slate-600">Collect the stamped GD receipt copy for Election Commission / BRTA.</p>
          </div>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-400" />
          <span>Official Emergency Helplines in Bangladesh</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
            <p className="text-rose-400 font-extrabold text-lg">999</p>
            <p className="font-semibold text-slate-200">National Emergency</p>
            <p className="text-slate-400 text-[11px]">Police, Fire Service & Ambulance (Free call)</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
            <p className="text-emerald-400 font-extrabold text-lg">100</p>
            <p className="font-semibold text-slate-200">Bangladesh Police</p>
            <p className="text-slate-400 text-[11px]">Police Control Room assistance</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-800 border border-slate-700 space-y-1">
            <p className="text-teal-400 font-extrabold text-lg">01320000888</p>
            <p className="font-semibold text-slate-200">Cyber Police Center</p>
            <p className="text-slate-400 text-[11px]">CID Cyber crime and online scam unit</p>
          </div>
        </div>
      </div>

    </div>
  );
};
