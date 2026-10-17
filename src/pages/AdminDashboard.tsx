import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  UserCheck,
  UserX,
  FileText,
  Settings,
  Activity,
  Database,
  Edit,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  Clock,
  Save,
  AlertCircle
} from 'lucide-react';
import {
  firebaseService,
  PostDocument,
  UserProfile,
  ClaimDocument,
  ReportDocument,
  ModerationLog,
  SiteSettings
} from '../lib/firebaseService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BANGLADESH_DIVISIONS, ITEM_CATEGORIES } from '../data/bangladeshData';

interface AdminDashboardProps {
  onSelectItem: (post: any) => void;
}

type TabType = 'overview' | 'posts' | 'users' | 'claims' | 'reports' | 'images' | 'settings' | 'logs' | 'database';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onSelectItem }) => {
  const { user, isAdmin, isModerator } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Collections state
  const [posts, setPosts] = useState<PostDocument[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [claims, setClaims] = useState<ClaimDocument[]>([]);
  const [reports, setReports] = useState<ReportDocument[]>([]);
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  // Post filters & pagination
  const [postSearch, setPostSearch] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState<'ALL' | 'LOST' | 'FOUND'>('ALL');
  const [postStatusFilter, setPostStatusFilter] = useState<'ALL' | PostDocument['status']>('ALL');
  const [postCategoryFilter, setPostCategoryFilter] = useState('all');
  const [postDivisionFilter, setPostDivisionFilter] = useState('');
  const [postPage, setPostPage] = useState(1);
  const postsPerPage = 10;
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // Modals & form states
  const [editingPost, setEditingPost] = useState<PostDocument | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkDeleteConfirmPhrase, setBulkDeleteConfirmPhrase] = useState('');
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const [allDeletePhrase, setAllDeletePhrase] = useState('');
  const [allDeleteModalOpen, setAllDeleteModalOpen] = useState(false);

  // User search & filters
  const [userSearch, setUserSearch] = useState('');

  // Report filter
  const [reportFilter, setReportFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL');

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const [p, u, c, r, l, s] = await Promise.all([
        firebaseService.getPosts({ status: 'ALL' }),
        firebaseService.getUsers(),
        firebaseService.getClaims(),
        firebaseService.getReports(),
        firebaseService.getModerationLogs(100),
        firebaseService.getSettings()
      ]);
      setPosts(p);
      setUsers(u);
      setClaims(c);
      setReports(r);
      setLogs(l);
      setSettings(s);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showStatus('Failed to refresh data from server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const actor = useMemo(() => ({
    uid: user?.uid || 'admin_sys',
    name: user?.displayName || 'Administrator'
  }), [user]);

  // Calculations for overview
  const totalPosts = posts.length;
  const lostCount = posts.filter((p) => p.postType === 'LOST').length;
  const foundCount = posts.filter((p) => p.postType === 'FOUND').length;
  const pendingApprovals = posts.filter((p) => p.status === 'PENDING').length;
  const approvedPosts = posts.filter((p) => p.status === 'APPROVED').length;
  const resolvedPosts = posts.filter((p) => p.status === 'RESOLVED').length;
  const rejectedPosts = posts.filter((p) => p.status === 'REJECTED').length;

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
  const suspendedUsers = users.filter((u) => u.status === 'SUSPENDED').length;

  const pendingClaims = claims.filter((c) => c.status === 'PENDING').length;
  const pendingReports = reports.filter((r) => r.status === 'PENDING').length;

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (postTypeFilter !== 'ALL' && p.postType !== postTypeFilter) return false;
      if (postStatusFilter !== 'ALL' && p.status !== postStatusFilter) return false;
      if (postCategoryFilter !== 'all' && p.category !== postCategoryFilter) return false;
      if (postDivisionFilter && p.division !== postDivisionFilter) return false;
      if (postSearch.trim()) {
        const q = postSearch.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        const matchesAuthor = p.authorName.toLowerCase().includes(q);
        const matchesDistrict = p.district.toLowerCase().includes(q);
        if (!matchesTitle && !matchesId && !matchesAuthor && !matchesDistrict) return false;
      }
      return true;
    });
  }, [posts, postTypeFilter, postStatusFilter, postCategoryFilter, postDivisionFilter, postSearch]);

  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, postPage]);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage) || 1;

  // Post Actions
  const handleApprovePost = async (id: string) => {
    try {
      await firebaseService.updatePost(id, { status: 'APPROVED' }, actor);
      await firebaseService.logActivity({
        actorUid: actor.uid,
        actorName: actor.name,
        action: 'APPROVE_POST',
        targetType: 'POST',
        targetId: id,
        reason: 'Post approved by admin',
        timestamp: new Date().toISOString()
      });
      showStatus('Post approved successfully');
      loadAllData();
    } catch {
      showStatus('Failed to approve post', 'error');
    }
  };

  const handleRejectPost = async () => {
    if (!rejectingPostId) return;
    try {
      await firebaseService.updatePost(
        rejectingPostId,
        { status: 'REJECTED', rejectionReason: rejectionReason || 'Violates community guidelines' },
        actor
      );
      await firebaseService.logActivity({
        actorUid: actor.uid,
        actorName: actor.name,
        action: 'REJECT_POST',
        targetType: 'POST',
        targetId: rejectingPostId,
        reason: rejectionReason,
        timestamp: new Date().toISOString()
      });
      showStatus('Post rejected');
      setRejectingPostId(null);
      setRejectionReason('');
      loadAllData();
    } catch {
      showStatus('Failed to reject post', 'error');
    }
  };

  const handleResolvePost = async (id: string) => {
    try {
      await firebaseService.updatePost(id, { status: 'RESOLVED', resolvedAt: new Date().toISOString() }, actor);
      await firebaseService.logActivity({
        actorUid: actor.uid,
        actorName: actor.name,
        action: 'RESOLVE_POST',
        targetType: 'POST',
        targetId: id,
        reason: 'Marked as returned/resolved by admin',
        timestamp: new Date().toISOString()
      });
      showStatus('Post marked as resolved');
      loadAllData();
    } catch {
      showStatus('Failed to resolve post', 'error');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post permanently?')) {
      try {
        await firebaseService.deletePost(id, actor);
        showStatus('Post deleted permanently');
        loadAllData();
      } catch {
        showStatus('Failed to delete post', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteConfirmPhrase !== 'DELETE SELECTED POSTS') {
      showStatus('Confirmation phrase does not match', 'error');
      return;
    }
    const ids = Array.from(selectedPostIds);
    try {
      const res = await firebaseService.deleteMultiplePosts(ids, actor);
      showStatus(`Deleted ${res.successCount} posts`);
      setSelectedPostIds(new Set());
      setBulkDeleteModalOpen(false);
      setBulkDeleteConfirmPhrase('');
      loadAllData();
    } catch {
      showStatus('Failed to perform bulk deletion', 'error');
    }
  };

  const handlePurgeAllPosts = async () => {
    if (allDeletePhrase !== 'DELETE ALL POSTS') {
      showStatus('Confirmation phrase must be DELETE ALL POSTS', 'error');
      return;
    }
    try {
      const count = await firebaseService.deleteAllPosts(allDeletePhrase, actor);
      showStatus(`Purged all ${count} posts from the database`);
      setAllDeleteModalOpen(false);
      setAllDeletePhrase('');
      loadAllData();
    } catch (err: unknown) {
      showStatus((err as Error).message || 'Failed to purge database', 'error');
    }
  };

  const handleSavePostEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;
    try {
      await firebaseService.updatePost(
        editingPost.id,
        {
          title: editingPost.title,
          description: editingPost.description,
          category: editingPost.category,
          division: editingPost.division,
          district: editingPost.district,
          upazilaThana: editingPost.upazilaThana,
          status: editingPost.status,
          reward: editingPost.reward ? Number(editingPost.reward) : undefined,
          moderationNotes: editingPost.moderationNotes
        },
        actor
      );
      showStatus('Post updated successfully');
      setEditingPost(null);
      loadAllData();
    } catch {
      showStatus('Failed to update post', 'error');
    }
  };

  // User Actions
  const handleToggleUserStatus = async (targetUser: UserProfile) => {
    const nextStatus = targetUser.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (targetUser.uid === user?.uid && nextStatus === 'SUSPENDED') {
      showStatus('You cannot suspend your own administrative account', 'error');
      return;
    }
    try {
      await firebaseService.updateUserStatus(targetUser.uid, nextStatus, actor);
      showStatus(`User ${nextStatus.toLowerCase()} successfully`);
      loadAllData();
    } catch {
      showStatus('Failed to update user status', 'error');
    }
  };

  const handleChangeUserRole = async (targetUser: UserProfile, newRole: UserProfile['role']) => {
    if (targetUser.uid === user?.uid && newRole !== 'ADMIN') {
      const adminCount = users.filter((u) => u.role === 'ADMIN').length;
      if (adminCount <= 1) {
        showStatus('Cannot demote yourself: at least one administrator is required', 'error');
        return;
      }
    }
    try {
      await firebaseService.updateUserRole(targetUser.uid, newRole, actor);
      showStatus(`User role changed to ${newRole}`);
      loadAllData();
    } catch {
      showStatus('Failed to update user role', 'error');
    }
  };

  // Claim Actions
  const handleClaimDecision = async (claimId: string, status: ClaimDocument['status']) => {
    try {
      await firebaseService.updateClaimStatus(claimId, status, actor);
      showStatus(`Claim marked as ${status}`);
      loadAllData();
    } catch {
      showStatus('Failed to update claim', 'error');
    }
  };

  // Report Actions
  const handleReportDecision = async (reportId: string, status: 'RESOLVED' | 'DISMISSED') => {
    try {
      await firebaseService.resolveReport(reportId, status, actor);
      showStatus(`Report marked as ${status}`);
      loadAllData();
    } catch {
      showStatus('Failed to update report', 'error');
    }
  };

  // Export Data
  const handleExport = async (type: 'posts' | 'users' | 'claims' | 'reports' | 'all') => {
    try {
      const jsonStr = await firebaseService.exportCollectionToJSON(type);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `peyechi_${type}_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showStatus(`Exported ${type} successfully`);
    } catch {
      showStatus('Export failed', 'error');
    }
  };

  // Site Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await firebaseService.updateSettings(settings, actor);
      showStatus('Site settings saved successfully');
    } catch {
      showStatus('Failed to save settings', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
              Administration Center
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">Peyechi Enterprise v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Admin & Moderation Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Authenticated as <strong>{user?.displayName || 'Admin'}</strong> ({user?.email}) · Role: <span className="text-emerald-700 font-bold">{user?.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Sync Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Global Status Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between gap-3 animate-in fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">×</button>
        </div>
      )}

      {/* Tab Navigation Strip */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-1 text-xs font-semibold no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: Layers },
          { id: 'posts', label: `Posts (${pendingApprovals > 0 ? `+${pendingApprovals}` : posts.length})`, icon: FileText },
          { id: 'users', label: `Users (${users.length})`, icon: UserCheck },
          { id: 'claims', label: `Claims (${pendingClaims > 0 ? `+${pendingClaims}` : claims.length})`, icon: Shield },
          { id: 'reports', label: `Reports (${pendingReports > 0 ? `+${pendingReports}` : reports.length})`, icon: ShieldAlert },
          { id: 'settings', label: 'Site Settings', icon: Settings },
          { id: 'logs', label: 'Audit Log', icon: Activity },
          { id: 'database', label: 'Database & Purge Tools', icon: Database }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Matrix Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Posts</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalPosts}</p>
              <div className="text-[10px] text-slate-400">Lost: {lostCount} · Found: {foundCount}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-amber-200/90 bg-amber-50/20 space-y-1">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Pending Approvals</span>
              <p className="text-2xl font-extrabold text-amber-700 font-mono tabular-nums">{pendingApprovals}</p>
              <div className="text-[10px] text-amber-600">Requires review</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200/90 bg-emerald-50/20 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Approved Live</span>
              <p className="text-2xl font-extrabold text-emerald-800 font-mono tabular-nums">{approvedPosts}</p>
              <div className="text-[10px] text-emerald-600">Publicly visible</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Resolved / Reconnected</span>
              <p className="text-2xl font-extrabold text-slate-800 font-mono tabular-nums">{resolvedPosts}</p>
              <div className="text-[10px] text-slate-400">Successfully returned</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Registered Users</span>
              <p className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">{totalUsers}</p>
              <div className="text-[10px] text-slate-400">Active: {activeUsers} · Suspended: {suspendedUsers}</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200/90 bg-rose-50/20 space-y-1">
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Pending Reports</span>
              <p className="text-2xl font-extrabold text-rose-700 font-mono tabular-nums">{pendingReports}</p>
              <div className="text-[10px] text-rose-600">Flagged scams</div>
            </div>
          </div>

          {/* Action Quick Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pending Approvals Spotlight */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Posts Awaiting Moderation ({pendingApprovals})</h3>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('posts');
                    setPostStatusFilter('PENDING');
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {pendingApprovals > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {posts.filter((p) => p.status === 'PENDING').slice(0, 4).map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="truncate flex-1">
                        <p className="font-semibold text-slate-900 truncate">{p.title}</p>
                        <p className="text-slate-400 text-[11px]">{p.district} · By {p.authorName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleApprovePost(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingPostId(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✓ All submitted posts have been reviewed and approved.
                </div>
              )}
            </div>

            {/* Pending Scam Reports Spotlight */}
            <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Flagged Scam Reports ({pendingReports})</h3>
                </div>
                <button
                  onClick={() => setActiveTab('reports')}
                  className="text-xs font-semibold text-rose-700 hover:underline cursor-pointer"
                >
                  View All
                </button>
              </div>

              {pendingReports > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {reports.filter((r) => r.status === 'PENDING').slice(0, 4).map((r) => (
                    <div key={r.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="truncate flex-1">
                        <p className="font-semibold text-rose-900 truncate">{r.postTitle}</p>
                        <p className="text-slate-500 text-[11px] truncate">Reason: {r.reason} · "{r.description}"</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleReportDecision(r.id, 'RESOLVED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleReportDecision(r.id, 'DISMISSED')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  ✓ Zero pending scam alerts. Community is in good standing.
                </div>
              )}
            </div>

          </div>

          {/* Recent Audit Activity */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Recent Administrative Operations</span>
            </h3>
            {logs.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs font-mono">
                {logs.slice(0, 5).map((l) => (
                  <div key={l.id} className="py-2 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-900">{l.actorName}:</span>
                      <span className="text-emerald-700 font-semibold">{l.action}</span>
                      <span className="text-slate-500 truncate">[{l.targetType}: {l.targetId}]</span>
                      {l.reason && <span className="text-slate-400 italic truncate">({l.reason})</span>}
                    </div>
                    <span className="text-slate-400 text-[11px] shrink-0">{l.timestamp.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-3">No activity recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. POST MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          
          {/* Post Filter Controls */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={postSearch}
                onChange={(e) => {
                  setPostSearch(e.target.value);
                  setPostPage(1);
                }}
                placeholder="Search title, ID, author, district..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Type */}
            <div>
              <select
                value={postTypeFilter}
                onChange={(e) => {
                  setPostTypeFilter(e.target.value as 'ALL' | 'LOST' | 'FOUND');
                  setPostPage(1);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="ALL">All Types (Lost/Found)</option>
                <option value="LOST">Lost Items Only</option>
                <option value="FOUND">Found Items Only</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <select
                value={postStatusFilter}
                onChange={(e) => {
                  setPostStatusFilter(e.target.value as 'ALL' | PostDocument['status']);
                  setPostPage(1);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>

            {/* Division */}
            <div>
              <select
                value={postDivisionFilter}
                onChange={(e) => {
                  setPostDivisionFilter(e.target.value);
                  setPostPage(1);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="">All Divisions</option>
                {BANGLADESH_DIVISIONS.map((d) => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <select
                value={postCategoryFilter}
                onChange={(e) => {
                  setPostCategoryFilter(e.target.value);
                  setPostPage(1);
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-slate-800"
              >
                <option value="all">All Categories</option>
                {ITEM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.nameEn}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bulk Action Strip if selected */}
          {selectedPostIds.size > 0 && (
            <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs animate-in fade-in">
              <span>{selectedPostIds.size} posts selected</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPostIds(new Set())}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Deselect
                </button>
                <button
                  onClick={() => setBulkDeleteModalOpen(true)}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Delete Selected Posts ({selectedPostIds.size})
                </button>
              </div>
            </div>
          )}

          {/* Posts Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-3 w-8">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.size === paginatedPosts.length && paginatedPosts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPostIds(new Set(paginatedPosts.map((p) => p.id)));
                          } else {
                            setSelectedPostIds(new Set());
                          }
                        }}
                        className="rounded-xs"
                      />
                    </th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Title & ID</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3">Author</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPosts.map((post) => {
                    const isSelected = selectedPostIds.has(post.id);
                    return (
                      <tr key={post.id} className={`hover:bg-slate-50/70 ${isSelected ? 'bg-emerald-50/40' : ''}`}>
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const s = new Set(selectedPostIds);
                              if (e.target.checked) s.add(post.id);
                              else s.delete(post.id);
                              setSelectedPostIds(s);
                            }}
                            className="rounded-xs"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              post.postType === 'LOST'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {post.postType}
                          </span>
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <p className="font-bold text-slate-900 truncate">{post.title}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{post.id}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {post.district}, {post.division}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {post.authorName}
                        </td>
                        <td className="py-3 px-3 text-slate-500 font-mono">
                          {post.eventDate}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              post.status === 'APPROVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : post.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800'
                                : post.status === 'RESOLVED'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {post.status === 'PENDING' && (
                              <button
                                onClick={() => handleApprovePost(post.id)}
                                title="Approve Post"
                                className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                            {post.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleResolvePost(post.id)}
                                title="Mark as Resolved"
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                              </button>
                            )}
                            <button
                              onClick={() => setEditingPost(post)}
                              title="Edit Post"
                              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete Post"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Showing {paginatedPosts.length} of {filteredPosts.length} posts</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={postPage <= 1}
                  onClick={() => setPostPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-mono text-slate-700">{postPage} / {totalPages}</span>
                <button
                  disabled={postPage >= totalPages}
                  onClick={() => setPostPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. USER MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name, email, role..."
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-xs text-slate-500">Total Users: {users.length}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Registered</th>
                    <th className="py-3 px-4">Last Login</th>
                    <th className="py-3 px-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users
                    .filter((u) => {
                      if (!userSearch.trim()) return true;
                      const q = userSearch.toLowerCase();
                      return (
                        u.displayName.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.role.toLowerCase().includes(q)
                      );
                    })
                    .map((usr) => (
                      <tr key={usr.uid} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{usr.displayName}</p>
                          <p className="text-[11px] text-slate-500">{usr.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{usr.uid}</p>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={usr.role}
                            onChange={(e) => handleChangeUserRole(usr, e.target.value as UserProfile['role'])}
                            className="text-xs p-1 rounded-md border border-slate-200 font-semibold bg-white cursor-pointer"
                          >
                            <option value="USER">USER</option>
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              usr.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {usr.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {usr.createdAt.split('T')[0]}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {usr.lastLoginAt ? usr.lastLoginAt.split('T')[0] : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(usr)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                              usr.status === 'ACTIVE'
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {usr.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. CLAIM MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Ownership Claim Inquiries ({claims.length})</h3>

            {claims.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {claims.map((claim) => (
                  <div key={claim.id} className="py-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{claim.postTitle}</span>
                        <p className="text-slate-500 text-[11px]">
                          Claimant: <strong>{claim.claimantName}</strong> ({claim.contactInfo}) · {claim.createdAt.split('T')[0]}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold self-start sm:self-auto ${
                          claim.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <p className="font-semibold text-slate-600">Verification Details submitted by claimant:</p>
                      <p className="text-slate-900 italic font-medium">"{claim.verificationDetails}"</p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      {claim.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'APPROVED')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                          >
                            Approve Claim & Unlock Contact
                          </button>
                          <button
                            onClick={() => handleClaimDecision(claim.id, 'REJECTED')}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer"
                          >
                            Reject Claim
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No claims have been submitted yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. REPORT MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Reported Scam & Fraud Cases ({reports.length})</h3>
              <select
                value={reportFilter}
                onChange={(e) => setReportFilter(e.target.value as typeof reportFilter)}
                className="text-xs p-1.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="ALL">All Reports</option>
                <option value="PENDING">PENDING</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="DISMISSED">DISMISSED</option>
              </select>
            </div>

            {reports.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {reports
                  .filter((r) => reportFilter === 'ALL' || r.status === reportFilter)
                  .map((rep) => (
                    <div key={rep.id} className="py-4 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded text-[10px] uppercase">
                              {rep.reason}
                            </span>
                            <span className="font-bold text-slate-900">{rep.postTitle}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">Reported by {rep.reporterName} on {rep.createdAt.split('T')[0]}</p>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase self-start sm:self-auto ${
                            rep.status === 'RESOLVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rep.status === 'DISMISSED'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rep.status}
                        </span>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl text-slate-700">
                        "{rep.description}"
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        {rep.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleReportDecision(rep.id, 'RESOLVED')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                            <button
                              onClick={() => handleReportDecision(rep.id, 'DISMISSED')}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDeletePost(rep.postId)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Offending Post</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No reports filed.</p>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. SITE SETTINGS TAB */}
      {/* ======================================================== */}
      {activeTab === 'settings' && settings && (
        <form onSubmit={handleSaveSettings} className="p-6 bg-white rounded-3xl border border-slate-200 space-y-6 max-w-2xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">Platform Configuration</h3>
            <p className="text-xs text-slate-500">Changes apply globally to user registration, post moderation, and file quotas.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Site Title</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300"
              />
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requirePostApproval}
                  onChange={(e) => setSettings({ ...settings, requirePostApproval: e.target.checked })}
                  className="rounded-xs text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">Require Admin Approval on New Posts</p>
                  <p className="text-[11px] text-slate-500">When enabled, newly reported lost/found items will remain PENDING until an administrator reviews them.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                  className="rounded-xs text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">Allow New Public Registrations</p>
                  <p className="text-[11px] text-slate-500">Allow visitors to sign up for new accounts.</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="rounded-xs text-emerald-600"
                />
                <div>
                  <p className="font-bold text-slate-900">Maintenance Mode</p>
                  <p className="text-[11px] text-slate-500">Temporarily pause public write operations for system upgrades.</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Images Per Post</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={settings.maxImagesPerPost}
                  onChange={(e) => setSettings({ ...settings, maxImagesPerPost: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max File Size (MB)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={Math.round(settings.maxImageSize / (1024 * 1024))}
                  onChange={(e) => setSettings({ ...settings, maxImageSize: Number(e.target.value) * 1024 * 1024 })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* 7. AUDIT LOG TAB */}
      {/* ======================================================== */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Security & Moderation Activity Log</h3>
            <span className="text-xs text-slate-500 font-mono">{logs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Actor</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Details / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 text-slate-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{log.actorName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-800">{log.targetType}: {log.targetId}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{log.reason || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 8. DATABASE & PURGE TOOLS TAB */}
      {/* ======================================================== */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          
          {/* Export Box */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Export Collections & Backups</h3>
            </div>
            <p className="text-xs text-slate-600">
              Download complete, formatted JSON backups before carrying out destructive administrative operations.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => handleExport('all')}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
              >
                Export Complete Database Backup (.JSON)
              </button>
              <button
                onClick={() => handleExport('posts')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Export Posts Only
              </button>
              <button
                onClick={() => handleExport('users')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Export Users
              </button>
              <button
                onClick={() => handleExport('claims')}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Export Claims
              </button>
            </div>
          </div>

          {/* Dangerous Destruction Box */}
          <div className="p-6 bg-rose-50/50 border border-rose-200 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-rose-900">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-base">Danger Zone: Purge Content</h3>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              These actions permanently delete records from Firestore. A typed confirmation phrase is required. Please download a backup beforehand.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setAllDeleteModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Purge All Posts from Database
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* EDIT POST MODAL */}
      {/* ======================================================== */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Post #{editingPost.id}</h3>
              <button onClick={() => setEditingPost(null)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>

            <form onSubmit={handleSavePostEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingPost.title}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  required
                  value={editingPost.description}
                  onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as PostDocument['status'] })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reward (BDT ৳)</label>
                  <input
                    type="number"
                    value={editingPost.reward || ''}
                    onChange={(e) => setEditingPost({ ...editingPost, reward: Number(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Moderator Notes (Internal)</label>
                <input
                  type="text"
                  value={editingPost.moderationNotes || ''}
                  onChange={(e) => setEditingPost({ ...editingPost, moderationNotes: e.target.value })}
                  placeholder="Notes visible to moderators only..."
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REJECT MODAL WITH REASON */}
      {/* ======================================================== */}
      {rejectingPostId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base">Reject Post</h3>
            <p className="text-xs text-slate-500">Provide a reason so the author understands why this listing was rejected.</p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Sensitive NID numbers visible / Suspected scam attempt..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
            />
            <div className="flex justify-end gap-2 pt-2 text-xs">
              <button onClick={() => setRejectingPostId(null)} className="px-3 py-1.5 rounded-lg text-slate-600">Cancel</button>
              <button onClick={handleRejectPost} className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-bold">Reject Post</button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* BULK DELETE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {bulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Confirm Bulk Deletion</span>
            </h3>
            <p className="text-xs text-slate-600">
              You are about to permanently delete <strong>{selectedPostIds.size}</strong> posts from Firestore. To confirm, type:
            </p>
            <p className="p-2 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800 text-center select-all">
              DELETE SELECTED POSTS
            </p>
            <input
              type="text"
              value={bulkDeleteConfirmPhrase}
              onChange={(e) => setBulkDeleteConfirmPhrase(e.target.value)}
              placeholder="Type phrase here..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button onClick={() => setBulkDeleteModalOpen(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
              <button
                disabled={bulkDeleteConfirmPhrase !== 'DELETE SELECTED POSTS'}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl disabled:opacity-40"
              >
                Permanently Delete ({selectedPostIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ALL POSTS PURGE MODAL */}
      {/* ======================================================== */}
      {allDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>Purge Entire Posts Database</span>
            </h3>
            <p className="text-xs text-slate-600">
              This will permanently delete <strong>ALL {totalPosts} posts</strong> from the database. This action CANNOT be undone without a backup file.
            </p>
            <p className="text-xs text-slate-500">To confirm this irreversible action, type:</p>
            <p className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono font-bold text-rose-800 text-center select-all">
              DELETE ALL POSTS
            </p>
            <input
              type="text"
              value={allDeletePhrase}
              onChange={(e) => setAllDeletePhrase(e.target.value)}
              placeholder="Type confirmation phrase..."
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
            <div className="flex justify-end gap-2 text-xs pt-2">
              <button onClick={() => setAllDeleteModalOpen(false)} className="px-3 py-1.5 text-slate-600">Cancel</button>
              <button
                disabled={allDeletePhrase !== 'DELETE ALL POSTS'}
                onClick={handlePurgeAllPosts}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl disabled:opacity-40"
              >
                Purge Database Now
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
