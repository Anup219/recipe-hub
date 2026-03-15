import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';

import { FirebaseError } from 'firebase/app';

import { auth } from '../../lib/firebase';
import { StorageService } from '../utils/localStorage';
import { User } from '../types/recipe';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/user-not-found':        return 'No account found with this email.';
      case 'auth/wrong-password':         return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':     return 'Incorrect email or password.';
      case 'auth/email-already-in-use':   return 'An account with this email already exists.';
      case 'auth/weak-password':          return 'Password must be at least 6 characters.';
      case 'auth/invalid-email':          return 'Please enter a valid email address.';
      case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.';
      case 'auth/network-request-failed': return 'Network error. Check your connection.';
      default: return error.message;
    }
  }
  return 'Something went wrong. Please try again.';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state — persists across refreshes automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName ?? firebaseUser.email?.split('@')[0] ?? 'Chef',
          email: firebaseUser.email ?? '',
          favorites: StorageService.getFavorites(),
          createdRecipes: StorageService.getCustomRecipes().map(r => r.id),
        };
        setUser(appUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged handles setting state
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set the display name on the Firebase user
    await updateProfile(result.user, { displayName: name });
    // Force refresh so onAuthStateChanged picks up displayName
    const appUser: User = {
      id: result.user.uid,
      name,
      email,
      favorites: [],
      createdRecipes: [],
    };
    setUser(appUser);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {

    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, resetPassword, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
