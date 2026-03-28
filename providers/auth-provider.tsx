import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

import { auth, db } from '@/lib/firebase';
import { UserProfile } from '@/lib/types';

type AuthResult = {
  ok: boolean;
  message: string;
};

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  phone: string;
};

type AuthContextValue = {
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updateProfileDetails: (input: Pick<UserProfile, 'name' | 'phone'>) => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const adminEmails = (process.env.EXPO_PUBLIC_ADMIN_EMAILS ?? '')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

async function ensureUserProfile(user: User): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);

  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }

  const inferredRole: UserProfile['role'] = adminEmails.includes(user.email?.toLowerCase() ?? '')
    ? 'admin'
    : 'customer';

  const profile: UserProfile = {
    id: user.uid,
    email: user.email ?? '',
    name: user.displayName ?? '',
    phone: '',
    role: inferredRole,
  };

  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
  });

  return profile;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await ensureUserProfile(nextUser);
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true, message: 'Signed in successfully.' };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'Unable to sign in.' };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({ email, password, name, phone }: SignUpInput): Promise<AuthResult> => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });

      const role: UserProfile['role'] = adminEmails.includes(email.trim().toLowerCase())
        ? 'admin'
        : 'customer';

      const profile: UserProfile = {
        id: credential.user.uid,
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        role,
      };

      await setDoc(doc(db, 'users', credential.user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
      });

      setUserProfile(profile);
      return { ok: true, message: 'Account created successfully.' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to create account.',
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    if (!email.trim()) {
      return { ok: false, message: 'Enter your email address first.' };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { ok: true, message: 'Password reset email sent.' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to send reset email.',
      };
    }
  };

  const updateProfileDetails = async ({
    name,
    phone,
  }: Pick<UserProfile, 'name' | 'phone'>): Promise<AuthResult> => {
    if (!auth.currentUser) {
      return { ok: false, message: 'You must be signed in.' };
    }

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() });
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        name: name.trim(),
        phone: phone.trim(),
        updatedAt: serverTimestamp(),
      });

      setUserProfile((current) =>
        current
          ? {
              ...current,
              name: name.trim(),
              phone: phone.trim(),
            }
          : current
      );

      return { ok: true, message: 'Profile updated.' };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : 'Unable to update profile.',
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin: userProfile?.role === 'admin',
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfileDetails,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
