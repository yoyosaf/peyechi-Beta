import React, { useState } from 'react';
import {
  Upload,
  Shield,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Gift,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { BANGLADESH_DIVISIONS, ITEM_CATEGORIES } from '../data/bangladeshData';
import { apiClient, ItemType } from '../lib/apiClient';
import { firebaseService } from '../lib/firebaseService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface ReportItemPageProps {
  initialType?: ItemType;
  onSuccess: (newItemId: string) => void;
  onCancel: () => void;
}

export const ReportItemPage: React.FC<ReportItemPageProps> = ({
  initialType = 'lost',
  onSuccess,
  onCancel
}) => {
  const { user, isSuspended } = useAuth();
  const { language, t } = useLanguage();

  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(ITEM_CATEGORIES[0].id);
  const [division, setDivision] = useState(BANGLADESH_DIVISIONS[0].name);
  const [district, setDistrict] = useState(BANGLADESH_DIVISIONS[0].districts[0].name);
  const [thana, setThana] = useState(BANGLADESH_DIVISIONS[0].districts[0].thanas[0]);
  const [areaDetails, setAreaDetails] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [reward, setReward] = useState<string>('');
  const [contactName, setContactName] = useState(user?.displayName || '');
  const [contactPhone, setContactPhone] = useState(user?.phoneNumber || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [hidePhonePublicly, setHidePhonePublicly] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle cascading changes
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.name === division) || BANGLADESH_DIVISIONS[0];
  const availableDistricts = currentDivisionObj.districts;
  const currentDistrictObj = availableDistricts.find((d) => d.name === district) || availableDistricts[0];
  const availableThanas = currentDistrictObj?.thanas || [];

  const handleDivisionSelect = (divName: string) => {
    setDivision(divName);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.name === divName);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0].name);
      setThana(divObj.districts[0].thanas[0] || '');
    }
  };

  const handleDistrictSelect = (distName: string) => {
    setDistrict(distName);
    const distObj = availableDistricts.find((d) => d.name === distName);
    if (distObj && distObj.thanas.length > 0) {
      setThana(distObj.thanas[0] || '');
    }
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, or WebP).');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file is too large. Maximum size is 2MB.');
        return;
      }
      setError('');
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuspended) {
      setError('Your account has been suspended by an administrator. You cannot post new listings.');
      return;
    }
    if (!title.trim() || !contactName.trim() || !contactPhone.trim()) {
      setError('Please fill in the item title, your name, and phone number.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let finalImageUrl = imageUrl;
      if (imageFile && user?.uid) {
        setUploadProgress(10);
        finalImageUrl = await firebaseService.uploadImage(imageFile, user.uid, (p) => setUploadProgress(p));
      }

      // Prepare clean post document without undefined keys
      const parsedReward = reward ? parseInt(reward, 10) : 0;
      const trimmedSecret = secretQuestion.trim();

      const postPayload = {
        userId: user?.uid || 'usr_guest_' + Date.now(),
        authorName: contactName.trim(),
        postType: type === 'lost' ? ('LOST' as const) : ('FOUND' as const),
        category,
        title: title.trim(),
        description: description.trim(),
        division,
        district,
        upazilaThana: thana,
        generalLocation: areaDetails.trim(),
        eventDate: date,
        imageUrls: finalImageUrl ? [finalImageUrl] : [],
        preferredContactMethod: hidePhonePublicly ? ('PLATFORM_CLAIM' as const) : ('PHONE' as const),
        ...(trimmedSecret ? { secretQuestion: trimmedSecret } : {}),
        ...(parsedReward > 0 ? { reward: parsedReward } : {})
      };

      // Save via firebaseService
      const postDoc = await firebaseService.createPost(
        postPayload,
        {
          contactMethod: hidePhonePublicly ? 'PLATFORM_CLAIM' : 'PHONE',
          contactInfo: contactPhone.trim()
        },
        {
          uid: user?.uid || 'usr_guest',
          name: contactName.trim()
        }
      );

      // Also sync with apiClient for instant UI consistency
      const created = apiClient.createItem({
        type,
        title: title.trim(),
        category,
        division,
        district,
        thana,
        areaDetails: areaDetails.trim(),
        date,
        description: description.trim(),
        imageUrl: finalImageUrl || undefined,
        ...(trimmedSecret ? { secretQuestion: trimmedSecret } : {}),
        ...(parsedReward > 0 ? { reward: parsedReward } : {}),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        hidePhonePublicly,
        userId: user?.uid || 'usr_guest_' + Date.now()
      });

      setSubmitting(false);
      onSuccess(created.id || postDoc.id);
    } catch (err: unknown) {
      setSubmitting(false);
      let userFriendlyMsg = 'পোস্ট তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।';
      if (err instanceof Error) {
        try {
          if (err.message.startsWith('{')) {
            const parsed = JSON.parse(err.message);
            userFriendlyMsg = parsed.error || err.message;
          } else {
            userFriendlyMsg = err.message;
          }
        } catch {
          userFriendlyMsg = err.message;
        }
      }
      setError(userFriendlyMsg);
    }
  };


  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top back */}
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer py-1.5 px-3 rounded-lg hover:bg-slate-100"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('backToList')}</span>
      </button>

      {/* Main Form Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('reportPageTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('reportPageSubtitle')}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Item Type: Lost vs Found */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              {t('reportTypeLabel')} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'lost'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>{t('typeLost')}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-3 px-4 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  type === 'found'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>{t('typeFound')}</span>
              </button>
            </div>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('itemTitle')} *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('itemTitlePlaceholder')}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('categoryLabel')} *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
              >
                {ITEM_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'bn' ? cat.nameBn : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bangladesh Geographic Location */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location in Bangladesh *</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('divisionLabel')}
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionSelect(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.name} value={div.name}>
                      {language === 'bn' ? div.nameBn : div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('districtLabel')}
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictSelect(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                >
                  {availableDistricts.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      {language === 'bn' ? dist.nameBn : dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  {t('thanaLabel')}
                </label>
                <select
                  value={thana}
                  onChange={(e) => setThana(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 cursor-pointer"
                >
                  {availableThanas.map((tName) => (
                    <option key={tName} value={tName}>
                      {tName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                {t('areaDetails')}
              </label>
              <input
                type="text"
                value={areaDetails}
                onChange={(e) => setAreaDetails(e.target.value)}
                placeholder={t('areaDetailsPlaceholder')}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date & Reward */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('dateLabel')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('rewardLabel')}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">৳</span>
                <input
                  type="number"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                  placeholder={t('rewardPlaceholder')}
                  className="w-full text-xs sm:text-sm pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('descriptionLabel')} *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descriptionPlaceholder')}
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Secret Verification Question (Crucial Anti-Fraud Feature) */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>{t('secretQuestionLabel')}</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              Ask a question only the true owner knows (e.g. lock-screen wallpaper, exact coin count, or inside initials). This prevents fraudulent claimants.
            </p>
            <input
              type="text"
              value={secretQuestion}
              onChange={(e) => setSecretQuestion(e.target.value)}
              placeholder={t('secretQuestionPlaceholder')}
              className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {t('imageLabel')}
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Choose Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </label>

              {imageUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  />
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Image Selected</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('contactName')} *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {t('contactPhone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+880 1XXXXXXXXX"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {t('contactEmail')} (Optional)
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Privacy Checkbox */}
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={hidePhonePublicly}
                onChange={(e) => setHidePhonePublicly(e.target.checked)}
                className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-snug">
                {t('preferAnonymous')}
              </span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {submitting ? t('submitting') : t('submitReport')}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
