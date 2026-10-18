import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

export interface User {
  id: string;
  uid: string;
  name: string;
  displayName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN' | 'user' | 'admin';
  status: 'ACTIVE' | 'SUSPENDED';
  photoURL?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loginWithGoogle: () => Promise<void>;
  login: (emailOrPhone: string, name?: string) => Promise<void>;
  signup: (name: string, email: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
  isSuspended: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAILS = [
  'babayoyosaf@gmail.com',
  'admin@peyechi.bd'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('peyechi_user_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo user for instant testing without login
    return {
      id: 'usr_bd_101',
      uid: 'usr_bd_101',
      name: 'Tanvir Hossain',
      displayName: 'Tanvir Hossain',
      email: 'tanvir@gmail.com',
      phone: '+880 1712-345678',
      phoneNumber: '+880 1712-345678',
      role: 'user',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile with Firestore when Firebase Auth changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const isSuperAdmin = ADMIN_EMAILS.includes(fbUser.email?.toLowerCase() || '');
        const role = isSuperAdmin ? 'ADMIN' : 'USER';
        
        const profile: User = {
          id: fbUser.uid,
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
          displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
          email: fbUser.email || '',
          photoURL: fbUser.photoURL || undefined,
          phone: fbUser.phoneNumber || undefined,
          phoneNumber: fbUser.phoneNumber || undefined,
          role: isSuperAdmin ? 'admin' : 'user',
          status: 'ACTIVE',
          createdAt: new Date().toISOString()
        };

        // If Firestore is available, read or write user profile
        if (db) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              const data = userSnap.data();
              profile.role = (data.role?.toLowerCase() === 'admin' || isSuperAdmin) ? 'admin' : 'user';
              profile.status = data.status || 'ACTIVE';
            } else {
              await setDoc(userDocRef, {
                uid: fbUser.uid,
                displayName: profile.displayName,
                email: profile.email,
                photoURL: fbUser.photoURL || '',
                phoneNumber: fbUser.phoneNumber || '',
                preferredLanguage: 'bn',
                role,
                status: 'ACTIVE',
                emailVerified: fbUser.emailVerified || false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              });
            }

            // Write admin document entry if superadmin
            if (isSuperAdmin) {
              await setDoc(doc(db, 'admins', fbUser.uid), {
                email: fbUser.email,
                grantedAt: new Date().toISOString()
              });
            }
          } catch (err) {
            console.warn('Could not sync user profile to Firestore:', err);
          }
        }

        setUser(profile);
        localStorage.setItem('peyechi_user_v2', JSON.stringify(profile));
      } else {
        // Keep cached user if not explicitly logged out
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error('Firebase Authentication is not available.');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const login = async (emailOrPhone: string, name?: string) => {
    const isSuperAdmin = ADMIN_EMAILS.includes(emailOrPhone.toLowerCase()) || emailOrPhone.toLowerCase().includes('admin');
    const newUser: User = {
      id: 'usr_' + Date.now(),
      uid: 'usr_' + Date.now(),
      name: name || (isSuperAdmin ? 'System Admin' : 'Community Member'),
      displayName: name || (isSuperAdmin ? 'System Admin' : 'Community Member'),
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@peyechi.bd`,
      phone: emailOrPhone.startsWith('+880') || emailOrPhone.startsWith('01') ? emailOrPhone : '+880 1812-998877',
      phoneNumber: emailOrPhone.startsWith('+880') || emailOrPhone.startsWith('01') ? emailOrPhone : '+880 1812-998877',
      role: isSuperAdmin ? 'admin' : 'user',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('peyechi_user_v2', JSON.stringify(newUser));
  };

  const signup = async (name: string, email: string, phone: string) => {
    const isSuperAdmin = ADMIN_EMAILS.includes(email.toLowerCase()) || email.toLowerCase().includes('admin');
    const newUser: User = {
      id: 'usr_' + Date.now(),
      uid: 'usr_' + Date.now(),
      name,
      displayName: name,
      email,
      phone,
      phoneNumber: phone,
      role: isSuperAdmin ? 'admin' : 'user',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('peyechi_user_v2', JSON.stringify(newUser));
  };

  const logout = async () => {
    if (auth && firebaseUser) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Signout error:', err);
      }
    }
    setUser(null);
    localStorage.removeItem('peyechi_user_v2');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || ADMIN_EMAILS.includes(user?.email?.toLowerCase() || '');
  const isModerator = isAdmin || user?.role === 'MODERATOR' || (user?.role as string) === 'moderator';
  const isSuspended = user?.status === 'SUSPENDED';

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loginWithGoogle,
        login,
        signup,
        logout,
        isAdmin,
        isModerator,
        isSuspended,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
