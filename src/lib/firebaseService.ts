import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  db,
  storage,
  isFirebaseConfigured,
  handleFirestoreError,
  OperationType
} from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  preferredLanguage: 'bn' | 'en';
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface PostDocument {
  id: string;
  userId: string;
  authorName: string;
  postType: 'LOST' | 'FOUND';
  category: string;
  title: string;
  description: string;
  division: string;
  district: string;
  upazilaThana: string;
  generalLocation: string;
  eventDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RESOLVED';
  imageUrls: string[];
  preferredContactMethod: 'PHONE' | 'EMAIL' | 'PLATFORM_CLAIM';
  secretQuestion?: string;
  reward?: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  viewsCount: number;
  rejectionReason?: string;
  moderationNotes?: string;
}

export interface PrivateContact {
  postId: string;
  userId: string;
  contactMethod: string;
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimDocument {
  id: string;
  postId: string;
  postTitle: string;
  claimantUserId: string;
  claimantName: string;
  verificationDetails: string;
  contactMethod: string;
  contactInfo: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
  moderatorNotes?: string;
  finderNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDocument {
  id: string;
  postId: string;
  postTitle: string;
  reporterUserId: string;
  reporterName: string;
  reason: string;
  description: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ModerationLog {
  id: string;
  actorUid: string;
  actorName: string;
  action: string;
  targetType: 'POST' | 'USER' | 'CLAIM' | 'REPORT' | 'SETTINGS' | 'DATABASE';
  targetId: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface SiteSettings {
  id: 'default';
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  requirePostApproval: boolean;
  maxImagesPerPost: number;
  allowedImageTypes: string[];
  maxImageSize: number; // in bytes (e.g. 2 * 1024 * 1024)
  defaultLanguage: 'bn' | 'en';
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  id: 'default',
  siteName: 'Peyechi (পেয়েছি)',
  siteDescription: "Bangladesh's Lost & Found Network",
  supportEmail: 'support@peyechi.bd',
  maintenanceMode: false,
  allowNewRegistrations: true,
  requirePostApproval: false,
  maxImagesPerPost: 3,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxImageSize: 2 * 1024 * 1024,
  defaultLanguage: 'bn',
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

const LOCAL_POSTS_KEY = 'peyechi_posts_v2';
const LOCAL_USERS_KEY = 'peyechi_users_v2';
const LOCAL_CLAIMS_KEY = 'peyechi_claims_v2';
const LOCAL_REPORTS_KEY = 'peyechi_reports_v2';
const LOCAL_LOGS_KEY = 'peyechi_logs_v2';
const LOCAL_SETTINGS_KEY = 'peyechi_settings_v2';
const LOCAL_CONTACTS_KEY = 'peyechi_contacts_v2';

export const firebaseService = {
  // SITE SETTINGS
  getSettings: async (): Promise<SiteSettings> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDoc(doc(db, 'siteSettings', 'default'));
        if (snap.exists()) {
          return snap.data() as SiteSettings;
        }
        await setDoc(doc(db, 'siteSettings', 'default'), DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
      } catch (err) {
        console.warn('Could not read site settings from Firestore, using default:', err);
      }
    }
    const local = localStorage.getItem(LOCAL_SETTINGS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        // use default
      }
    }
    return DEFAULT_SETTINGS;
  },

  updateSettings: async (settings: Partial<SiteSettings>, actor: { uid: string; name: string }): Promise<SiteSettings> => {
    const current = await firebaseService.getSettings();
    const updated: SiteSettings = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.name
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'siteSettings', 'default'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'siteSettings/default');
      }
    }
    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(updated));

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: 'UPDATE_SETTINGS',
      targetType: 'SETTINGS',
      targetId: 'default',
      reason: 'Site settings modified by admin',
      timestamp: new Date().toISOString()
    });

    return updated;
  },

  // POSTS
  getPosts: async (options?: {
    status?: PostDocument['status'] | 'ALL';
    postType?: 'LOST' | 'FOUND' | 'ALL';
    category?: string;
    division?: string;
    userId?: string;
    limitCount?: number;
  }): Promise<PostDocument[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'posts');
        const constraints = [];

        if (options?.status && options.status !== 'ALL') {
          constraints.push(where('status', '==', options.status));
        }
        if (options?.postType && options.postType !== 'ALL') {
          constraints.push(where('postType', '==', options.postType));
        }
        if (options?.category && options.category !== 'all') {
          constraints.push(where('category', '==', options.category));
        }
        if (options?.division) {
          constraints.push(where('division', '==', options.division));
        }
        if (options?.userId) {
          constraints.push(where('userId', '==', options.userId));
        }

        constraints.push(orderBy('createdAt', 'desc'));
        if (options?.limitCount) {
          constraints.push(limit(options.limitCount));
        }

        const q = query(colRef, ...constraints);
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostDocument));
      } catch (err) {
        console.warn('Firestore query error, falling back to local cache:', err);
      }
    }

    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    let list: PostDocument[] = raw ? JSON.parse(raw) : [];
    if (options?.status && options.status !== 'ALL') {
      list = list.filter((p) => p.status === options.status);
    }
    if (options?.postType && options.postType !== 'ALL') {
      list = list.filter((p) => p.postType === options.postType);
    }
    if (options?.category && options.category !== 'all') {
      list = list.filter((p) => p.category === options.category);
    }
    if (options?.division) {
      list = list.filter((p) => p.division === options.division);
    }
    if (options?.userId) {
      list = list.filter((p) => p.userId === options.userId);
    }
    return list;
  },

  getPostById: async (id: string): Promise<PostDocument | null> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDoc(doc(db, 'posts', id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() } as PostDocument;
          try {
            await updateDoc(doc(db, 'posts', id), { viewsCount: (data.viewsCount || 0) + 1 });
          } catch {
            // non-fatal
          }
          return data;
        }
      } catch (err) {
        console.warn('Error reading post by ID:', err);
      }
    }
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    const list: PostDocument[] = raw ? JSON.parse(raw) : [];
    const item = list.find((p) => p.id === id);
    if (item) {
      item.viewsCount = (item.viewsCount || 0) + 1;
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(list));
      return item;
    }
    return null;
  },

  createPost: async (
    post: Omit<PostDocument, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'status'>,
    privateContact: { contactMethod: string; contactInfo: string },
    actor: { uid: string; name: string }
  ): Promise<PostDocument> => {
    const settings = await firebaseService.getSettings();
    const status: PostDocument['status'] = settings.requirePostApproval ? 'PENDING' : 'APPROVED';

    const newPost: PostDocument = {
      ...post,
      id: 'post_' + Date.now(),
      status,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        const batch = writeBatch(db);
        const postDocRef = doc(db, 'posts', newPost.id);
        batch.set(postDocRef, newPost);

        const contactDocRef = doc(db, 'privateContacts', newPost.id);
        const contactData: PrivateContact = {
          postId: newPost.id,
          userId: newPost.userId,
          contactMethod: privateContact.contactMethod,
          contactInfo: privateContact.contactInfo,
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt
        };
        batch.set(contactDocRef, contactData);

        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'posts/' + newPost.id);
      }
    }

    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    const list: PostDocument[] = raw ? JSON.parse(raw) : [];
    list.unshift(newPost);
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(list));

    const rawContacts = localStorage.getItem(LOCAL_CONTACTS_KEY);
    const contacts: Record<string, PrivateContact> = rawContacts ? JSON.parse(rawContacts) : {};
    contacts[newPost.id] = {
      postId: newPost.id,
      userId: newPost.userId,
      contactMethod: privateContact.contactMethod,
      contactInfo: privateContact.contactInfo,
      createdAt: newPost.createdAt,
      updatedAt: newPost.updatedAt
    };
    localStorage.setItem(LOCAL_CONTACTS_KEY, JSON.stringify(contacts));

    return newPost;
  },

  updatePost: async (
    id: string,
    updates: Partial<PostDocument>,
    actor: { uid: string; name: string }
  ): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const payload = { ...updates, updatedAt: timestamp };

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'posts', id), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'posts/' + id);
      }
    }

    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (raw) {
      const list: PostDocument[] = JSON.parse(raw);
      const index = list.findIndex((p) => p.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload };
        localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(list));
      }
    }

    return true;
  },

  deletePost: async (id: string, actor: { uid: string; name: string }, reason = 'Deleted by admin'): Promise<boolean> => {
    if (isFirebaseConfigured() && db) {
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'posts', id));
        batch.delete(doc(db, 'privateContacts', id));
        await batch.commit();
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'posts/' + id);
      }
    }

    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (raw) {
      const list: PostDocument[] = JSON.parse(raw);
      const filtered = list.filter((p) => p.id !== id);
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(filtered));
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: 'DELETE_POST',
      targetType: 'POST',
      targetId: id,
      reason,
      timestamp: new Date().toISOString()
    });

    return true;
  },

  deleteMultiplePosts: async (ids: string[], actor: { uid: string; name: string }, reason = 'Bulk deleted by admin'): Promise<{ successCount: number; failedCount: number }> => {
    let successCount = 0;
    let failedCount = 0;

    if (isFirebaseConfigured() && db) {
      try {
        const CHUNK_SIZE = 50;
        for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
          const chunk = ids.slice(i, i + CHUNK_SIZE);
          const batch = writeBatch(db);
          for (const id of chunk) {
            batch.delete(doc(db, 'posts', id));
            batch.delete(doc(db, 'privateContacts', id));
          }
          await batch.commit();
          successCount += chunk.length;
        }
      } catch (err) {
        console.error('Batch deletion error:', err);
        failedCount = ids.length - successCount;
      }
    } else {
      successCount = ids.length;
    }

    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (raw) {
      const list: PostDocument[] = JSON.parse(raw);
      const idSet = new Set(ids);
      const filtered = list.filter((p) => !idSet.has(p.id));
      localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(filtered));
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: 'BULK_DELETE_POSTS',
      targetType: 'POST',
      targetId: `${ids.length} posts`,
      reason: `${reason} (${successCount} succeeded, ${failedCount} failed)`,
      timestamp: new Date().toISOString(),
      metadata: { deletedCount: successCount, failedCount }
    });

    return { successCount, failedCount };
  },

  // USERS
  getUsers: async (): Promise<UserProfile[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
      } catch (err) {
        console.warn('Error reading users from Firestore:', err);
      }
    }
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  updateUserRole: async (uid: string, newRole: UserProfile['role'], actor: { uid: string; name: string }): Promise<boolean> => {
    const timestamp = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'users', uid), { role: newRole, updatedAt: timestamp });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'users/' + uid);
      }
    }

    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list: UserProfile[] = JSON.parse(raw);
      const idx = list.findIndex((u) => u.uid === uid);
      if (idx !== -1) {
        list[idx].role = newRole;
        list[idx].updatedAt = timestamp;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
      }
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: 'CHANGE_USER_ROLE',
      targetType: 'USER',
      targetId: uid,
      reason: `Changed role to ${newRole}`,
      timestamp
    });

    return true;
  },

  updateUserStatus: async (uid: string, newStatus: UserProfile['status'], actor: { uid: string; name: string }, reason = ''): Promise<boolean> => {
    const timestamp = new Date().toISOString();

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'users', uid), { status: newStatus, updatedAt: timestamp });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'users/' + uid);
      }
    }

    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list: UserProfile[] = JSON.parse(raw);
      const idx = list.findIndex((u) => u.uid === uid);
      if (idx !== -1) {
        list[idx].status = newStatus;
        list[idx].updatedAt = timestamp;
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
      }
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: newStatus === 'SUSPENDED' ? 'SUSPEND_USER' : 'REACTIVATE_USER',
      targetType: 'USER',
      targetId: uid,
      reason: reason || (newStatus === 'SUSPENDED' ? 'Account suspended by admin' : 'Account reactivated by admin'),
      timestamp
    });

    return true;
  },

  // CLAIMS
  getClaims: async (postId?: string): Promise<ClaimDocument[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const colRef = collection(db, 'claims');
        const q = postId ? query(colRef, where('postId', '==', postId)) : query(colRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ClaimDocument));
      } catch (err) {
        console.warn('Error reading claims from Firestore:', err);
      }
    }
    const raw = localStorage.getItem(LOCAL_CLAIMS_KEY);
    const list: ClaimDocument[] = raw ? JSON.parse(raw) : [];
    return postId ? list.filter((c) => c.postId === postId) : list;
  },

  createClaim: async (claim: Omit<ClaimDocument, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<ClaimDocument> => {
    const newClaim: ClaimDocument = {
      ...claim,
      id: 'claim_' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'claims', newClaim.id), newClaim);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'claims/' + newClaim.id);
      }
    }

    const raw = localStorage.getItem(LOCAL_CLAIMS_KEY);
    const list: ClaimDocument[] = raw ? JSON.parse(raw) : [];
    list.unshift(newClaim);
    localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(list));

    return newClaim;
  },

  updateClaimStatus: async (
    id: string,
    status: ClaimDocument['status'],
    actor: { uid: string; name: string },
    moderatorNotes = ''
  ): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const updates: Partial<ClaimDocument> = {
      status,
      updatedAt: timestamp,
      moderatorNotes: moderatorNotes || undefined
    };

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'claims', id), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'claims/' + id);
      }
    }

    const raw = localStorage.getItem(LOCAL_CLAIMS_KEY);
    if (raw) {
      const list: ClaimDocument[] = JSON.parse(raw);
      const idx = list.findIndex((c) => c.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(LOCAL_CLAIMS_KEY, JSON.stringify(list));
      }
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: `CLAIM_${status}`,
      targetType: 'CLAIM',
      targetId: id,
      reason: moderatorNotes,
      timestamp
    });

    return true;
  },

  // REPORTS
  getReports: async (): Promise<ReportDocument[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReportDocument));
      } catch (err) {
        console.warn('Error reading reports from Firestore:', err);
      }
    }
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  createReport: async (report: Omit<ReportDocument, 'id' | 'createdAt' | 'status'>): Promise<ReportDocument> => {
    const newReport: ReportDocument = {
      ...report,
      id: 'rep_' + Date.now(),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'reports', newReport.id), newReport);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, 'reports/' + newReport.id);
      }
    }

    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    const list: ReportDocument[] = raw ? JSON.parse(raw) : [];
    list.unshift(newReport);
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(list));

    return newReport;
  },

  resolveReport: async (id: string, status: 'RESOLVED' | 'DISMISSED', actor: { uid: string; name: string }, adminNotes = ''): Promise<boolean> => {
    const timestamp = new Date().toISOString();
    const updates = {
      status,
      adminNotes,
      resolvedAt: timestamp,
      resolvedBy: actor.name
    };

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'reports', id), updates);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'reports/' + id);
      }
    }

    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    if (raw) {
      const list: ReportDocument[] = JSON.parse(raw);
      const idx = list.findIndex((r) => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(list));
      }
    }

    await firebaseService.logActivity({
      actorUid: actor.uid,
      actorName: actor.name,
      action: `REPORT_${status}`,
      targetType: 'REPORT',
      targetId: id,
      reason: adminNotes,
      timestamp
    });

    return true;
  },

  // MODERATION LOGS
  getModerationLogs: async (limitCount = 100): Promise<ModerationLog[]> => {
    if (isFirebaseConfigured() && db) {
      try {
        const snap = await getDocs(query(collection(db, 'moderationLogs'), orderBy('timestamp', 'desc'), limit(limitCount)));
        return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ModerationLog));
      } catch (err) {
        console.warn('Error reading moderation logs from Firestore:', err);
      }
    }
    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  },

  logActivity: async (log: Omit<ModerationLog, 'id'>): Promise<void> => {
    const newLog: ModerationLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)
    };

    if (isFirebaseConfigured() && db) {
      try {
        await setDoc(doc(db, 'moderationLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Failed to record moderation log in Firestore:', err);
      }
    }

    const raw = localStorage.getItem(LOCAL_LOGS_KEY);
    const list: ModerationLog[] = raw ? JSON.parse(raw) : [];
    list.unshift(newLog);
    if (list.length > 500) list.pop();
    localStorage.setItem(LOCAL_LOGS_KEY, JSON.stringify(list));
  },

  // IMAGE STORAGE WITH FIREBASE STORAGE
  uploadImage: async (
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP.`);
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new Error(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed: 2MB.`);
    }

    if (isFirebaseConfigured() && storage) {
      const ext = file.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const storagePath = `posts/${userId}/${cleanFileName}`;
      const storageRef = ref(storage, storagePath);

      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: { uploadedBy: userId }
        });

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) onProgress(Math.round(pct));
          },
          (error) => {
            console.error('Firebase Storage upload error:', error);
            reject(new Error(`Storage upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      });
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (onProgress) onProgress(100);
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  },

  deleteImageFile: async (imageUrl: string): Promise<boolean> => {
    if (isFirebaseConfigured() && storage && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
        return true;
      } catch (err) {
        console.warn('Error deleting file from Firebase Storage:', err);
      }
    }
    return true;
  },

  // DATABASE TOOLS & BACKUPS
  exportCollectionToJSON: async (collectionName: 'posts' | 'users' | 'claims' | 'reports' | 'all'): Promise<string> => {
    let data: unknown;
    if (collectionName === 'posts') {
      data = await firebaseService.getPosts({ status: 'ALL' });
    } else if (collectionName === 'users') {
      data = await firebaseService.getUsers();
    } else if (collectionName === 'claims') {
      data = await firebaseService.getClaims();
    } else if (collectionName === 'reports') {
      data = await firebaseService.getReports();
    } else {
      const [posts, users, claims, reports, settings, logs] = await Promise.all([
        firebaseService.getPosts({ status: 'ALL' }),
        firebaseService.getUsers(),
        firebaseService.getClaims(),
        firebaseService.getReports(),
        firebaseService.getSettings(),
        firebaseService.getModerationLogs(200)
      ]);
      data = {
        exportedAt: new Date().toISOString(),
        site: 'Peyechi Lost & Found Bangladesh',
        posts,
        users,
        claims,
        reports,
        settings,
        logs
      };
    }
    return JSON.stringify(data, null, 2);
  },

  deleteAllPosts: async (confirmationPhrase: string, actor: { uid: string; name: string }): Promise<number> => {
    if (confirmationPhrase !== 'DELETE ALL POSTS') {
      throw new Error('Confirmation phrase does not match. Operation aborted.');
    }

    const allPosts = await firebaseService.getPosts({ status: 'ALL' });
    const postIds = allPosts.map((p) => p.id);

    if (postIds.length === 0) return 0;

    await firebaseService.deleteMultiplePosts(postIds, actor, 'Permanent whole-database purge: DELETE ALL POSTS');
    return postIds.length;
  }
};
