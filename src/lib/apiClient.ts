export type ItemType = 'lost' | 'found';
export type ItemStatus = 'active' | 'resolved' | 'flagged';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';

export interface LostFoundItem {
  id: string;
  type: ItemType; // 'lost' | 'found'
  title: string;
  category: string;
  division: string;
  district: string;
  thana: string;
  areaDetails: string;
  date: string; // ISO date string or YYYY-MM-DD
  description: string;
  imageUrl?: string;
  secretQuestion?: string; // Verification question set by finder
  reward?: number; // In BDT
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  hidePhonePublicly: boolean;
  userId: string;
  status: ItemStatus;
  createdAt: string;
  views: number;
}

export interface ClaimRequest {
  id: string;
  itemId: string;
  itemTitle: string;
  claimantId: string;
  claimantName: string;
  claimantPhone: string;
  claimantEmail: string;
  answer: string;
  proofNotes: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface FlaggedReport {
  id: string;
  itemId: string;
  itemTitle: string;
  reportedBy: string;
  reason: string;
  details: string;
  createdAt: string;
  resolved: boolean;
}

// Initial realistic Bangladesh dataset
const SEED_ITEMS: LostFoundItem[] = [
  {
    id: 'item-bd-01',
    type: 'found',
    title: 'National Identity Card (NID) of Md. Rafiqul Islam',
    category: 'documents',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Mirpur',
    areaDetails: 'Found inside a bus on Mirpur 10 roundabout',
    date: '2026-10-14',
    description: 'Smart NID card found in passenger seat. First name is Md. Rafiqul. Partial NID ending in 4920. Owner please verify date of birth or father’s name.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    secretQuestion: 'What is the year of birth or father\'s name on the card?',
    reward: 0,
    contactName: 'Shahriar Khan',
    contactPhone: '+880 1711-223344',
    contactEmail: 'shahriar@gmail.com',
    hidePhonePublicly: true,
    userId: 'usr_seed_1',
    status: 'active',
    createdAt: '2026-10-14T08:30:00Z',
    views: 84
  },
  {
    id: 'item-bd-02',
    type: 'lost',
    title: 'Black Leather Men’s Wallet with Cards & Cash',
    category: 'wallets',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Dhanmondi',
    areaDetails: 'Near Dhanmondi 27 Star Kabab / Meena Bazar area',
    date: '2026-10-15',
    description: 'Lost a dark brown/black leather wallet containing Eastern Bank VISA card, Dhaka University library card, and approximate cash. Reward offered for safe return!',
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    secretQuestion: '',
    reward: 2000,
    contactName: 'Tanvir Hossain',
    contactPhone: '+880 1712-345678',
    contactEmail: 'tanvir@gmail.com',
    hidePhonePublicly: false,
    userId: 'usr_bd_101',
    status: 'active',
    createdAt: '2026-10-15T11:15:00Z',
    views: 142
  },
  {
    id: 'item-bd-03',
    type: 'found',
    title: 'Apple iPhone 13 (Blue Color, Clear Case)',
    category: 'electronics',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Badda',
    areaDetails: 'Jamuna Future Park 5th Floor Food Court table',
    date: '2026-10-13',
    description: 'iPhone 13 with blue frame found on a dining table. Battery was around 40%. Screen has privacy protector. Kept safely in hand.',
    imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80',
    secretQuestion: 'What picture is set as the lock-screen wallpaper, or can you unlock with passcode?',
    reward: 0,
    contactName: 'Anika Rahman',
    contactPhone: '+880 1819-876543',
    contactEmail: 'anika@gmail.com',
    hidePhonePublicly: true,
    userId: 'usr_seed_2',
    status: 'active',
    createdAt: '2026-10-13T14:20:00Z',
    views: 295
  },
  {
    id: 'item-bd-04',
    type: 'lost',
    title: 'Honda CB Hornet Motorcycle Key with Red Ribbon',
    category: 'keys',
    division: 'Chattogram',
    district: 'Chattogram',
    thana: 'Agrabad',
    areaDetails: 'Near Agrabad Commercial Area Badamtali intersection',
    date: '2026-10-12',
    description: 'A single bike key attached with a red branded Honda fabric keychain. Urgent for daily commute.',
    reward: 500,
    contactName: 'Mohiuddin Chy',
    contactPhone: '+880 1610-112233',
    contactEmail: 'mohiuddin@ctg.com',
    hidePhonePublicly: false,
    userId: 'usr_seed_3',
    status: 'active',
    createdAt: '2026-10-12T09:45:00Z',
    views: 63
  },
  {
    id: 'item-bd-05',
    type: 'found',
    title: 'BRTA Smart Driving License of Ashikur Rahman',
    category: 'documents',
    division: 'Sylhet',
    district: 'Sylhet',
    thana: 'Kotwali',
    areaDetails: 'Zindabazar point near City Center',
    date: '2026-10-11',
    description: 'Professional motorcycle and light vehicle smart driving license card found on footpath.',
    secretQuestion: 'What is the father’s name or blood group mentioned on the license?',
    reward: 0,
    contactName: 'Kamrul Hassan',
    contactPhone: '+880 1913-445566',
    contactEmail: 'kamrul@sylhet.org',
    hidePhonePublicly: true,
    userId: 'usr_seed_4',
    status: 'active',
    createdAt: '2026-10-11T16:00:00Z',
    views: 110
  },
  {
    id: 'item-bd-06',
    type: 'lost',
    title: 'Persian White Cat with Blue Collar (Name: Casper)',
    category: 'pets',
    division: 'Dhaka',
    district: 'Dhaka',
    thana: 'Uttara',
    areaDetails: 'Sector 4, Road 7 park vicinity',
    date: '2026-10-15',
    description: '1 year old male Persian white cat, very friendly, wearing a light blue safety collar with a small bell. Family is desperately searching.',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    reward: 5000,
    contactName: 'Sadia Jahan',
    contactPhone: '+880 1755-998877',
    contactEmail: 'sadia@northsouth.edu',
    hidePhonePublicly: false,
    userId: 'usr_seed_5',
    status: 'active',
    createdAt: '2026-10-15T07:10:00Z',
    views: 312
  }
];

const SEED_CLAIMS: ClaimRequest[] = [
  {
    id: 'claim-1',
    itemId: 'item-bd-01',
    itemTitle: 'National Identity Card (NID) of Md. Rafiqul Islam',
    claimantId: 'usr_demo_claimer',
    claimantName: 'Md. Rafiqul Islam',
    claimantPhone: '+880 1715-001122',
    claimantEmail: 'rafiq@bdmail.com',
    answer: 'Birth year is 1988, father is late Abdul Jalil, village Sonargaon.',
    proofNotes: 'I also have the GD copy filed at Mirpur Police Station (GD #8291).',
    status: 'pending',
    createdAt: '2026-10-14T10:15:00Z'
  }
];

const ITEMS_KEY = 'peyechi_items_v1';
const CLAIMS_KEY = 'peyechi_claims_v1';
const REPORTS_KEY = 'peyechi_reports_v1';

export const apiClient = {
  getItems: (): LostFoundItem[] => {
    const raw = localStorage.getItem(ITEMS_KEY);
    if (!raw) {
      localStorage.setItem(ITEMS_KEY, JSON.stringify(SEED_ITEMS));
      return SEED_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_ITEMS;
    }
  },

  getItemById: (id: string): LostFoundItem | undefined => {
    const items = apiClient.getItems();
    const item = items.find((i) => i.id === id);
    if (item) {
      // Increment view counter
      item.views = (item.views || 0) + 1;
      localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    }
    return item;
  },

  createItem: (itemData: Omit<LostFoundItem, 'id' | 'createdAt' | 'views' | 'status'>): LostFoundItem => {
    const items = apiClient.getItems();
    const newItem: LostFoundItem = {
      ...itemData,
      id: 'item-' + Date.now(),
      status: 'active',
      views: 1,
      createdAt: new Date().toISOString()
    };
    items.unshift(newItem);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    return newItem;
  },

  updateItemStatus: (id: string, status: ItemStatus): boolean => {
    const items = apiClient.getItems();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) return false;
    items[index].status = status;
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
    return true;
  },

  deleteItem: (id: string): boolean => {
    const items = apiClient.getItems();
    const filtered = items.filter((i) => i.id !== id);
    localStorage.setItem(ITEMS_KEY, JSON.stringify(filtered));
    return true;
  },

  // Claims
  getClaims: (): ClaimRequest[] => {
    const raw = localStorage.getItem(CLAIMS_KEY);
    if (!raw) {
      localStorage.setItem(CLAIMS_KEY, JSON.stringify(SEED_CLAIMS));
      return SEED_CLAIMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return SEED_CLAIMS;
    }
  },

  getClaimsForItem: (itemId: string): ClaimRequest[] => {
    const all = apiClient.getClaims();
    return all.filter((c) => c.itemId === itemId);
  },

  getMyClaims: (claimantId: string): ClaimRequest[] => {
    const all = apiClient.getClaims();
    return all.filter((c) => c.claimantId === claimantId);
  },

  createClaim: (claim: Omit<ClaimRequest, 'id' | 'status' | 'createdAt'>): ClaimRequest => {
    const all = apiClient.getClaims();
    const newClaim: ClaimRequest = {
      ...claim,
      id: 'claim-' + Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    all.unshift(newClaim);
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(all));
    return newClaim;
  },

  updateClaimStatus: (claimId: string, status: ClaimStatus): boolean => {
    const all = apiClient.getClaims();
    const index = all.findIndex((c) => c.id === claimId);
    if (index === -1) return false;
    all[index].status = status;
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(all));
    return true;
  },

  // Post Flagging / Spam Reporting
  reportPost: (report: Omit<FlaggedReport, 'id' | 'createdAt' | 'resolved'>): FlaggedReport => {
    const raw = localStorage.getItem(REPORTS_KEY);
    const all: FlaggedReport[] = raw ? JSON.parse(raw) : [];
    const newReport: FlaggedReport = {
      ...report,
      id: 'report-' + Date.now(),
      createdAt: new Date().toISOString(),
      resolved: false
    };
    all.unshift(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
    return newReport;
  },

  getFlaggedReports: (): FlaggedReport[] => {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  resolveReport: (reportId: string): boolean => {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) return false;
    const all: FlaggedReport[] = JSON.parse(raw);
    const index = all.findIndex((r) => r.id === reportId);
    if (index === -1) return false;
    all[index].resolved = true;
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
    return true;
  }
};
