import Constants from "expo-constants";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import { FirebaseStorage, getStorage } from "firebase/storage";

// Firebase config loader
// Priority: process.env -> Expo config extra (Constants.expoConfig.extra) -> empty string
const getEnv = (key: string) => {
  const fromProcess = (process && (process.env as any)[key]) as
    | string
    | undefined;
  const fromExpo = (Constants.expoConfig &&
    (Constants.expoConfig.extra as any)?.[key]) as string | undefined;
  return fromProcess ?? fromExpo ?? "";
};

const firebaseConfig = {
  apiKey: getEnv("FIREBASE_API_KEY"),
  authDomain: getEnv("FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("FIREBASE_APP_ID"),
};

// Optional runtime check helper
export const isFirebaseConfigured = () => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
};

// Initialize Firebase only when the app has usable credentials. This keeps local
// development and static web export from crashing before credentials are added.
const app: FirebaseApp | null = isFirebaseConfigured()
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null;

const auth: Auth | null = app ? getAuth(app) : null;
const db: Firestore | null = app ? getFirestore(app) : null;
const storage: FirebaseStorage | null = app ? getStorage(app) : null;

export { app, auth, db, storage, firebaseConfig };
