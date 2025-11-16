
// src/hooks/use-auth.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { onIdTokenChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
import { PageLoader } from '@/components/page-loader';
import { createUserProfile, getUserProfile, UserProfile } from '@/services/user-service';
import { getPremiumStatus } from '@/services/premium-service';
import { useOnlineStatus } from './use-online-status';

// Interface pour les données additionnelles de l'utilisateur
export interface ExtendedUser extends User {
    profile?: UserProfile | null;
    isPremium: boolean;
    premiumExpiresAt?: string | null;
}

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<any>;
  signup: (email: string, pass: string, additionalData: any) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function translateFirebaseAuthError(errorCode: string): string {
    switch (errorCode) {
        case 'auth/invalid-email':
            return "L'adresse e-mail n'est pas valide.";
        case 'auth/user-disabled':
            return "Ce compte a été désactivé.";
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return "L'adresse e-mail ou le mot de passe est incorrect.";
        case 'auth/email-already-in-use':
            return "Cette adresse e-mail est déjà utilisée par un autre compte.";
        case 'auth/weak-password':
            return "Le mot de passe est trop faible. Il doit comporter au moins 6 caractères.";
        case 'auth/network-request-failed':
            return "Erreur de réseau. Veuillez vérifier votre connexion internet.";
        case 'auth/too-many-requests':
            return "Trop de tentatives. Veuillez réessayer plus tard.";
        default:
            return "Une erreur inattendue est survenue. Veuillez réessayer.";
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isOnline = useOnlineStatus();

  const fetchUserProfile = useCallback(async (firebaseUser: User): Promise<ExtendedUser> => {
      const profile = await getUserProfile(firebaseUser.uid);
      const premiumStatus = await getPremiumStatus(firebaseUser.uid);

      return { 
          ...firebaseUser, 
          profile: profile as UserProfile,
          isPremium: premiumStatus.isPremium,
          expiresAt: premiumStatus.expiresAt,
       };
  }, []);
  
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (isOnline) {
            try {
              const extendedUser = await fetchUserProfile(firebaseUser);
              setUser(extendedUser);
            } catch (error) {
              console.error("Auth Hook Error (Online):", error);
              // Fallback for online errors - show user but with possibly incomplete profile
              setUser({ ...firebaseUser, isPremium: false, profile: null });
            } finally {
                setLoading(false);
            }
        } else {
            // Offline mode: use cached user data without fetching profile
            setUser({ ...firebaseUser, isPremium: false, profile: null });
            setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile, isOnline]);


  const login = async (email: string, pass: string) => {
    try {
        return await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        if (error instanceof FirebaseError) {
            throw new Error(translateFirebaseAuthError(error.code));
        }
        throw error;
    }
  };

  const signup = async (email: string, pass: string, additionalData: any) => {
    try {
        const { firstName, lastName, ...profileData } = additionalData;
        const displayName = `${firstName} ${lastName}`;

        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const firebaseUser = userCredential.user;

        if (firebaseUser) {
            await updateProfile(firebaseUser, { displayName });

            await createUserProfile(firebaseUser.uid, {
              displayName,
              email,
              ...profileData
            });
        }
        await refreshUserProfile();
        return userCredential;
    } catch (error) {
        if (error instanceof FirebaseError) {
            throw new Error(translateFirebaseAuthError(error.code));
        }
        throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    await signOut(auth);
    router.push('/login');
  };
  
  const sendPasswordReset = async (email: string) => {
    try {
        return await sendPasswordResetEmail(auth, email);
    } catch (error) {
        if (error instanceof FirebaseError) {
            throw new Error(translateFirebaseAuthError(error.code));
        }
        throw error;
    }
  }

  const refreshUserProfile = async () => {
    if (auth.currentUser && isOnline) {
        const extendedUser = await fetchUserProfile(auth.currentUser);
        setUser(extendedUser);
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    sendPasswordReset,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
