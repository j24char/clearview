import {
  ActionCodeSettings,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';

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

function getPasswordResetActionCodeSettings(): ActionCodeSettings {
  const redirectUrl =
    process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL ??
    (typeof window !== 'undefined' ? window.location.origin : undefined) ??
    'https://clearview-3b591.firebaseapp.com';

  return {
    url: `${redirectUrl.replace(/\/$/, '')}/signin`,
    handleCodeInApp: true,
  };
}

async function ensureUserProfile(
  user: User,
  existingProfile: UserProfile | null,
  initialData?: { name?: string; phone?: string } // Add this parameter
): Promise<UserProfile> {
  const ref = doc(db, 'users', user.uid);
  const snapshot = await getDoc(ref);

  const inferredRole: UserProfile['role'] = adminEmails.includes(user.email?.toLowerCase() ?? '')
    ? 'admin'
    : 'customer';

  // Even if the document exists, merge any new fields passed during registration
  if (snapshot.exists()) {
    const data = snapshot.data() as Partial<UserProfile>;
    const profile: UserProfile = {
      id: user.uid,
      email: data.email ?? existingProfile?.email ?? user.email ?? '',
      name: initialData?.name || data.name || existingProfile?.name || user.displayName || '',
      phone: initialData?.phone || data.phone || existingProfile?.phone || '',
      role: data.role ?? existingProfile?.role ?? inferredRole,
    };

    // If new profile fields were passed via sign up, update the document
    if (initialData?.name || initialData?.phone) {
      await setDoc(ref, { ...profile, updatedAt: serverTimestamp() }, { merge: true });
    }
    return profile;
  }

  // Document does not exist yet (Brand new user registration)
  const profile: UserProfile = {
    id: user.uid,
    email: user.email ?? '',
    name: initialData?.name || user.displayName || '',
    phone: initialData?.phone || '',
    role: inferredRole,
  };

  await setDoc(
    ref,
    {
      ...profile,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return profile;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const userProfileRef = useRef<UserProfile | null>(null);
  const signUpInputRef = useRef<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        userProfileRef.current = null;
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        // Consume the ref parameters if they exist from an active sign up flow
        const profile = await ensureUserProfile(
          nextUser, 
          userProfileRef.current, 
          signUpInputRef.current ?? undefined
        );
        userProfileRef.current = profile;
        setUserProfile(profile);
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        signUpInputRef.current = null; // Reset the ref container
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
      // Save these properties to the ref immediately before creation triggers state changes
      signUpInputRef.current = { name: name.trim(), phone: phone.trim() };

      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });

      return { ok: true, message: 'Account created successfully.' };
    } catch (error) {
      signUpInputRef.current = null; // Clear if it failed
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
      await sendPasswordResetEmail(auth, email.trim(), getPasswordResetActionCodeSettings());
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
