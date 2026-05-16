import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../../config/firebase";

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const CLIENT_ID =
        process.env.EXPO_GOOGLE_CLIENT_ID ?? "<GOOGLE_OAUTH_CLIENT_ID>"; // replace
      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
        redirectUri,
      )}&response_type=id_token&scope=profile%20email&nonce=${Math.random().toString(36).substring(2, 15)}`;

      const result = await AuthSession.startAsync({ authUrl });

      if (result.type === "success" && (result as any).params?.id_token) {
        const idToken = (result as any).params.id_token;
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);

        if (auth.currentUser) {
          const u = auth.currentUser;
          await setDoc(
            doc(db, "users", u.uid),
            {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              lastSeen: new Date(),
            },
            { merge: true },
          );
        }
      }
    } catch (e) {
      console.error("Google sign-in error", e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
