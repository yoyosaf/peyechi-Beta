import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, doc, getDocFromServer, getDoc } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  firestoreDatabaseId?: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Check runtime override first (e.g. configured via in-app diagnostics), then firebase-applet-config.json, then env vars
export const getActiveFirebaseConfig = (): FirebaseConfigParams => {
  const localSaved = localStorage.getItem('peyechi_firebase_runtime_config');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  // Use automatically provisioned firebase-applet-config.json
  if (appletConfig && appletConfig.apiKey && appletConfig.projectId) {
    return {
      apiKey: appletConfig.apiKey,
      authDomain: appletConfig.authDomain || '',
      projectId: appletConfig.projectId,
      firestoreDatabaseId: appletConfig.firestoreDatabaseId || undefined,
      storageBucket: appletConfig.storageBucket || '',
      messagingSenderId: appletConfig.messagingSenderId || '',
      appId: appletConfig.appId || '',
      measurementId: appletConfig.measurementId || ''
    };
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || undefined,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
  };
};

export const isFirebaseConfigured = (): boolean => {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config.apiKey &&
    config.projectId &&
    config.apiKey.length > 5 &&
    !config.apiKey.includes('MY_') &&
    !config.apiKey.includes('YOUR_')
  );
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

export const initializeFirebaseServices = (customConfig?: FirebaseConfigParams) => {
  const config = customConfig || getActiveFirebaseConfig();
  if (
    config.apiKey &&
    config.projectId &&
    config.apiKey.length > 5 &&
    !config.apiKey.includes('MY_') &&
    !config.apiKey.includes('YOUR_')
  ) {
    try {
      app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
      authInstance = getAuth(app);
      // Connect to the specific database instance if database ID is present
      if (config.firestoreDatabaseId) {
        dbInstance = getFirestore(app, config.firestoreDatabaseId);
      } else {
        dbInstance = getFirestore(app);
      }
      if (config.storageBucket) {
        storageInstance = getStorage(app);
      }
      console.log('✅ Firebase initialized successfully with project:', config.projectId, 'database:', config.firestoreDatabaseId || '(default)');
      return { app, auth: authInstance, db: dbInstance, storage: storageInstance };
    } catch (err) {
      console.warn('⚠️ Firebase initialization error:', err);
    }
  }
  return { app: null, auth: null, db: null, storage: null };
};

// Initialize on module load
const initResult = initializeFirebaseServices();

export const appInstance: FirebaseApp | null = initResult.app;
export const auth: Auth | null = initResult.auth;
export const db: Firestore | null = initResult.db;
export const storage: FirebaseStorage | null = initResult.storage;

// Diagnostics test function to test real connection directly to Firestore servers
export const testFirestoreConnection = async (): Promise<{
  connected: boolean;
  latencyMs?: number;
  projectId?: string;
  databaseId?: string;
  error?: string;
}> => {
  const config = getActiveFirebaseConfig();
  if (!isFirebaseConfigured() || !db) {
    return {
      connected: false,
      error: 'Firebase is not configured with valid API Key and Project ID. Running in local fallback mode.'
    };
  }

  const start = performance.now();
  try {
    // Attempt a direct read from server for siteSettings or status doc
    const testDocRef = doc(db, 'siteSettings', 'default');
    await getDocFromServer(testDocRef);
    const latency = Math.round(performance.now() - start);
    return {
      connected: true,
      latencyMs: latency,
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId
    };
  } catch (err: unknown) {
    const latency = Math.round(performance.now() - start);
    const errorMsg = (err as Error).message || String(err);
    
    // In Firestore, if rules evaluate or if document does not exist, connection is alive!
    if (
      errorMsg.includes('permission-denied') ||
      errorMsg.includes('Missing or insufficient permissions') ||
      errorMsg.includes('not-found')
    ) {
      return {
        connected: true,
        latencyMs: latency,
        projectId: config.projectId,
        databaseId: config.firestoreDatabaseId
      };
    }

    if (errorMsg.includes('the client is offline') || errorMsg.includes('Failed to get document because the client is offline')) {
      return {
        connected: false,
        latencyMs: latency,
        projectId: config.projectId,
        databaseId: config.firestoreDatabaseId,
        error: 'Unable to reach Cloud Firestore servers. Check network connection or database provision status.'
      };
    }

    return {
      connected: false,
      latencyMs: latency,
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId,
      error: errorMsg
    };
  }
};

// Error Context Handler
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuthUser = authInstance ? authInstance.currentUser : null;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuthUser?.uid || null,
      email: currentAuthUser?.email || null,
      emailVerified: currentAuthUser?.emailVerified || null,
      isAnonymous: currentAuthUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Operation Failed:', JSON.stringify(errInfo, null, 2));
  throw new Error(JSON.stringify(errInfo));
}
