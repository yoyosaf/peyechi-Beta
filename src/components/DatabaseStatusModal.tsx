import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Cloud,
  HardDrive,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight,
  UploadCloud,
  Check
} from 'lucide-react';
import {
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  testFirestoreConnection,
  initializeFirebaseServices,
  FirebaseConfigParams
} from '../lib/firebase';
import { firebaseService, PostDocument } from '../lib/firebaseService';

interface DatabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

// User-provided Firebase config from prompt
const USER_PROVIDED_CONFIG: FirebaseConfigParams = {
  apiKey: 'AIzaSyDMgaCBYTWOvQ-6waedhOrCaLSVqxHnp7Q',
  authDomain: 'pysi-37018.firebaseapp.com',
  projectId: 'pysi-37018',
  storageBucket: 'pysi-37018.firebasestorage.app',
  messagingSenderId: '1094426915117',
  appId: '1:1094426915117:web:68affad54496409f2ea3a4',
  measurementId: 'G-J0WWHRSZ0R'
};

// Auto-provisioned AI Studio Cloud Firestore Project
const PROVISIONED_CONFIG: FirebaseConfigParams = {
  apiKey: 'AIzaSyCMwxPSs810LJbgFwE406d4llfiadll3Yg',
  authDomain: 'eternal-episode-sw2pc.firebaseapp.com',
  projectId: 'eternal-episode-sw2pc',
  firestoreDatabaseId: 'ai-studio-ziparchivereader-5709f733-522d-455a-9681-14141632e8c6',
  storageBucket: 'eternal-episode-sw2pc.firebasestorage.app',
  messagingSenderId: '76150507651',
  appId: '1:76150507651:web:a924bb16dd5f845c3733b6'
};

export const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const [activeConfig, setActiveConfig] = useState<FirebaseConfigParams>(getActiveFirebaseConfig());
  const [isConfigured, setIsConfigured] = useState<boolean>(isFirebaseConfigured());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    latencyMs?: number;
    projectId?: string;
    databaseId?: string;
    error?: string;
  } | null>(null);

  // Manual config paste state
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [pastedJson, setPastedJson] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState(activeConfig.apiKey);
  const [projectIdInput, setProjectIdInput] = useState(activeConfig.projectId);
  const [authDomainInput, setAuthDomainInput] = useState(activeConfig.authDomain);
  const [storageBucketInput, setStorageBucketInput] = useState(activeConfig.storageBucket);
  const [senderIdInput, setSenderIdInput] = useState(activeConfig.messagingSenderId);
  const [appIdInput, setAppIdInput] = useState(activeConfig.appId);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Cloud & local stats
  const [itemStats, setItemStats] = useState<{ cloudPosts: number; localPosts: number }>({
    cloudPosts: 0,
    localPosts: 0
  });

  const checkStatus = async () => {
    setTesting(true);
    const res = await testFirestoreConnection();
    setTestResult({
      tested: true,
      connected: res.connected,
      latencyMs: res.latencyMs,
      projectId: res.projectId,
      databaseId: res.databaseId,
      error: res.error
    });
    setTesting(false);

    // Count posts in Firestore vs Local
    try {
      const posts = await firebaseService.getPosts({ status: 'ALL' });
      const local = localStorage.getItem('peyechi_posts_v2');
      const localCount = local ? JSON.parse(local).length : 0;
      setItemStats({
        cloudPosts: posts.length,
        localPosts: localCount
      });
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (isOpen) {
      const curr = getActiveFirebaseConfig();
      setActiveConfig(curr);
      setIsConfigured(isFirebaseConfigured());
      setApiKeyInput(curr.apiKey);
      setProjectIdInput(curr.projectId);
      setAuthDomainInput(curr.authDomain);
      setStorageBucketInput(curr.storageBucket);
      setSenderIdInput(curr.messagingSenderId);
      setAppIdInput(curr.appId);
      checkStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleParseSnippet = (snippet: string) => {
    setPastedJson(snippet);
    try {
      const apiMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const authMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);
      const projMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const bucketMatch = snippet.match(/storageBucket:\s*["']([^"']+)["']/);
      const senderMatch = snippet.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appMatch = snippet.match(/appId:\s*["']([^"']+)["']/);

      if (apiMatch) setApiKeyInput(apiMatch[1]);
      if (authMatch) setAuthDomainInput(authMatch[1]);
      if (projMatch) setProjectIdInput(projMatch[1]);
      if (bucketMatch) setStorageBucketInput(bucketMatch[1]);
      if (senderMatch) setSenderIdInput(senderMatch[1]);
      if (appMatch) setAppIdInput(appMatch[1]);
    } catch {
      // ignore
    }
  };

  const handleApplyPreset = (preset: FirebaseConfigParams) => {
    localStorage.setItem('peyechi_firebase_runtime_config', JSON.stringify(preset));
    initializeFirebaseServices(preset);
    setActiveConfig(preset);
    setIsConfigured(true);
    setApiKeyInput(preset.apiKey);
    setProjectIdInput(preset.projectId);
    setAuthDomainInput(preset.authDomain);
    setStorageBucketInput(preset.storageBucket);
    setSenderIdInput(preset.messagingSenderId);
    setAppIdInput(preset.appId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    checkStatus();
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleSaveConfig = () => {
    const newConfig: FirebaseConfigParams = {
      apiKey: apiKeyInput.trim(),
      authDomain: authDomainInput.trim() || `${projectIdInput.trim()}.firebaseapp.com`,
      projectId: projectIdInput.trim(),
      storageBucket: storageBucketInput.trim() || `${projectIdInput.trim()}.firebasestorage.app`,
      messagingSenderId: senderIdInput.trim(),
      appId: appIdInput.trim()
    };

    localStorage.setItem('peyechi_firebase_runtime_config', JSON.stringify(newConfig));
    initializeFirebaseServices(newConfig);
    setActiveConfig(newConfig);
    setIsConfigured(true);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    checkStatus();
    if (onConfigUpdated) onConfigUpdated();
  };

  const handleResetToProvisioned = () => {
    localStorage.removeItem('peyechi_firebase_runtime_config');
    const envConfig = getActiveFirebaseConfig();
    initializeFirebaseServices(envConfig);
    setActiveConfig(envConfig);
    setIsConfigured(isFirebaseConfigured());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    checkStatus();
    if (onConfigUpdated) onConfigUpdated();
  };

  // Push local listings into Cloud Firestore
  const handleSyncLocalToCloud = async () => {
    setSyncing(true);
    setSyncMessage(null);
    try {
      const local = localStorage.getItem('peyechi_posts_v2');
      const rawPosts: PostDocument[] = local ? JSON.parse(local) : [];

      if (!rawPosts || rawPosts.length === 0) {
        setSyncMessage('No offline posts found in local machine cache.');
        setSyncing(false);
        return;
      }

      let count = 0;
      for (const p of rawPosts) {
        try {
          await firebaseService.createPost(
            {
              userId: p.userId || 'usr_synced',
              authorName: p.authorName || 'Local Poster',
              postType: p.postType,
              category: p.category,
              title: p.title,
              description: p.description,
              division: p.division,
              district: p.district,
              upazilaThana: p.upazilaThana,
              generalLocation: p.generalLocation,
              eventDate: p.eventDate,
              imageUrls: p.imageUrls || [],
              preferredContactMethod: p.preferredContactMethod || 'PHONE',
              secretQuestion: p.secretQuestion,
              reward: p.reward
            },
            {
              contactMethod: p.preferredContactMethod || 'PHONE',
              contactInfo: '01XXXXXXXXX'
            },
            { uid: p.userId || 'usr_synced', name: p.authorName || 'User' }
          );
          count++;
        } catch {
          // ignore single item collisions
        }
      }

      setSyncMessage(`Uploaded ${count} item(s) to Cloud Firestore successfully!`);
      await checkStatus();
      if (onConfigUpdated) onConfigUpdated();
    } catch (err: unknown) {
      setSyncMessage(`Sync notice: ${(err as Error).message || 'Sync failed'}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isConfigured && testResult?.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Database Connection & Global Sync</h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isConfigured && testResult?.connected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {isConfigured && testResult?.connected ? 'Online · Live Cloud' : 'Offline · Local Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Check whether lost & found items are storing globally on Google Cloud Firestore or in local storage.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Live Diagnosis Banner */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isConfigured && testResult?.connected
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start gap-3">
              {isConfigured && testResult?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold text-sm">
                  {isConfigured && testResult?.connected
                    ? `Connected to Google Cloud Firestore (${activeConfig.projectId})`
                    : 'Running in Local Machine Fallback Mode'}
                </p>
                <p className="text-xs leading-relaxed opacity-90">
                  {isConfigured && testResult?.connected
                    ? 'All posts, claims, reports, and admin actions are saved globally in Google Cloud Firestore and sync live to all visitors across Bangladesh.'
                    : 'Currently saving to your local browser storage. Switch to one of the connected Firebase projects below to synchronize globally.'}
                </p>
              </div>
            </div>

            <button
              onClick={checkStatus}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-slate-700 shadow-2xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Storage Target</span>
              <p className="font-bold text-slate-900 font-mono">
                {isConfigured ? 'Cloud Firestore' : 'Local Machine'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active Project</span>
              <p className="font-bold text-slate-900 font-mono truncate" title={activeConfig.projectId || 'None'}>
                {activeConfig.projectId || 'Not Configured'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Server Latency</span>
              <p className="font-bold text-slate-900 font-mono">
                {testResult?.latencyMs ? `${testResult.latencyMs} ms` : '—'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Global Realtime</span>
              <p className={`font-bold font-mono ${isConfigured && testResult?.connected ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isConfigured && testResult?.connected ? 'ACTIVE' : 'LOCAL ONLY'}
              </p>
            </div>
          </div>

          {/* Quick 1-Click Project Selector */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Select Active Firebase Project</h4>
                <p className="text-slate-500 text-[11px]">
                  Switch between your provisioned cloud database and your personal Firebase credentials with 1 click.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: Provisioned Cloud Database */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  activeConfig.projectId === PROVISIONED_CONFIG.projectId
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-emerald-600" />
                    <span>Cloud Provisioned</span>
                  </span>
                  {activeConfig.projectId === PROVISIONED_CONFIG.projectId && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono mb-3">
                  Project: {PROVISIONED_CONFIG.projectId}
                </p>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(PROVISIONED_CONFIG)}
                  className={`w-full py-1.5 px-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    activeConfig.projectId === PROVISIONED_CONFIG.projectId
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {activeConfig.projectId === PROVISIONED_CONFIG.projectId ? 'Connected (Current)' : 'Connect This Project'}
                </button>
              </div>

              {/* Option B: User Provided Project */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  activeConfig.projectId === USER_PROVIDED_CONFIG.projectId
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Your Firebase Project</span>
                  </span>
                  {activeConfig.projectId === USER_PROVIDED_CONFIG.projectId && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 font-mono mb-3">
                  Project: {USER_PROVIDED_CONFIG.projectId}
                </p>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(USER_PROVIDED_CONFIG)}
                  className={`w-full py-1.5 px-3 rounded-xl font-semibold text-xs transition-colors cursor-pointer ${
                    activeConfig.projectId === USER_PROVIDED_CONFIG.projectId
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {activeConfig.projectId === USER_PROVIDED_CONFIG.projectId ? 'Connected (Current)' : 'Connect pysi-37018'}
                </button>
              </div>
            </div>
          </div>

          {/* Sync Local Posts to Cloud Firestore */}
          {itemStats.localPosts > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <UploadCloud className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm">
                      {itemStats.localPosts} Local Post(s) Ready to Sync to Cloud
                    </h4>
                    <p className="text-amber-800 text-[11px] leading-relaxed">
                      You have posts stored in your local browser cache. Click below to transfer them into Cloud Firestore so they appear on other devices globally.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={syncing || !isConfigured}
                  onClick={handleSyncLocalToCloud}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {syncing ? 'Pushing...' : 'Push to Cloud'}
                </button>
              </div>

              {syncMessage && (
                <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-amber-900 font-semibold text-xs">
                  {syncMessage}
                </div>
              )}
            </div>
          )}

          {/* How to verify global sync instructions */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>How to verify that posts load globally:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
              <li>
                Click <strong>&quot;Report Lost / Found&quot;</strong> and submit a new test item (e.g. &quot;Lost Wallet in Dhanmondi&quot;).
              </li>
              <li>
                Open the application URL in a <strong>new Incognito window</strong> or on your <strong>mobile phone</strong> on a separate cellular data connection.
              </li>
              <li>
                Notice that the item you posted appears instantly in the list on both devices!
              </li>
              <li>
                Check the top navigation bar: it shows <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Cloud DB</span> confirming live Firestore operation.
              </li>
            </ol>
          </div>

          {/* Custom Config Accordion */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Custom Firebase Credentials</h4>
                <p className="text-slate-500 text-[11px]">
                  Manually edit or paste any other Firebase config snippet.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigForm(!showConfigForm)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-semibold text-slate-800 cursor-pointer"
              >
                {showConfigForm ? 'Hide Form' : 'Edit Credentials'}
              </button>
            </div>

            {showConfigForm && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                {saveSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Credentials saved! Connected to live Firebase.</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Paste `firebaseConfig` snippet from Firebase Console (Auto-Fill):
                  </label>
                  <textarea
                    rows={3}
                    value={pastedJson}
                    onChange={(e) => handleParseSnippet(e.target.value)}
                    placeholder={'const firebaseConfig = {\n  apiKey: "AIza...",\n  projectId: "my-project",\n  ...\n};'}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">API Key (apiKey) *</label>
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Project ID (projectId) *</label>
                    <input
                      type="text"
                      value={projectIdInput}
                      onChange={(e) => setProjectIdInput(e.target.value)}
                      placeholder="pysi-37018"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Auth Domain (authDomain)</label>
                    <input
                      type="text"
                      value={authDomainInput}
                      onChange={(e) => setAuthDomainInput(e.target.value)}
                      placeholder="pysi-37018.firebaseapp.com"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Storage Bucket (storageBucket)</label>
                    <input
                      type="text"
                      value={storageBucketInput}
                      onChange={(e) => setStorageBucketInput(e.target.value)}
                      placeholder="pysi-37018.firebasestorage.app"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleResetToProvisioned}
                    className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Reset to Default Cloud Database
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveConfig}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Save & Connect Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* How to configure permanently on Netlify */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>How to configure permanently on Netlify:</span>
            </h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              When hosting on Netlify, add these environment variables in your <strong>Netlify Site Settings &gt; Environment variables</strong> so every visitor across Bangladesh connects to the same global database:
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[10px] space-y-1 text-slate-700">
              <p>VITE_FIREBASE_API_KEY = {activeConfig.apiKey || 'your-api-key'}</p>
              <p>VITE_FIREBASE_AUTH_DOMAIN = {activeConfig.authDomain || 'pysi-37018.firebaseapp.com'}</p>
              <p>VITE_FIREBASE_PROJECT_ID = {activeConfig.projectId || 'pysi-37018'}</p>
              <p>VITE_FIREBASE_STORAGE_BUCKET = {activeConfig.storageBucket || 'pysi-37018.firebasestorage.app'}</p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            Close Diagnostics
          </button>
        </div>

      </div>
    </div>
  );
};
