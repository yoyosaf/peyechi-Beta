import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (emailOrPhone: string, name?: string) => void;
  signup: (name: string, email: string, phone: string) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('peyechi_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default demo user for seamless testing
    return {
      id: 'usr_bd_101',
      name: 'Tanvir Hossain',
      email: 'tanvir@gmail.com',
      phone: '+880 1712-345678',
      role: 'user',
      createdAt: new Date().toISOString()
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('peyechi_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('peyechi_user');
    }
  }, [user]);

  const login = (emailOrPhone: string, name?: string) => {
    const isAdmin = emailOrPhone.toLowerCase().includes('admin');
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name: name || (isAdmin ? 'Admin User' : 'Community Member'),
      email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone.replace(/\D/g, '')}@peyechi.bd`,
      phone: emailOrPhone.startsWith('+880') || emailOrPhone.startsWith('01') ? emailOrPhone : '+880 1812-998877',
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
  };

  const signup = (name: string, email: string, phone: string) => {
    const newUser: User = {
      id: 'usr_' + Date.now(),
      name,
      email,
      phone,
      role: email.toLowerCase().includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAdmin: user?.role === 'admin' }}>
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
