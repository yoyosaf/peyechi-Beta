import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DatabaseStatusModal } from './components/DatabaseStatusModal';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ReportItemPage } from './pages/ReportItemPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { SafetyPage } from './pages/SafetyPage';
import { TermsPage, PrivacyPolicyPage } from './pages/TermsPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { apiClient, LostFoundItem, ItemType } from './lib/apiClient';
import { firebaseService, PostDocument } from './lib/firebaseService';
import { isFirebaseConfigured, getActiveFirebaseConfig, db } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Database, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [items, setItems] = useState<LostFoundItem[]>(() => apiClient.getItems());
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(isFirebaseConfigured());
  const [reportInitialType, setReportInitialType] = useState<ItemType>('lost');
  const [exploreFilters, setExploreFilters] = useState<Record<string, string> | undefined>(undefined);

  // Convert PostDocument to LostFoundItem format for unified UI rendering
  const mapPostToItem = (p: PostDocument): LostFoundItem => ({
    id: p.id,
    type: p.postType.toLowerCase() as ItemType,
    title: p.title,
    category: p.category,
    division: p.division,
    district: p.district,
    thana: p.upazilaThana,
    areaDetails: p.generalLocation,
    date: p.eventDate,
    description: p.description,
    imageUrl: p.imageUrls?.[0] || '',
    secretQuestion: p.secretQuestion,
    reward: p.reward,
    contactName: p.authorName,
    contactPhone: p.preferredContactMethod === 'PLATFORM_CLAIM' ? 'Hidden (Claim to reveal)' : '01XXXXXXXXX',
    contactEmail: '',
    hidePhonePublicly: p.preferredContactMethod === 'PLATFORM_CLAIM',
    userId: p.userId,
    status: p.status === 'RESOLVED' ? 'resolved' : 'active',
    createdAt: p.createdAt,
    views: p.viewsCount || 1
  });

  const refreshItems = useCallback(async () => {
    try {
      const livePosts = await firebaseService.getPosts({ status: 'ALL' });
      if (livePosts && livePosts.length > 0) {
        const mapped = livePosts.map(mapPostToItem);
        setItems(mapped);
        if (selectedItem) {
          const updated = mapped.find((i) => i.id === selectedItem.id);
          if (updated) setSelectedItem(updated);
        }
        return;
      }
    } catch {
      // fallback
    }

    const fresh = apiClient.getItems();
    setItems(fresh);
    if (selectedItem) {
      const updated = fresh.find((i) => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [selectedItem]);

  useEffect(() => {
    setIsLiveConnected(isFirebaseConfigured());
    refreshItems();

    // Listen for custom trigger to open database status modal
    const handleOpenDiagnostics = () => setDbModalOpen(true);
    window.addEventListener('open-db-diagnostics', handleOpenDiagnostics);

    // Live global Firestore sync listener
    let unsubscribe: (() => void) | undefined;
    if (db && isFirebaseConfigured()) {
      try {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const live = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostDocument));
              const mapped = live.map(mapPostToItem);
              setItems(mapped);
            }
          },
          (error) => {
            console.warn('Realtime sync snapshot notice:', error);
          }
        );
      } catch (err) {
        console.warn('Could not establish realtime snapshot listener:', err);
      }
    }

    return () => {
      window.removeEventListener('open-db-diagnostics', handleOpenDiagnostics);
      if (unsubscribe) unsubscribe();
    };
  }, [refreshItems]);

  const handleNavigate = (tab: string, filterParams?: Record<string, string>) => {
    if (filterParams) {
      setExploreFilters(filterParams);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectItem = (item: LostFoundItem) => {
    setSelectedItem(item);
    setCurrentTab('item-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenReport = (type: ItemType = 'lost') => {
    setReportInitialType(type);
    setCurrentTab('report');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeConfig = getActiveFirebaseConfig();

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
          
          {/* Top Global Database Status Bar */}
          <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Database Sync:</span>
                {isLiveConnected ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Cloud Firestore ({activeConfig.projectId})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Local Machine Mode (Not Syncing Globally)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDbModalOpen(true)}
                  className="text-slate-300 hover:text-white underline underline-offset-2 font-medium cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  {isLiveConnected ? 'Test Connection / Diagnostics' : 'How to Connect Global Database'}
                </button>
              </div>
            </div>
          </div>

          {/* Top Bar */}
          <Navbar
            currentTab={currentTab}
            onNavigate={handleNavigate}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenReport={() => handleOpenReport('lost')}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {currentTab === 'home' && (
              <HomePage
                items={items}
                onSelectItem={handleSelectItem}
                onNavigate={handleNavigate}
                onOpenReport={handleOpenReport}
              />
            )}

            {currentTab === 'explore' && (
              <ExplorePage
                items={items}
                initialFilters={exploreFilters}
                onSelectItem={handleSelectItem}
                onOpenReport={() => handleOpenReport('lost')}
              />
            )}

            {currentTab === 'item-detail' && selectedItem && (
              <ItemDetailPage
                item={selectedItem}
                onBack={() => setCurrentTab('explore')}
                onItemUpdated={refreshItems}
              />
            )}

            {currentTab === 'report' && (
              <ReportItemPage
                initialType={reportInitialType}
                onSuccess={(newItemId) => {
                  refreshItems();
                  const newItem = items.find((i) => i.id === newItemId) || apiClient.getItemById(newItemId);
                  if (newItem) {
                    setSelectedItem(newItem);
                    setCurrentTab('item-detail');
                  } else {
                    setCurrentTab('explore');
                  }
                }}
                onCancel={() => setCurrentTab('home')}
              />
            )}

            {currentTab === 'my-posts' && (
              <MyPostsPage
                onSelectItem={handleSelectItem}
                onOpenReport={() => handleOpenReport('lost')}
              />
            )}

            {currentTab === 'my-claims' && (
              <MyClaimsPage
                onSelectItem={handleSelectItem}
                onNavigate={handleNavigate}
              />
            )}

            {currentTab === 'safety' && <SafetyPage />}

            {currentTab === 'terms' && <TermsPage />}

            {currentTab === 'privacy' && <PrivacyPolicyPage />}

            {currentTab === 'admin' && (
              <AdminDashboard onSelectItem={handleSelectItem} />
            )}
          </main>

          {/* Footer */}
          <Footer onNavigate={handleNavigate} />

          {/* Authentication Modal */}
          <AuthModal
            isOpen={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
          />

          {/* Database Diagnostics & In-Browser Connection Modal */}
          <DatabaseStatusModal
            isOpen={dbModalOpen}
            onClose={() => setDbModalOpen(false)}
            onConfigUpdated={() => {
              setIsLiveConnected(isFirebaseConfigured());
              refreshItems();
            }}
          />

        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
