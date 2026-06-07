import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  User,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** True when a Google client ID is configured and sign-in can be attempted. */
  isAuthAvailable: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isAuthAvailable: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google OAuth client IDs are read from public env vars. They are not secrets
  // and are safe to expose to the client. PKCE, state and nonce are handled
  // internally by the provider hook, which fixes the CSRF/nonce weaknesses of a
  // hand-rolled OAuth URL.
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  const isAuthAvailable = !!(webClientId || iosClientId || androidClientId);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    iosClientId,
    androidClientId,
  });

  // Track auth state from Firebase.
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // Exchange the Google id_token for a Firebase credential when the auth
  // request completes successfully.
  useEffect(() => {
    const completeSignIn = async () => {
      if (response?.type !== "success") {
        return;
      }
      if (!auth || !db) {
        console.warn("Firebase is not configured. Skipping Google sign-in.");
        return;
      }

      const idToken = response.params?.id_token;
      if (!idToken) {
        console.error("Google sign-in did not return an id_token");
        return;
      }

      try {
        setLoading(true);
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);

        const u = auth.currentUser;
        if (u) {
          await setDoc(
            doc(db, "users", u.uid),
            {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              lastSeen: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (e) {
        console.error("Google sign-in error", e);
      } finally {
        setLoading(false);
      }
    };

    void completeSignIn();
  }, [response]);

  const signInWithGoogle = async () => {
    if (!isAuthAvailable) {
      console.warn(
        "No Google client ID configured. Set EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (and/or platform-specific IDs).",
      );
      return;
    }
    if (!request) {
      // The auth request is still loading; ignore the tap.
      return;
    }
    await promptAsync();
  };

  const signOut = async () => {
    if (!auth) {
      return;
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthAvailable, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
