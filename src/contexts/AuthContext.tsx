import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { usersService, User as AppUser } from '../services/usersService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  appUser: AppUser | null; // Firestore user record
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  appUser: null
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Try to fetch from users collection by authUid first, then fallback to admins by email
          const fetched = await usersService.getUserByAuthUidOrAdmin(user.uid, user.email || undefined);
          setAppUser(fetched);
        } catch (e) {
          console.error('Failed to fetch app user for auth user:', e);
          setAppUser(null);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    appUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};