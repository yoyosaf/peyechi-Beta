export interface District {
  name: string;
  nameBn: string;
  thanas: string[];
  thanasBn: string[];
}

export interface Division {
  name: string;
  nameBn: string;
  districts: District[];
}

export const BANGLADESH_DIVISIONS: Division[] = [
  {
    name: 'Dhaka',
    nameBn: 'ঢাকা',
    districts: [
      {
        name: 'Dhaka',
        nameBn: 'ঢাকা',
        thanas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Motijheel', 'Shahbagh', 'Tejgaon', 'Badda', 'Khilgaon', 'Old Dhaka', 'Paltan', 'Bashundhara R/A'],
        thanasBn: ['ধানমন্ডি', 'গুলশান', 'বনানী', 'উত্তরা', 'মিরপুর', 'মোহাম্মদপুর', 'মতিঝিল', 'শাহবাগ', 'তেজগাঁও', 'বাড্ডা', 'খিলগাঁও', 'পুরান ঢাকা', 'পল্টন', 'বসুন্ধরা আ/এ']
      },
      {
        name: 'Gazipur',
        nameBn: 'গাজীপুর',
        thanas: ['Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur'],
        thanasBn: ['সদর', 'টঙ্গী', 'কালিয়াকৈর', 'কাপাসিয়া', 'শ্রীপুর']
      },
      {
        name: 'Narayanganj',
        nameBn: 'নারায়ণগঞ্জ',
        thanas: ['Sadar', 'Fatullah', 'Siddhirganj', 'Bandar', 'Rupganj', 'Sonargaon'],
        thanasBn: ['সদর', 'ফতুল্লা', 'সিদ্ধিরগঞ্জ', 'বন্দর', 'রূপগঞ্জ', 'সোনারগাঁও']
      },
      {
        name: 'Tangail',
        nameBn: 'টাঙ্গাইল',
        thanas: ['Sadar', 'Mirzapur', 'Gopalpur', 'Madhupur', 'Ghatail'],
        thanasBn: ['সদর', 'মির্জাপুর', 'গোপালপুর', 'মধুপুর', 'ঘাটাইল']
      },
      {
        name: 'Faridpur',
        nameBn: 'ফরিদপুর',
        thanas: ['Sadar', 'Bhanga', 'Boalmari', 'Madhukhali'],
        thanasBn: ['সদর', 'ভাঙ্গা', 'বোয়ালমারী', 'মধুখালী']
      }
    ]
  },
  {
    name: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    districts: [
      {
        name: 'Chattogram',
        nameBn: 'চট্টগ্রাম',
        thanas: ['Panchlaish', 'Kotwali', 'Khulshi', 'Halishahar', 'Agrabad', 'Patenga', 'Bakalia', 'Chandgaon'],
        thanasBn: ['পাঁচলাইশ', 'কোতোয়ালী', 'খুলশী', 'হালিশহর', 'আগ্রাবাদ', 'পতেঙ্গা', 'বাকলিয়া', 'চান্দগাঁও']
      },
      {
        name: 'Cox\'s Bazar',
        nameBn: 'কক্সবাজার',
        thanas: ['Sadar', 'Teknaf', 'Ukhiya', 'Ramu', 'Chakaria'],
        thanasBn: ['সদর', 'টেকনাফ', 'উখিয়া', 'রামু', 'চকরিয়া']
      },
      {
        name: 'Cumilla',
        nameBn: 'কুমিল্লা',
        thanas: ['Adarsha Sadar', 'Daudkandi', 'Chandina', 'Laksam', 'Debidwar'],
        thanasBn: ['আদর্শ সদর', 'দাউদকান্দি', 'চান্দিনা', 'লাকসাম', 'দেবীদ্বার']
      },
      {
        name: 'Noakhali',
        nameBn: 'নোয়াখালী',
        thanas: ['Sudharam (Sadar)', 'Begumganj', 'Senbagh', 'Companiganj'],
        thanasBn: ['সুধারাম (সদর)', 'বেগমগঞ্জ', 'সেনবাগ', 'কোম্পানীগঞ্জ']
      }
    ]
  },
  {
    name: 'Rajshahi',
    nameBn: 'রাজশাহী',
    districts: [
      {
        name: 'Rajshahi',
        nameBn: 'রাজশাহী',
        thanas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Paba', 'Godagari'],
        thanasBn: ['বোয়ালিয়া', 'মতিহার', 'রাজপাড়া', 'শাহ মখদুম', 'পবা', 'গোদাগাড়ী']
      },
      {
        name: 'Bogura',
        nameBn: 'বগুড়া',
        thanas: ['Sadar', 'Sherpur', 'Shibganj', 'Gabtali', 'Dhunat'],
        thanasBn: ['সদর', 'শেরপুর', 'শিবগঞ্জ', 'গাবতলী', 'ধুনট']
      },
      {
        name: 'Pabna',
        nameBn: 'পাবনা',
        thanas: ['Sadar', 'Ishwardi', 'Santhia', 'Chatmohar'],
        thanasBn: ['সদর', 'ঈশ্বরদী', 'সাঁথিয়া', 'চাটমোহর']
      }
    ]
  },
  {
    name: 'Khulna',
    nameBn: 'খুলনা',
    districts: [
      {
        name: 'Khulna',
        nameBn: 'খুলনা',
        thanas: ['Kotwali', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Khan Jahan Ali'],
        thanasBn: ['কোতোয়ালী', 'সোনাডাঙ্গা', 'খালিশপুর', 'দৌলতপুর', 'খান জাহান আলী']
      },
      {
        name: 'Jashore',
        nameBn: 'যশোর',
        thanas: ['Kotwali', 'Jhikargachha', 'Benapole', 'Keshabpur'],
        thanasBn: ['কোতোয়ালী', 'ঝিকরগাছা', 'বেনাপোল', 'কেশবপুর']
      },
      {
        name: 'Kushtia',
        nameBn: 'কুষ্টিয়া',
        thanas: ['Sadar', 'Kumarkhali', 'Mirpur', 'Bheramara'],
        thanasBn: ['সদর', 'কুমারখালী', 'মিরপুর', 'ভেড়ামারা']
      }
    ]
  },
  {
    name: 'Sylhet',
    nameBn: 'সিলেট',
    districts: [
      {
        name: 'Sylhet',
        nameBn: 'সিলেট',
        thanas: ['Kotwali', 'Jalalabad', 'Airport', 'Osmani Nagar', 'Beanibazar'],
        thanasBn: ['কোতোয়ালী', 'জালালাবাদ', 'এয়ারপোর্ট', 'ওসমানী নগর', 'বিয়ানীবাজার']
      },
      {
        name: 'Moulvibazar',
        nameBn: 'মৌলভীবাজার',
        thanas: ['Sadar', 'Sreemangal', 'Kulaura', 'Kamalganj'],
        thanasBn: ['সদর', 'শ্রীমঙ্গল', 'কুলাউড়া', 'কমলগঞ্জ']
      }
    ]
  },
  {
    name: 'Barishal',
    nameBn: 'বরিশাল',
    districts: [
      {
        name: 'Barishal',
        nameBn: 'বরিশাল',
        thanas: ['Kotwali', 'Kawnia', 'Airport', 'Bakerganj', 'Babuganj'],
        thanasBn: ['কোতোয়ালী', 'কাউনিয়া', 'এয়ারপোর্ট', 'বাকেরগঞ্জ', 'বাবুগঞ্জ']
      },
      {
        name: 'Patuakhali',
        nameBn: 'পটুয়াখালী',
        thanas: ['Sadar', 'Kuakata', 'Galachipa', 'Bauphal'],
        thanasBn: ['সদর', 'কুয়াকাটা', 'গলাচিপা', 'বাউফল']
      }
    ]
  },
  {
    name: 'Rangpur',
    nameBn: 'রংপুর',
    districts: [
      {
        name: 'Rangpur',
        nameBn: 'রংপুর',
        thanas: ['Kotwali', 'Tajhat', 'Parshuram', 'Mahiganj', 'Badarganj'],
        thanasBn: ['কোতোয়ালী', 'তাজহাট', 'পরশুরাম', 'মাহিগঞ্জ', 'বদরগঞ্জ']
      },
      {
        name: 'Dinajpur',
        nameBn: 'দিনাজপুর',
        thanas: ['Kotwali', 'Birganj', 'Phulbari', 'Parbatipur'],
        thanasBn: ['কোতোয়ালী', 'বীরগঞ্জ', 'ফুলবাড়ী', 'পার্বতীপুর']
      }
    ]
  },
  {
    name: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    districts: [
      {
        name: 'Mymensingh',
        nameBn: 'ময়মনসিংহ',
        thanas: ['Kotwali', 'Muktagachha', 'Trishal', 'Bhaluka', 'Fulbaria'],
        thanasBn: ['কোতোয়ালী', 'মুক্তাগাছা', 'ত্রিশাল', 'ভালুকা', 'ফুলবাড়ীয়া']
      }
    ]
  }
];

export const ITEM_CATEGORIES = [
  { id: 'documents', nameEn: 'National ID & Documents', nameBn: 'জাতীয় পরিচয়পত্র ও কাগজপত্র', icon: 'FileText' },
  { id: 'electronics', nameEn: 'Phones, Laptops & Tech', nameBn: 'মোবাইল, ল্যাপটপ ও গ্যাজেট', icon: 'Smartphone' },
  { id: 'wallets', nameEn: 'Wallets, Bags & Cash', nameBn: 'মানিব্যাগ, ব্যাগ ও টাকা', icon: 'Wallet' },
  { id: 'keys', nameEn: 'Keys & Remotes', nameBn: 'চাবি ও রিমোট', icon: 'Key' },
  { id: 'jewelry', nameEn: 'Jewelry & Watches', nameBn: 'গহনা ও ঘড়ি', icon: 'Watch' },
  { id: 'pets', nameEn: 'Pets & Animals', nameBn: 'পোষা প্রাণী ও পাখি', icon: 'Heart' },
  { id: 'vehicles', nameEn: 'Vehicles & Bicycles', nameBn: 'যানবাহন ও সাইকেল', icon: 'Bike' },
  { id: 'other', nameEn: 'Other Belongings', nameBn: 'অন্যান্য জিনিসপত্র', icon: 'Package' }
];
