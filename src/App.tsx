import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
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

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [items, setItems] = useState<LostFoundItem[]>(() => apiClient.getItems());
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportInitialType, setReportInitialType] = useState<ItemType>('lost');
  const [exploreFilters, setExploreFilters] = useState<Record<string, string> | undefined>(undefined);

  const refreshItems = () => {
    const fresh = apiClient.getItems();
    setItems(fresh);
    if (selectedItem) {
      const updated = fresh.find((i) => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  };

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

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
          
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
                  const newItem = apiClient.getItemById(newItemId);
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

        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}
